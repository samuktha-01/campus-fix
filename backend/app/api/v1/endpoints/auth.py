"""Authentication and authorization endpoints (register, login, logout, me, refresh)."""

from datetime import datetime, timezone
from fastapi import APIRouter, Depends, status
import jwt
from jwt.exceptions import PyJWTError
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.api.deps import (
    CurrentUser,
    get_current_user,
    get_db,
    require_admin,
    require_department_head,
    require_management,
    require_roles,
    require_staff,
    require_student,
)
from app.core.config import settings
from app.core.exceptions import AppException, ForbiddenException, UnauthorizedException
from app.core.security import (
    create_access_token,
    create_refresh_token,
    get_password_hash,
    revoke_token,
    verify_password,
)
from app.models.department import Department
from app.models.user import User, UserRole
from app.schemas.auth import (
    LogoutResponse,
    RefreshTokenRequest,
    TokenResponse,
    UserLoginRequest,
    UserProfileResponse,
    UserRegisterRequest,
)

router = APIRouter()


@router.post(
    "/register",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new user",
)
async def register(
    payload: UserRegisterRequest,
    db: AsyncSession = Depends(get_db),
):
    """Register a new student account or authenticated campus user."""
    # Check if email is already taken
    existing_user = await db.execute(
        select(User).where(User.email == payload.email.lower().strip())
    )
    if existing_user.scalars().first():
        raise AppException(
            status_code=status.HTTP_409_CONFLICT,
            code="EMAIL_ALREADY_EXISTS",
            message=f"An account with email '{payload.email}' already exists.",
        )

    # Validate department if provided
    department_name = None
    if payload.department_id:
        dept_res = await db.execute(
            select(Department).where(Department.id == payload.department_id)
        )
        dept = dept_res.scalars().first()
        if not dept:
            raise AppException(
                status_code=status.HTTP_404_NOT_FOUND,
                code="DEPARTMENT_NOT_FOUND",
                message="Specified department does not exist.",
            )
        department_name = dept.name

    # Public self-registration defaults to STUDENT unless authorized
    role_to_assign = payload.role if payload.role in [UserRole.STUDENT] else UserRole.STUDENT

    new_user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=get_password_hash(payload.password),
        role=role_to_assign,
        department_id=payload.department_id,
        is_active=True,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    # Generate JWT pair
    access_token, _ = create_access_token(
        subject=new_user.id,
        role=new_user.role.value,
        department_id=str(new_user.department_id) if new_user.department_id else None,
    )
    refresh_token, _ = create_refresh_token(subject=new_user.id)

    profile = UserProfileResponse(
        id=new_user.id,
        name=new_user.name,
        email=new_user.email,
        role=new_user.role,
        department_id=new_user.department_id,
        department_name=department_name,
        is_active=new_user.is_active,
        created_at=new_user.created_at,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=profile,
    )


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive JWT tokens",
)
async def login(
    payload: UserLoginRequest,
    db: AsyncSession = Depends(get_db),
):
    """Authenticate with email and password to receive access and refresh JWTs."""
    email_clean = payload.email.lower().strip()
    result = await db.execute(
        select(User)
        .options(selectinload(User.department))
        .where(User.email == email_clean)
    )
    user = result.scalars().first()

    if not user or not verify_password(payload.password, user.password_hash):
        raise UnauthorizedException("Invalid email or password.")

    if not user.is_active:
        raise ForbiddenException("Account is disabled. Please contact your campus administrator.")

    dept_name = user.department.name if user.department else None

    # Generate JWT pair
    access_token, _ = create_access_token(
        subject=user.id,
        role=user.role.value,
        department_id=str(user.department_id) if user.department_id else None,
    )
    refresh_token, _ = create_refresh_token(subject=user.id)

    profile = UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        department_id=user.department_id,
        department_name=dept_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=profile,
    )


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
)
async def refresh_token(
    payload: RefreshTokenRequest,
    db: AsyncSession = Depends(get_db),
):
    """Exchange a valid refresh token for a newly signed access and refresh token pair."""
    try:
        claims = jwt.decode(
            payload.refresh_token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )
        if claims.get("type") != "refresh":
            raise UnauthorizedException("Token provided is not a refresh token.")
        user_id_str = claims.get("sub")
        if not user_id_str:
            raise UnauthorizedException("Malformed refresh token.")
    except (PyJWTError, ValueError):
        raise UnauthorizedException("Expired or invalid refresh token.")

    result = await db.execute(
        select(User).options(selectinload(User.department)).where(User.id == user_id_str)
    )
    user = result.scalars().first()

    if not user or not user.is_active:
        raise UnauthorizedException("User no longer exists or is inactive.")

    dept_name = user.department.name if user.department else None

    # Revoke old refresh token JTI if present
    old_jti = claims.get("jti")
    if old_jti:
        revoke_token(old_jti)

    # Issue new pair
    access_token, _ = create_access_token(
        subject=user.id,
        role=user.role.value,
        department_id=str(user.department_id) if user.department_id else None,
    )
    new_refresh_token, _ = create_refresh_token(subject=user.id)

    profile = UserProfileResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        department_id=user.department_id,
        department_name=dept_name,
        is_active=user.is_active,
        created_at=user.created_at,
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        user=profile,
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    summary="Log out and invalidate current token",
)
async def logout(current_user: CurrentUser = Depends(get_current_user)):
    """Revoke the current session JWT via the revocation blacklist."""
    if current_user.jti:
        revoke_token(current_user.jti)
    return LogoutResponse(success=True, message="Successfully logged out.")


@router.get(
    "/me",
    response_model=UserProfileResponse,
    summary="Fetch current user profile and role",
)
async def get_me(current_user: CurrentUser = Depends(get_current_user)):
    """Retrieve authenticated user details and server-verified role."""
    return UserProfileResponse(
        id=current_user.id,
        name=current_user.name,
        email=current_user.email,
        role=current_user.role,
        department_id=current_user.department_id,
        department_name=current_user.department_name,
        is_active=current_user.is_active,
        created_at=datetime.now(),  # active session
    )


# -------------------------------------------------------------------------
# Role Authorization Testing Probes
# (Validates permissions for each persona to ensure backend enforcement)
# -------------------------------------------------------------------------

@router.get("/test/student", summary="Student role check")
async def test_student_access(user: CurrentUser = Depends(require_student)):
    return {"message": "Access granted: STUDENT", "user": user.name, "role": user.role}


@router.get("/test/staff", summary="Staff role check")
async def test_staff_access(user: CurrentUser = Depends(require_staff)):
    return {"message": "Access granted: STAFF/DEPT_HEAD/ADMIN", "user": user.name, "role": user.role}


@router.get("/test/department-head", summary="Department Head role check")
async def test_dept_head_access(user: CurrentUser = Depends(require_department_head)):
    return {"message": "Access granted: DEPARTMENT_HEAD/ADMIN", "user": user.name, "role": user.role}


@router.get("/test/admin", summary="Admin role check")
async def test_admin_access(user: CurrentUser = Depends(require_admin)):
    return {"message": "Access granted: ADMIN", "user": user.name, "role": user.role}


@router.get("/test/management", summary="Management role check")
async def test_management_access(user: CurrentUser = Depends(require_management)):
    return {"message": "Access granted: MANAGEMENT/ADMIN", "user": user.name, "role": user.role}
