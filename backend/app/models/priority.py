"""Priority Factors ORM model."""

from __future__ import annotations
import uuid
from typing import TYPE_CHECKING
from datetime import datetime, timezone
from sqlalchemy import DateTime, Float, ForeignKey, Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket


class PriorityFactors(Base):
    """Detailed multi-factor scores calculated for algorithmic priority ranking."""

    __tablename__ = "priority_factors"

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
    severity_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    affected_users_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    safety_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    location_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    recurrence_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    sla_risk_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    final_score: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    ticket: Mapped[Ticket] = relationship(
        "Ticket",
        back_populates="priority_factors",
    )
