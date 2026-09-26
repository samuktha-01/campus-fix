"""Duplicate Matches ORM model."""

from __future__ import annotations
import uuid
from typing import TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, Index, String, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket


class DuplicateMatch(Base):
    """Pairwise semantic similarity match between complaints for duplicate detection."""

    __tablename__ = "duplicate_matches"

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
    matched_ticket_id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    similarity_score: Mapped[float] = mapped_column(
        Float,
        nullable=False,
        index=True,
    )
    relationship_type: Mapped[str] = mapped_column(
        String(50),
        default="DUPLICATE",
        nullable=False,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("ticket_id", "matched_ticket_id", name="uq_ticket_matched_pair"),
        Index("idx_dup_similarity_desc", "similarity_score"),
    )

    # Relationships
    ticket: Mapped[Ticket] = relationship(
        "Ticket",
        foreign_keys=[ticket_id],
        back_populates="duplicate_matches",
    )
    matched_ticket: Mapped[Ticket] = relationship(
        "Ticket",
        foreign_keys=[matched_ticket_id],
        back_populates="matched_by_others",
    )
