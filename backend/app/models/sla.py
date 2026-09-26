"""SLA Tracking ORM model and status enumerations."""

from __future__ import annotations
import enum
import uuid
from typing import TYPE_CHECKING, Optional
from datetime import datetime, timezone
from sqlalchemy import (
    DateTime,
    Enum,
    ForeignKey,
    Index,
    Integer,
    Uuid,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.ticket import Ticket


class SLAStatus(str, enum.Enum):
    """SLA adherence status stages."""
    ON_TRACK = "ON_TRACK"
    AT_RISK = "AT_RISK"
    BREACHED = "BREACHED"
    MET = "MET"


class SLATracking(Base):
    """Service Level Agreement tracking, deadline enforcement, and escalation records."""

    __tablename__ = "sla_tracking"

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
    response_deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
    )
    resolution_deadline: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        nullable=False,
        index=True,
    )
    response_completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    resolution_completed_at: Mapped[Optional[datetime]] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
    sla_status: Mapped[SLAStatus] = mapped_column(
        Enum(SLAStatus, native_enum=False, values_callable=lambda x: [e.value for e in x]),
        default=SLAStatus.ON_TRACK,
        nullable=False,
        index=True,
    )
    escalation_level: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    last_checked_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    __table_args__ = (
        Index("idx_sla_status_resolution_deadline", "sla_status", "resolution_deadline"),
    )

    # Relationships
    ticket: Mapped[Ticket] = relationship(
        "Ticket",
        back_populates="sla_tracking",
    )
