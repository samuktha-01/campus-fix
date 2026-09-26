"""Ticket Assignment history ORM model."""

from __future__ import annotations
import uuid
from typing import TYPE_CHECKING, Optional
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket
    from app.models.department import Department
    from app.models.user import User


class TicketAssignment(Base):
    """Historical record of department and staff assignments for a ticket."""

    __tablename__ = "ticket_assignments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    department_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("departments.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    staff_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    assigned_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )
    unassigned_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    ticket: Mapped[Ticket] = relationship(
        "Ticket",
        back_populates="assignments",
    )
    department: Mapped[Optional[Department]] = relationship(
        "Department",
        back_populates="assignments",
        foreign_keys=[department_id],
    )
    staff: Mapped[Optional[User]] = relationship(
        "User",
        back_populates="assignments",
        foreign_keys=[staff_id],
    )
