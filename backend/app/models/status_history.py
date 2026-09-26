"""Ticket Status History ORM model."""

from __future__ import annotations
import uuid
from typing import TYPE_CHECKING, Optional
from datetime import datetime, timezone
from sqlalchemy import DateTime, ForeignKey, String, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket
    from app.models.user import User


class TicketStatusHistory(Base):
    """Audit log recording all status transitions and comments on a ticket."""

    __tablename__ = "ticket_status_history"

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
    old_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )
    new_status: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    changed_by: Mapped[Optional[uuid.UUID]] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    comment: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
        index=True,
    )

    # Relationships
    ticket: Mapped[Ticket] = relationship(
        "Ticket",
        back_populates="status_history",
    )
    actor: Mapped[Optional[User]] = relationship(
        "User",
        back_populates="status_changes",
        foreign_keys=[changed_by],
    )
