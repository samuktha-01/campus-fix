"""Comprehensive, realistic database seed script for SmartCampus AI."""

import asyncio
from datetime import datetime, timedelta, timezone
from sqlalchemy import select
from app.core.database import async_session_maker
from app.core.security import get_password_hash
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


async def seed():
    """Seed departments, users across all 5 roles, sample tickets, SLA records, and analytics."""
    print("Beginning SmartCampus AI database seeding...")

    async with async_session_maker() as session:
        # Check if already seeded
        existing_user = await session.execute(select(User).limit(1))
        if existing_user.scalars().first():
            print("Database already contains data. Skipping re-seed.")
            return

        now = datetime.now(timezone.utc)
        default_pwd_hash = get_password_hash("Campus@2026!")

        # 1. Seed Departments
        dept_configs = [
            {
                "name": "Hostel Administration",
                "description": "Hostel room maintenance, furniture, sanitation, plumbing and residential welfare.",
                "contact_email": "hostels@smartcampus.edu",
                "sla_configuration": {
                    "response_hours": {"CRITICAL": 1, "HIGH": 3, "MEDIUM": 8, "LOW": 24},
                    "resolution_hours": {"CRITICAL": 6, "HIGH": 12, "MEDIUM": 24, "LOW": 72},
                },
            },
            {
                "name": "IT & Network Infrastructure",
                "description": "Campus Wi-Fi connectivity, computer labs, portal access, email and digital services.",
                "contact_email": "it-support@smartcampus.edu",
                "sla_configuration": {
                    "response_hours": {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 6, "LOW": 12},
                    "resolution_hours": {"CRITICAL": 4, "HIGH": 8, "MEDIUM": 24, "LOW": 48},
                },
            },
            {
                "name": "Estate & Maintenance",
                "description": "Civil maintenance, power supply, electrical switchboards, air conditioning, and physical structures.",
                "contact_email": "estate@smartcampus.edu",
                "sla_configuration": {
                    "response_hours": {"CRITICAL": 1, "HIGH": 4, "MEDIUM": 12, "LOW": 24},
                    "resolution_hours": {"CRITICAL": 8, "HIGH": 16, "MEDIUM": 36, "LOW": 96},
                },
            },
            {
                "name": "Transport & Parking",
                "description": "Campus transit buses, shuttle routes, vehicle parking stickers, and safety escorts.",
                "contact_email": "transport@smartcampus.edu",
                "sla_configuration": {
                    "response_hours": {"CRITICAL": 2, "HIGH": 4, "MEDIUM": 12, "LOW": 24},
                    "resolution_hours": {"CRITICAL": 8, "HIGH": 24, "MEDIUM": 48, "LOW": 72},
                },
            },
            {
                "name": "Canteen & Dining Services",
                "description": "Mess food quality, dining hall hygiene, kitchen equipment, and RO water purification coolers.",
                "contact_email": "canteen@smartcampus.edu",
                "sla_configuration": {
                    "response_hours": {"CRITICAL": 1, "HIGH": 2, "MEDIUM": 6, "LOW": 12},
                    "resolution_hours": {"CRITICAL": 4, "HIGH": 8, "MEDIUM": 16, "LOW": 36},
                },
            },
        ]

        depts_map = {}
        for d in dept_configs:
            dept = Department(
                name=d["name"],
                description=d["description"],
                contact_email=d["contact_email"],
                sla_configuration=d["sla_configuration"],
                created_at=now - timedelta(days=60),
            )
            session.add(dept)
            depts_map[d["name"]] = dept

        await session.flush()
        print(f"Created {len(depts_map)} departments.")

        # 2. Seed Users across all 5 Roles
        users_to_create = [
            # Admin
            {
                "name": "System Administrator",
                "email": "admin@smartcampus.edu",
                "role": UserRole.ADMIN,
                "dept": None,
            },
            # Management
            {
                "name": "Prof. S. R. Ramanathan",
                "email": "director@smartcampus.edu",
                "role": UserRole.MANAGEMENT,
                "dept": None,
            },
            {
                "name": "Dr. Meera Nambiar",
                "email": "dean.students@smartcampus.edu",
                "role": UserRole.MANAGEMENT,
                "dept": None,
            },
            # Department Heads
            {
                "name": "Dr. Rajesh Sharma",
                "email": "head.hostel@smartcampus.edu",
                "role": UserRole.DEPARTMENT_HEAD,
                "dept": depts_map["Hostel Administration"],
            },
            {
                "name": "Prof. Anita Desai",
                "email": "head.it@smartcampus.edu",
                "role": UserRole.DEPARTMENT_HEAD,
                "dept": depts_map["IT & Network Infrastructure"],
            },
            {
                "name": "Er. Vikram Patel",
                "email": "head.estate@smartcampus.edu",
                "role": UserRole.DEPARTMENT_HEAD,
                "dept": depts_map["Estate & Maintenance"],
            },
            # Staff Members
            {
                "name": "Kavita Reddy",
                "email": "staff.hostel@smartcampus.edu",
                "role": UserRole.STAFF,
                "dept": depts_map["Hostel Administration"],
            },
            {
                "name": "Rohan Verma",
                "email": "staff.it@smartcampus.edu",
                "role": UserRole.STAFF,
                "dept": depts_map["IT & Network Infrastructure"],
            },
            {
                "name": "Manoj Kumar",
                "email": "staff.estate@smartcampus.edu",
                "role": UserRole.STAFF,
                "dept": depts_map["Estate & Maintenance"],
            },
            # Sample Students
            {
                "name": "Aarav Mehta",
                "email": "aarav.mehta@student.smartcampus.edu",
                "role": UserRole.STUDENT,
                "dept": None,
            },
            {
                "name": "Diya Sengupta",
                "email": "diya.s@student.smartcampus.edu",
                "role": UserRole.STUDENT,
                "dept": None,
            },
            {
                "name": "Karthik Iyer",
                "email": "karthik.i@student.smartcampus.edu",
                "role": UserRole.STUDENT,
                "dept": None,
            },
            {
                "name": "Sneha Patel",
                "email": "sneha.p@student.smartcampus.edu",
                "role": UserRole.STUDENT,
                "dept": None,
            },
        ]

        users_map = {}
        for u in users_to_create:
            user = User(
                name=u["name"],
                email=u["email"],
                password_hash=default_pwd_hash,
                role=u["role"],
                department_id=u["dept"].id if u["dept"] else None,
                is_active=True,
                created_at=now - timedelta(days=30),
            )
            session.add(user)
            users_map[u["email"]] = user

        await session.flush()
        print(f"Created {len(users_map)} users across all 5 roles.")

        # 3. Seed Sample Tickets with full relational history, SLA tracking and priority factors
        
        # Ticket 1: In Progress, High Priority
        t1 = Ticket(
            ticket_number="TCK-2026-0001",
            title="Water leakage and low pressure in 3rd floor washroom",
            description="Water is dripping continuously from the main pipe in the 3rd floor washroom of Hostel Block C. Low pressure in taps.",
            category="Hostel Administration",
            subcategory="Plumbing & Sanitation",
            location="Hostel Block C, Floor 3",
            priority=TicketPriority.HIGH,
            priority_score=78.5,
            status=TicketStatus.IN_PROGRESS,
            created_by=users_map["aarav.mehta@student.smartcampus.edu"].id,
            assigned_department=depts_map["Hostel Administration"].id,
            assigned_staff=users_map["staff.hostel@smartcampus.edu"].id,
            created_at=now - timedelta(hours=5),
            updated_at=now - timedelta(hours=2),
        )
        session.add(t1)
        await session.flush()

        session.add(TicketStatusHistory(
            ticket_id=t1.id,
            old_status="SUBMITTED",
            new_status="ASSIGNED",
            changed_by=users_map["head.hostel@smartcampus.edu"].id,
            comment="Assigned to Block C caretaker team.",
            created_at=now - timedelta(hours=4),
        ))
        session.add(TicketStatusHistory(
            ticket_id=t1.id,
            old_status="ASSIGNED",
            new_status="IN_PROGRESS",
            changed_by=users_map["staff.hostel@smartcampus.edu"].id,
            comment="Plumber inspected the valve. Replacement washer being arranged.",
            created_at=now - timedelta(hours=2),
        ))
        session.add(TicketAssignment(
            ticket_id=t1.id,
            department_id=depts_map["Hostel Administration"].id,
            staff_id=users_map["staff.hostel@smartcampus.edu"].id,
            assigned_at=now - timedelta(hours=4),
        ))
        session.add(PriorityFactors(
            ticket_id=t1.id,
            severity_score=4.0,
            affected_users_score=4.2,
            safety_score=2.5,
            location_score=4.0,
            recurrence_score=3.0,
            sla_risk_score=3.5,
            final_score=78.5,
            created_at=now - timedelta(hours=5),
        ))
        session.add(SLATracking(
            ticket_id=t1.id,
            response_deadline=now - timedelta(hours=2),
            resolution_deadline=now + timedelta(hours=7),
            response_completed_at=now - timedelta(hours=4),
            sla_status=SLAStatus.ON_TRACK,
            escalation_level=0,
            last_checked_at=now,
        ))

        # Ticket 2: Assigned, Medium Priority
        t2 = Ticket(
            ticket_number="TCK-2026-0002",
            title="Library Wi-Fi disconnects repeatedly during peak hours",
            description="Access Point 'Campus-Lib-West' in the 2nd floor reading hall frequently drops connections and asks for re-login.",
            category="IT & Network Infrastructure",
            subcategory="Wireless Network",
            location="Central Library, 2nd Floor Digital Room",
            priority=TicketPriority.MEDIUM,
            priority_score=55.0,
            status=TicketStatus.ASSIGNED,
            created_by=users_map["diya.s@student.smartcampus.edu"].id,
            assigned_department=depts_map["IT & Network Infrastructure"].id,
            assigned_staff=users_map["staff.it@smartcampus.edu"].id,
            created_at=now - timedelta(hours=3),
            updated_at=now - timedelta(hours=1),
        )
        session.add(t2)
        await session.flush()

        session.add(TicketStatusHistory(
            ticket_id=t2.id,
            old_status="SUBMITTED",
            new_status="ASSIGNED",
            changed_by=users_map["head.it@smartcampus.edu"].id,
            comment="Network diagnostics scheduled.",
            created_at=now - timedelta(hours=1),
        ))
        session.add(TicketAssignment(
            ticket_id=t2.id,
            department_id=depts_map["IT & Network Infrastructure"].id,
            staff_id=users_map["staff.it@smartcampus.edu"].id,
            assigned_at=now - timedelta(hours=1),
        ))
        session.add(PriorityFactors(
            ticket_id=t2.id,
            severity_score=2.8,
            affected_users_score=3.5,
            safety_score=1.0,
            location_score=3.5,
            recurrence_score=2.0,
            sla_risk_score=2.5,
            final_score=55.0,
            created_at=now - timedelta(hours=3),
        ))
        session.add(SLATracking(
            ticket_id=t2.id,
            response_deadline=now + timedelta(hours=3),
            resolution_deadline=now + timedelta(hours=21),
            sla_status=SLAStatus.ON_TRACK,
            escalation_level=0,
            last_checked_at=now,
        ))

        # Ticket 3: Critical, Escalated
        t3 = Ticket(
            ticket_number="TCK-2026-0003",
            title="Electric spark and burnt smell from AC switchboard in Lab 204",
            description="A loud crackling sound and visible spark occurred when turning on the central AC switchboard. Main breaker tripped.",
            category="Estate & Maintenance",
            subcategory="Electrical & Air Conditioning",
            location="Engineering Block 2, Room 204",
            priority=TicketPriority.CRITICAL,
            priority_score=95.0,
            status=TicketStatus.ESCALATED,
            created_by=users_map["karthik.i@student.smartcampus.edu"].id,
            assigned_department=depts_map["Estate & Maintenance"].id,
            assigned_staff=users_map["staff.estate@smartcampus.edu"].id,
            created_at=now - timedelta(hours=7),
            updated_at=now - timedelta(minutes=30),
        )
        session.add(t3)
        await session.flush()

        session.add(TicketStatusHistory(
            ticket_id=t3.id,
            old_status="SUBMITTED",
            new_status="ESCALATED",
            changed_by=users_map["head.estate@smartcampus.edu"].id,
            comment="Urgent safety risk. Escalated to electrical engineer team lead.",
            created_at=now - timedelta(hours=1),
        ))
        session.add(PriorityFactors(
            ticket_id=t3.id,
            severity_score=5.0,
            affected_users_score=4.8,
            safety_score=5.0,
            location_score=4.5,
            recurrence_score=1.5,
            sla_risk_score=4.8,
            final_score=95.0,
            created_at=now - timedelta(hours=7),
        ))
        session.add(SLATracking(
            ticket_id=t3.id,
            response_deadline=now - timedelta(hours=6),
            resolution_deadline=now + timedelta(hours=1),
            response_completed_at=now - timedelta(hours=5),
            sla_status=SLAStatus.AT_RISK,
            escalation_level=1,
            last_checked_at=now,
        ))
        session.add(Notification(
            user_id=users_map["head.estate@smartcampus.edu"].id,
            ticket_id=t3.id,
            title="CRITICAL SLA ESCALATION: TCK-2026-0003",
            message="Electrical hazard in Engineering Block 2 Room 204 has reached escalation level 1.",
            notification_type="SLA_BREACH",
            is_read=False,
            created_at=now - timedelta(hours=1),
        ))

        # Ticket 4: Resolved with 5-star Student Feedback
        t4 = Ticket(
            ticket_number="TCK-2026-0004",
            title="Broken study chair and loose desk screw in Room 112",
            description="The study chair in hostel room 112 has a broken castor wheel and desk corner is wobbly.",
            category="Hostel Administration",
            subcategory="Furniture & Fixtures",
            location="Hostel Block A, Room 112",
            priority=TicketPriority.LOW,
            priority_score=28.0,
            status=TicketStatus.RESOLVED,
            created_by=users_map["sneha.p@student.smartcampus.edu"].id,
            assigned_department=depts_map["Hostel Administration"].id,
            assigned_staff=users_map["staff.hostel@smartcampus.edu"].id,
            created_at=now - timedelta(days=2),
            updated_at=now - timedelta(hours=18),
            resolved_at=now - timedelta(hours=18),
        )
        session.add(t4)
        await session.flush()

        session.add(TicketStatusHistory(
            ticket_id=t4.id,
            old_status="IN_PROGRESS",
            new_status="RESOLVED",
            changed_by=users_map["staff.hostel@smartcampus.edu"].id,
            comment="Carpenter replaced the chair wheel and tightened desk bolts.",
            created_at=now - timedelta(hours=18),
        ))
        session.add(SLATracking(
            ticket_id=t4.id,
            response_deadline=now - timedelta(days=1),
            resolution_deadline=now + timedelta(days=1),
            response_completed_at=now - timedelta(days=1, hours=20),
            resolution_completed_at=now - timedelta(hours=18),
            sla_status=SLAStatus.MET,
            escalation_level=0,
            last_checked_at=now,
        ))
        session.add(Feedback(
            ticket_id=t4.id,
            user_id=users_map["sneha.p@student.smartcampus.edu"].id,
            rating=5,
            comment="Carpentry team came within hours and fixed both the chair and table perfectly. Very pleased!",
            created_at=now - timedelta(hours=16),
        ))

        # Ticket 5: Duplicate candidate linked to Ticket 1
        t5 = Ticket(
            ticket_number="TCK-2026-0005",
            title="No running water in Block C 3rd floor restroom",
            description="No water coming from taps in the 3rd floor washroom of Block C.",
            category="Hostel Administration",
            subcategory="Plumbing & Sanitation",
            location="Hostel Block C, Floor 3",
            priority=TicketPriority.HIGH,
            priority_score=75.0,
            status=TicketStatus.AI_PROCESSED,
            created_by=users_map["sneha.p@student.smartcampus.edu"].id,
            assigned_department=depts_map["Hostel Administration"].id,
            created_at=now - timedelta(hours=1),
            updated_at=now - timedelta(hours=1),
        )
        session.add(t5)
        await session.flush()

        # Link semantic duplicate match
        session.add(DuplicateMatch(
            ticket_id=t5.id,
            matched_ticket_id=t1.id,
            similarity_score=0.92,
            relationship_type="DUPLICATE",
            created_at=now - timedelta(hours=1),
        ))

        # 4. Seed IssueTrends for Executive Analytics
        trends = [
            IssueTrends(
                category="Hostel Administration",
                location="Hostel Block C",
                period="2026-09",
                complaint_count=12,
                average_resolution_time=14.5,
                sla_breach_count=1,
            ),
            IssueTrends(
                category="IT & Network Infrastructure",
                location="Central Library",
                period="2026-09",
                complaint_count=9,
                average_resolution_time=6.2,
                sla_breach_count=0,
            ),
            IssueTrends(
                category="Estate & Maintenance",
                location="Engineering Block 2",
                period="2026-09",
                complaint_count=6,
                average_resolution_time=18.0,
                sla_breach_count=1,
            ),
        ]
        session.add_all(trends)

        await session.commit()
        print("Database seeding completed successfully!")
        print("Default credentials: Password = 'Campus@2026!' for all accounts.")
        print(f"Admin login: admin@smartcampus.edu")


if __name__ == "__main__":
    asyncio.run(seed())
