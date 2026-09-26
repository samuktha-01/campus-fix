"""API Dependencies: Database sessions and Authentication/RBAC guards."""

import uuid
from typing import List, Optional
from fastapi import Depends, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import PyJWTError
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db
from app.core.exceptions import ForbiddenException, UnauthorizedException
from app.core.security import is_token_revoked
from app.models.user import User, UserRole

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/login"
)


class CurrentUser:
    """Represents the authenticated user with validated database state and permissions."""

    def __init__(
        self,
        id: uuid.UUID,
        name: str,
        email: str,
        role: UserRole,
        department_id: Optional[uuid.UUID] = None,
        department_name: Optional[str] = None,
        is_active: bool = True,
        jti: Optional[str] = None,
    ):
        self.id = id
        self.name = name
        self.email = email
        self.role = role
        self.department_id = department_id
        self.department_name = department_name
        self.is_active = is_active
        self.jti = jti

    def has_role(self, *roles: UserRole) -> bool:
        """Check if user possesses any of the provided roles."""
        return self.role in roles


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> CurrentUser:
    """Validate JWT access token, check revocation, and fetch current active user from database."""
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        user_id_str: str = payload.get("sub")
        role_str: str = payload.get("role")
        token_type: str = payload.get("type")
        jti: Optional[str] = payload.get("jti")

        if not user_id_str or not role_str:
            raise UnauthorizedException("Malformed token claims")

        if token_type != "access":
            raise UnauthorizedException("Invalid token type for API access")

        if jti and is_token_revoked(jti):
            raise UnauthorizedException("Session has been terminated. Please log in again.")

        user_id = uuid.UUID(user_id_str)
    except (PyJWTError, ValueError):
        raise UnauthorizedException("Invalid or expired authentication token")

    # Fetch user from database with department eager loaded
    result = await db.execute(
        select(User).options(selectinload(User.department)).where(User.id == user_id)
    )
    user = result.scalars().first()

    if not user:
        raise UnauthorizedException("User associated with this token no longer exists")

    if not user.is_active:
        raise ForbiddenException("User account is inactive. Please contact administration.")

    dept_name = user.department.name if user.department else None

    return CurrentUser(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role,
        department_id=user.department_id,
        department_name=dept_name,
        is_active=user.is_active,
        jti=jti,
    )


def require_roles(allowed_roles: List[UserRole]):
    """Enforce that current user has one of the allowed roles."""

    def role_checker(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
        if current_user.role not in allowed_roles:
            role_names = [r.value for r in allowed_roles]
            raise ForbiddenException(
                f"Access restricted. Permitted roles: {', '.join(role_names)}. Current role: {current_user.role.value}"
            )
        return current_user

    return role_checker


# Role helper dependencies
require_student = require_roles([UserRole.STUDENT])
require_staff = require_roles([UserRole.STAFF, UserRole.DEPARTMENT_HEAD, UserRole.ADMIN])
require_department_head = require_roles([UserRole.DEPARTMENT_HEAD, UserRole.ADMIN])
require_admin = require_roles([UserRole.ADMIN])
require_management = require_roles([UserRole.MANAGEMENT, UserRole.ADMIN])
require_authenticated = get_current_user
