"""Complaint ticket endpoints for students, department staff, and administration."""

import os
from typing import List, Optional
from fastapi import APIRouter, Depends, File, Form, HTTPException, Request, Response, UploadFile, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import CurrentUser, get_current_user
from app.core.database import get_db
from app.core.exceptions import BadRequestException, ForbiddenException, NotFoundException
from app.models.user import User, UserRole
from app.schemas.ticket import (
    CommentCreate,
    TicketAttachmentResponse,
    TicketCreate,
    TicketListResponse,
    TicketResponse,
    TicketStatusHistoryResponse,
    TicketSubmissionResult,
)
from app.services.ticket_service import TicketService

router = APIRouter()

# Resolve backend uploads directory
UPLOADS_DIR = os.path.abspath(
    os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")
)
os.makedirs(UPLOADS_DIR, exist_ok=True)


@router.post(
    "",
    response_model=TicketSubmissionResult,
    status_code=status.HTTP_201_CREATED,
    summary="Submit a new student complaint (JSON or Multipart Form)",
    description=(
        "Executes the full 11-step complaint processing pipeline: creates ticket, generates ticket number, "
        "analyzes complaint with AI, determines category, subcategory, probable department, calculates priority factors, "
        "checks for duplicates, calculates SLA deadlines, dispatches notifications, and returns complete result."
    ),
)
async def create_ticket(
    request: Request,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Handle ticket submission with support for both JSON and multipart form data with file uploads."""
    content_type = request.headers.get("content-type", "").lower()
    files: List[UploadFile] = []

    if "application/json" in content_type:
        try:
            body = await request.json()
        except Exception:
            raise BadRequestException("Invalid JSON payload.")

        title = body.get("title", "")
        description = body.get("description", "")
        location = body.get("location", "")
        category = body.get("category")
        subcategory = body.get("subcategory")
    else:
        # Multipart form data
        form = await request.form()
        title = form.get("title", "")
        description = form.get("description", "")
        location = form.get("location", "")
        category = form.get("category")
        subcategory = form.get("subcategory")

        # Collect uploaded files (image, video, attachments)
        for key, value in form.multi_items():
            if isinstance(value, UploadFile) and value.filename:
                files.append(value)

    if not title or len(str(title).strip()) < 3:
        raise BadRequestException("Title must be at least 3 characters long.")
    if not description or len(str(description).strip()) < 5:
        raise BadRequestException("Description must be at least 5 characters long.")
    if not location or len(str(location).strip()) < 2:
        raise BadRequestException("Location is required.")

    result = await TicketService.create_student_complaint(
        db=db,
        student_id=current_user.id,
        title=str(title).strip(),
        description=str(description).strip(),
        location=str(location).strip(),
        category=str(category).strip() if category else None,
        subcategory=str(subcategory).strip() if subcategory else None,
        files=files,
        uploads_dir=UPLOADS_DIR,
    )
    return result


@router.get(
    "/my",
    response_model=List[TicketResponse],
    summary="Get my submitted complaints",
    description="Retrieve all complaints submitted by the authenticated student with SLA tracking and priority factors.",
)
async def get_my_tickets(
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch all tickets filed by current student."""
    return await TicketService.get_my_tickets(db, current_user.id)


@router.get(
    "/{ticket_id}",
    response_model=TicketResponse,
    summary="Get complete ticket details by ID or Ticket Number",
    description="Fetch a ticket by UUID or human-readable ticket number (e.g. TCK-2026-0001).",
)
async def get_ticket_details(
    ticket_id: str,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Fetch complete ticket details with permission check."""
    ticket = await TicketService.fetch_ticket_with_relations(db, ticket_id)
    if not ticket:
        raise NotFoundException(f"Ticket '{ticket_id}' not found.")

    # Authorization: Students can only view their own tickets
    if current_user.role == UserRole.STUDENT and ticket.created_by != current_user.id:
        raise ForbiddenException("You do not have permission to view this ticket.")

    return TicketService.build_ticket_response(ticket)


@router.post(
    "/{ticket_id}/comments",
    response_model=TicketStatusHistoryResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Add comment on ticket",
    description="Add a student note or inquiry on an active ticket, appending to the audit history.",
)
async def add_comment(
    ticket_id: str,
    payload: CommentCreate,
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Post comment on complaint ticket."""
    user_model = await db.get(User, current_user.id)
    if not user_model:
        raise NotFoundException("User record not found.")

    return await TicketService.add_comment(
        db=db,
        ticket_id_or_number=ticket_id,
        user=user_model,
        comment_text=payload.comment,
    )


@router.post(
    "/{ticket_id}/attachments",
    response_model=TicketAttachmentResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload attachment to ticket",
    description="Attach an image (photo) or video demonstrating the campus issue.",
)
async def upload_attachment(
    ticket_id: str,
    file: UploadFile = File(...),
    current_user: CurrentUser = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Attach media to ticket."""
    user_model = await db.get(User, current_user.id)
    if not user_model:
        raise NotFoundException("User record not found.")

    return await TicketService.add_attachment(
        db=db,
        ticket_id_or_number=ticket_id,
        user=user_model,
        file=file,
        uploads_dir=UPLOADS_DIR,
    )
