"""SQLAlchemy models package exporting all database entities."""

from app.models.base import Base, UUIDPrimaryKeyMixin, TimestampMixin
from app.models.department import Department
from app.models.user import User, UserRole
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.models.attachment import TicketAttachment
from app.models.status_history import TicketStatusHistory
from app.models.assignment import TicketAssignment
from app.models.duplicate import DuplicateMatch
from app.models.priority import PriorityFactors
from app.models.sla import SLATracking, SLAStatus
from app.models.notification import Notification
from app.models.feedback import Feedback
from app.models.analytics import IssueTrends

__all__ = [
    "Base",
    "UUIDPrimaryKeyMixin",
    "TimestampMixin",
    "Department",
    "User",
    "UserRole",
    "Ticket",
    "TicketPriority",
    "TicketStatus",
    "TicketAttachment",
    "TicketStatusHistory",
    "TicketAssignment",
    "DuplicateMatch",
    "PriorityFactors",
    "SLATracking",
    "SLAStatus",
    "Notification",
    "Feedback",
    "IssueTrends",
]
