"""Authentication schemas for request validation and response serialization."""

import re
import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, field_validator
from app.models.user import UserRole


class UserRegisterRequest(BaseModel):
    """Payload for user registration."""

    name: str = Field(..., min_length=2, max_length=150, description="Full name of user")
    email: EmailStr = Field(..., description="Campus or personal email address")
    password: str = Field(..., min_length=8, max_length=128, description="Strong password")
    role: UserRole = Field(default=UserRole.STUDENT, description="Requested role (defaults to STUDENT)")
    department_id: Optional[uuid.UUID] = Field(default=None, description="Department ID if staff or dept head")

    @field_validator("password")
    @classmethod
    def validate_password_complexity(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not re.search(r"\d", v) and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one digit or special character")
        return v


class UserLoginRequest(BaseModel):
    """Payload for user authentication."""

    email: EmailStr = Field(..., description="Registered email address")
    password: str = Field(..., min_length=1, description="Account password")


class RefreshTokenRequest(BaseModel):
    """Payload for refreshing an expired access token."""

    refresh_token: str = Field(..., description="Valid JWT refresh token")


class UserProfileResponse(BaseModel):
    """Public user profile information."""

    id: uuid.UUID
    name: str
    email: str
    role: UserRole
    department_id: Optional[uuid.UUID] = None
    department_name: Optional[str] = None
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    """Authentication token response envelope."""

    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserProfileResponse


class LogoutResponse(BaseModel):
    """Logout confirmation response."""

    success: bool = True
    message: str = "Logged out successfully"
