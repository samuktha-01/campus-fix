"""Ticket ORM model and status/priority enumerations."""

from __future__ import annotations
import enum
import uuid
from typing import TYPE_CHECKING, List, Optional
from datetime import datetime, timezone
from sqlalchemy import (
    DateTime,
    Enum,
    Float,
    ForeignKey,
    Index,
    String,
    Text,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.department import Department
    from app.models.attachment import TicketAttachment
    from app.models.status_history import TicketStatusHistory
    from app.models.assignment import TicketAssignment
    from app.models.duplicate import DuplicateMatch
    from app.models.priority import PriorityFactors
    from app.models.sla import SLATracking
    from app.models.notification import Notification
    from app.models.feedback import Feedback


class TicketPriority(str, enum.Enum):
    """Priority levels calculated dynamically or assigned to tickets."""
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"


class TicketStatus(str, enum.Enum):
    """Lifecycle stages for a campus complaint ticket."""
    SUBMITTED = "SUBMITTED"
    AI_PROCESSED = "AI_PROCESSED"
    ASSIGNED = "ASSIGNED"
    IN_PROGRESS = "IN_PROGRESS"
    PENDING_INFO = "PENDING_INFO"
    RESOLVED = "RESOLVED"
    CLOSED = "CLOSED"
    ESCALATED = "ESCALATED"


class Ticket(Base):
    """Core complaint ticket entity representing an issue submitted on campus."""

    __tablename__ = "tickets"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    ticket_number: Mapped[str] = mapped_column(
        String(50),
        unique=True,
        index=True,
        nullable=False,
    )
    title: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        Text,
        nullable=False,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    subcategory: Mapped[Optional[str]] = mapped_column(
        String(100),
        nullable=True,
    )
    location: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    priority: Mapped[TicketPriority] = mapped_column(
        Enum(TicketPriority, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=TicketPriority.MEDIUM,
        nullable=False,
        index=True,
    )
    priority_score: Mapped[Optional[float]] = mapped_column(
        Float,
        nullable=True,
    )
    status: Mapped[TicketStatus] = mapped_column(
        Enum(TicketStatus, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=TicketStatus.SUBMITTED,
        nullable=False,
        index=True,
    )
    created_by: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    assigned_department: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    assigned_staff: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    resolved_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    closed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Table-level composite indexes for optimal query performance
    __table_args__ = (
        Index("idx_tickets_status", "status"),
        Index("idx_tickets_priority", "priority"),
        Index("idx_tickets_department", "assigned_department"),
        Index("idx_tickets_location", "location"),
        Index("idx_tickets_created_at", "created_at"),
        Index("idx_tickets_dept_status", "assigned_department", "status"),
        Index("idx_tickets_staff_status", "assigned_staff", "status"),
    )

    # Relationships
    creator: Mapped[User] = relationship(
        "User",
        foreign_keys=[created_by],
        back_populates="created_tickets",
    )
    department: Mapped[Optional[Department]] = relationship(
        "Department",
        foreign_keys=[assigned_department],
        back_populates="tickets",
    )
    assigned_staff_member: Mapped[Optional[User]] = relationship(
        "User",
        foreign_keys=[assigned_staff],
        back_populates="assigned_tickets",
    )
    attachments: Mapped[List[TicketAttachment]] = relationship(
        "TicketAttachment",
        back_populates="ticket",
        cascade="all, delete-orphan",
    )
    status_history: Mapped[List[TicketStatusHistory]] = relationship(
        "TicketStatusHistory",
        back_populates="ticket",
        cascade="all, delete-orphan",
        order_by="TicketStatusHistory.created_at.desc()",
    )
    assignments: Mapped[List[TicketAssignment]] = relationship(
        "TicketAssignment",
        back_populates="ticket",
        cascade="all, delete-orphan",
    )
    duplicate_matches: Mapped[List[DuplicateMatch]] = relationship(
        "DuplicateMatch",
        foreign_keys="DuplicateMatch.ticket_id",
        back_populates="ticket",
        cascade="all, delete-orphan",
    )
    matched_by_others: Mapped[List[DuplicateMatch]] = relationship(
        "DuplicateMatch",
        foreign_keys="DuplicateMatch.matched_ticket_id",
        back_populates="matched_ticket",
    )
    priority_factors: Mapped[Optional[PriorityFactors]] = relationship(
        "PriorityFactors",
        back_populates="ticket",
        uselist=False,
        cascade="all, delete-orphan",
    )
    sla_tracking: Mapped[Optional[SLATracking]] = relationship(
        "SLATracking",
        back_populates="ticket",
        uselist=False,
        cascade="all, delete-orphan",
    )
    notifications: Mapped[List[Notification]] = relationship(
        "Notification",
        back_populates="ticket",
        cascade="all, delete-orphan",
    )
    feedback: Mapped[Optional[Feedback]] = relationship(
        "Feedback",
        back_populates="ticket",
        uselist=False,
        cascade="all, delete-orphan",
    )
