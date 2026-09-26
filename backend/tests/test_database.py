"""Comprehensive test suite validating the PostgreSQL database layer, models, constraints, and seed data."""

import uuid
import pytest
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.user import User, UserRole
from app.models.department import Department
from app.models.ticket import Ticket, TicketPriority, TicketStatus
from app.models.status_history import TicketStatusHistory
from app.models.assignment import TicketAssignment
from app.models.duplicate import DuplicateMatch
from app.models.priority import PriorityFactors
from app.models.sla import SLATracking, SLAStatus
from app.models.notification import Notification
from app.models.feedback import Feedback
from app.models.analytics import IssueTrends


@pytest.mark.asyncio
async def test_departments_seeded(db_session: AsyncSession):
    """Verify departments seeded with SLA configuration."""
    result = await db_session.execute(select(Department))
    depts = result.scalars().all()
    assert len(depts) >= 5
    dept_names = [d.name for d in depts]
    assert "Hostel Administration" in dept_names
    assert "IT & Network Infrastructure" in dept_names
    assert "Estate & Maintenance" in dept_names

    # Verify SLA JSON config
    it_dept = next(d for d in depts if d.name == "IT & Network Infrastructure")
    assert "response_hours" in it_dept.sla_configuration
    assert it_dept.sla_configuration["response_hours"]["CRITICAL"] == 1


@pytest.mark.asyncio
async def test_users_and_roles_seeded(db_session: AsyncSession):
    """Verify all 5 user roles are seeded with valid bcrypt password hashes."""
    result = await db_session.execute(select(User))
    users = result.scalars().all()
    assert len(users) >= 13

    roles_present = {u.role for u in users}
    assert UserRole.ADMIN in roles_present
    assert UserRole.MANAGEMENT in roles_present
    assert UserRole.DEPARTMENT_HEAD in roles_present
    assert UserRole.STAFF in roles_present
    assert UserRole.STUDENT in roles_present

    # Verify admin password hash format
    admin = next(u for u in users if u.email == "admin@smartcampus.edu")
    assert admin.password_hash.startswith("$2b$") or admin.password_hash.startswith("$2a$")


@pytest.mark.asyncio
async def test_user_email_uniqueness(db_session: AsyncSession):
    """Verify that inserting a duplicate email raises an IntegrityError."""
    dup_user = User(
        name="Duplicate User",
        email="admin@smartcampus.edu",
        password_hash="dummy_hash",
        role=UserRole.STUDENT,
    )
    db_session.add(dup_user)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_ticket_number_uniqueness(db_session: AsyncSession):
    """Verify that inserting a duplicate ticket_number raises an IntegrityError."""
    student = (await db_session.execute(select(User).where(User.role == UserRole.STUDENT).limit(1))).scalar_one()
    dup_ticket = Ticket(
        ticket_number="TCK-2026-0001",  # Already exists in seeds
        title="Duplicate Ticket Test",
        description="Testing ticket number uniqueness",
        category="Hostel Administration",
        location="Block A",
        priority=TicketPriority.LOW,
        status=TicketStatus.SUBMITTED,
        created_by=student.id,
    )
    db_session.add(dup_ticket)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_ticket_relationships_and_audit(db_session: AsyncSession):
    """Verify relational querying on Ticket: creator, department, SLA, history, and factors."""
    result = await db_session.execute(
        select(Ticket).where(Ticket.ticket_number == "TCK-2026-0001")
    )
    ticket = result.scalar_one()
    assert ticket.title == "Water leakage and low pressure in 3rd floor washroom"
    assert ticket.priority == TicketPriority.HIGH
    assert ticket.status == TicketStatus.IN_PROGRESS

    # SLA Tracking relationship
    sla_res = await db_session.execute(
        select(SLATracking).where(SLATracking.ticket_id == ticket.id)
    )
    sla = sla_res.scalar_one()
    assert sla.sla_status == SLAStatus.ON_TRACK
    assert sla.escalation_level == 0

    # Status History audit
    history_res = await db_session.execute(
        select(TicketStatusHistory).where(TicketStatusHistory.ticket_id == ticket.id)
    )
    history = history_res.scalars().all()
    assert len(history) >= 2
    new_statuses = [h.new_status for h in history]
    assert "ASSIGNED" in new_statuses
    assert "IN_PROGRESS" in new_statuses


@pytest.mark.asyncio
async def test_duplicate_matches(db_session: AsyncSession):
    """Verify duplicate detection relationship and similarity scores."""
    result = await db_session.execute(
        select(DuplicateMatch).where(DuplicateMatch.similarity_score > 0.85)
    )
    matches = result.scalars().all()
    assert len(matches) >= 1
    match = matches[0]
    assert match.relationship_type == "DUPLICATE"
    assert match.similarity_score >= 0.90


@pytest.mark.asyncio
async def test_feedback_and_rating_constraint(db_session: AsyncSession):
    """Verify feedback rating check constraint (1-5)."""
    result = await db_session.execute(
        select(Feedback).where(Feedback.rating == 5)
    )
    feedback = result.scalars().first()
    assert feedback is not None
    assert "Carpentry team" in feedback.comment

    # Attempt to insert rating out of bounds (6)
    user = (await db_session.execute(select(User).limit(1))).scalar_one()
    invalid_feedback = Feedback(
        ticket_id=uuid.uuid4(),
        user_id=user.id,
        rating=6,
        comment="Invalid rating test",
    )
    db_session.add(invalid_feedback)
    with pytest.raises(IntegrityError):
        await db_session.commit()
    await db_session.rollback()


@pytest.mark.asyncio
async def test_issue_trends_analytics(db_session: AsyncSession):
    """Verify analytical trends records for hotspots."""
    result = await db_session.execute(select(IssueTrends))
    trends = result.scalars().all()
    assert len(trends) >= 3
    categories = [t.category for t in trends]
    assert "Hostel Administration" in categories
    assert "IT & Network Infrastructure" in categories
