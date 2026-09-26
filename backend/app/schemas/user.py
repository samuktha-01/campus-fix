"""User schemas for management, profiles, and administration."""

import uuid
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field
from app.models.user import UserRole
from app.schemas.auth import UserProfileResponse


class UserCreate(BaseModel):
    """Admin-initiated user creation."""

    name: str = Field(..., min_length=2, max_length=150)
    email: EmailStr
    password: str = Field(..., min_length=8)
    role: UserRole
    department_id: Optional[uuid.UUID] = None
    is_active: bool = True


class UserUpdate(BaseModel):
    """User profile update payload."""

    name: Optional[str] = Field(None, min_length=2, max_length=150)
    role: Optional[UserRole] = None
    department_id: Optional[uuid.UUID] = None
    is_active: Optional[bool] = None


class UserRead(UserProfileResponse):
    """User representation for administrative rosters."""
    updated_at: Optional[datetime] = None
