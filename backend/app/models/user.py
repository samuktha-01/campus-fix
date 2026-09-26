"""User ORM model and role enumerations."""

from __future__ import annotations
import enum
import uuid
from typing import TYPE_CHECKING, List, Optional
from datetime import datetime, timezone
from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, String, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.department import Department
    from app.models.ticket import Ticket
    from app.models.status_history import TicketStatusHistory
    from app.models.assignment import TicketAssignment
    from app.models.notification import Notification
    from app.models.feedback import Feedback


class UserRole(str, enum.Enum):
    """System persona roles for Role-Based Access Control."""
    STUDENT = "STUDENT"
    STAFF = "STAFF"
    DEPARTMENT_HEAD = "DEPARTMENT_HEAD"
    DEPT_HEAD = "DEPARTMENT_HEAD"
    ADMIN = "ADMIN"
    MANAGEMENT = "MANAGEMENT"


class User(Base):
    """User account model for authentication and role authorization."""

    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(150),
        nullable=False,
    )
    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )
    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    role: Mapped[UserRole] = mapped_column(
        Enum(UserRole, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=UserRole.STUDENT,
        nullable=False,
        index=True,
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    department: Mapped[Optional[Department]] = relationship(
        "Department",
        back_populates="users",
        foreign_keys=[department_id],
    )
    created_tickets: Mapped[List[Ticket]] = relationship(
        "Ticket",
        back_populates="creator",
        foreign_keys="Ticket.created_by",
    )
    assigned_tickets: Mapped[List[Ticket]] = relationship(
        "Ticket",
        back_populates="assigned_staff_member",
        foreign_keys="Ticket.assigned_staff",
    )
    assignments: Mapped[List[TicketAssignment]] = relationship(
        "TicketAssignment",
        back_populates="staff",
        foreign_keys="TicketAssignment.staff_id",
    )
    status_changes: Mapped[List[TicketStatusHistory]] = relationship(
        "TicketStatusHistory",
        back_populates="actor",
        foreign_keys="TicketStatusHistory.changed_by",
    )
    notifications: Mapped[List[Notification]] = relationship(
        "Notification",
        back_populates="user",
        cascade="all, delete-orphan",
    )
    feedbacks: Mapped[List[Feedback]] = relationship(
        "Feedback",
        back_populates="user",
        foreign_keys="Feedback.user_id",
    )
