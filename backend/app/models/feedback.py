"""Feedback ORM model."""

from __future__ import annotations
import uuid
from typing import TYPE_CHECKING, Optional
from datetime import datetime, timezone
from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Integer, Text, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket
    from app.models.user import User


class Feedback(Base):
    """Student feedback and satisfaction ratings upon ticket resolution."""

    __tablename__ = "feedback"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    ticket_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
        index=True,
    )
    user_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    rating: Mapped[int] = mapped_column(
        Integer,
        nullable=False,
    )
    comment: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        CheckConstraint("rating >= 1 AND rating <= 5", name="chk_feedback_rating_range"),
    )

    # Relationships
    ticket: Mapped[Ticket] = relationship(
        "Ticket",
        back_populates="feedback",
    )
    user: Mapped[User] = relationship(
        "User",
        back_populates="feedbacks",
        foreign_keys=[user_id],
    )
