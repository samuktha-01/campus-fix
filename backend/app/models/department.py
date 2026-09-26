"""Department ORM model."""

from __future__ import annotations
import uuid
from typing import TYPE_CHECKING, Any, Dict, List, Optional
from datetime import datetime, timezone
from sqlalchemy import DateTime, String, Text, Uuid
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.types import JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import Base

if TYPE_CHECKING:
    from app.models.user import User
    from app.models.ticket import Ticket
    from app.models.assignment import TicketAssignment


class Department(Base):
    """Campus department responsible for resolving specific categories of tickets."""

    __tablename__ = "departments"

    id: Mapped[uuid.UUID] = mapped_column(
        Uuid(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )
    description: Mapped[Optional[str]] = mapped_column(
        Text,
        nullable=True,
    )
    contact_email: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )
    sla_configuration: Mapped[Dict[str, Any]] = mapped_column(
        JSONB().with_variant(JSON(), "sqlite"),
        nullable=False,
        default=dict,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )

    # Relationships
    users: Mapped[List[User]] = relationship(
        "User",
        back_populates="department",
        foreign_keys="User.department_id",
    )
    tickets: Mapped[List[Ticket]] = relationship(
        "Ticket",
        back_populates="department",
        foreign_keys="Ticket.assigned_department",
    )
    assignments: Mapped[List[TicketAssignment]] = relationship(
        "TicketAssignment",
        back_populates="department",
        cascade="all, delete-orphan",
    )
