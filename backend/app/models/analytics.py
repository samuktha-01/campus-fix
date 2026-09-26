"""Analytics and Issue Trends ORM model."""

from __future__ import annotations
import uuid
from sqlalchemy import Float, Index, Integer, String, Uuid, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base


class IssueTrends(Base):
    """Aggregated analytical trends tracking recurring complaints by category, location and period."""

    __tablename__ = "issue_trends"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )
    location: Mapped[str] = mapped_column(
        String(200),
        nullable=False,
        index=True,
    )
    period: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )
    complaint_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )
    average_resolution_time: Mapped[float] = mapped_column(
        Float,
        default=0.0,
        nullable=False,
    )
    sla_breach_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    __table_args__ = (
        UniqueConstraint("category", "location", "period", name="uq_trends_cat_loc_period"),
        Index("idx_trends_period", "period"),
    )
