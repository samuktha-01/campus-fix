"""Pydantic schemas for Ticket creation, retrieval, updates, and analysis."""

import uuid
from typing import Any, Dict, List, Optional
from datetime import datetime
from pydantic import BaseModel, Field
from app.models.ticket import TicketPriority, TicketStatus
from app.models.sla import SLAStatus


class TicketCreate(BaseModel):
    """Payload for submitting a new student complaint ticket."""

    title: str = Field(..., min_length=3, max_length=255, description="Brief summary of the issue")
    description: str = Field(..., min_length=5, max_length=5000, description="Detailed explanation of the problem")
    location: str = Field(..., min_length=2, max_length=200, description="Specific campus location where issue occurred")
    category: Optional[str] = Field(None, max_length=100, description="Optional category chosen by student")
    subcategory: Optional[str] = Field(None, max_length=100, description="Optional subcategory chosen by student")


class CommentCreate(BaseModel):
    """Payload for adding a student or staff comment on a ticket."""

    comment: str = Field(..., min_length=1, max_length=3000, description="Comment text or update note")


class TicketAttachmentResponse(BaseModel):
    """Ticket attachment metadata."""

    id: uuid.UUID
    file_url: str
    file_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class PriorityFactorsResponse(BaseModel):
    """Algorithmic multi-factor scoring details."""

    severity_score: float
    affected_users_score: float
    safety_score: float
    location_score: float
    recurrence_score: float
    sla_risk_score: float
    final_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class SLATrackingResponse(BaseModel):
    """SLA adherence and deadline details."""

    response_deadline: datetime
    resolution_deadline: datetime
    response_completed_at: Optional[datetime] = None
    resolution_completed_at: Optional[datetime] = None
    sla_status: SLAStatus
    escalation_level: int
    time_remaining_hours: Optional[float] = None
    is_breached: bool = False
    formatted_resolution_deadline: Optional[str] = None

    class Config:
        from_attributes = True


class DuplicateMatchResponse(BaseModel):
    """Duplicate match record returned to warn student and staff."""

    matched_ticket_id: uuid.UUID
    matched_ticket_number: str
    matched_title: str
    matched_status: str
    matched_location: Optional[str] = None
    similarity_score: float
    relationship_type: str
    created_at: datetime

    class Config:
        from_attributes = True


class TicketStatusHistoryResponse(BaseModel):
    """Audit log entry and comment on a ticket."""

    id: uuid.UUID
    old_status: str
    new_status: str
    changed_by: Optional[uuid.UUID] = None
    actor_name: Optional[str] = None
    actor_role: Optional[str] = None
    comment: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class DepartmentSummary(BaseModel):
    """Brief department information for ticket displays."""

    id: uuid.UUID
    name: str
    contact_email: Optional[str] = None

    class Config:
        from_attributes = True


class TicketResponse(BaseModel):
    """Complete ticket result returned after submission or on detail query."""

    id: uuid.UUID
    ticket_number: str
    title: str
    description: str
    category: str
    subcategory: Optional[str] = None
    location: str
    priority: TicketPriority
    priority_score: Optional[float] = None
    status: TicketStatus
    created_by: uuid.UUID
    creator_name: Optional[str] = None
    creator_email: Optional[str] = None
    assigned_department: Optional[uuid.UUID] = None
    department: Optional[DepartmentSummary] = None
    assigned_staff: Optional[uuid.UUID] = None
    assigned_staff_name: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

    # Relational intelligence data
    priority_factors: Optional[PriorityFactorsResponse] = None
    sla_tracking: Optional[SLATrackingResponse] = None
    duplicate_matches: List[DuplicateMatchResponse] = []
    attachments: List[TicketAttachmentResponse] = []
    status_history: List[TicketStatusHistoryResponse] = []

    class Config:
        from_attributes = True


class TicketSubmissionResult(BaseModel):
    """Response envelope returned immediately after ticket submission."""

    success: bool = True
    message: str = "Ticket created and analyzed successfully"
    ticket: TicketResponse
    duplicate_warning: Optional[str] = None
    ai_insights: Optional[Dict[str, Any]] = None


class TicketListResponse(BaseModel):
    """Paginated or listed tickets response."""

    total: int
    tickets: List[TicketResponse]
