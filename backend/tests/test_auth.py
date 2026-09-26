"""Comprehensive test suite for Authentication, Password Security, JWT Lifecycle, and RBAC."""

import uuid
import pytest
from httpx import ASGITransport, AsyncClient
from app.main import app

BASE_URL = "http://test"


@pytest.mark.asyncio
async def test_login_successful_all_roles():
    """Verify login authentication and JWT generation for all 5 roles."""
    roles_credentials = [
        ("admin@smartcampus.edu", "Campus@2026!", "ADMIN"),
        ("director@smartcampus.edu", "Campus@2026!", "MANAGEMENT"),
        ("head.hostel@smartcampus.edu", "Campus@2026!", "DEPARTMENT_HEAD"),
        ("staff.it@smartcampus.edu", "Campus@2026!", "STAFF"),
        ("aarav.mehta@student.smartcampus.edu", "Campus@2026!", "STUDENT"),
    ]

    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
        for email, password, expected_role in roles_credentials:
            res = await ac.post(
                "/api/v1/auth/login",
                json={"email": email, "password": password},
            )
            assert res.status_code == 200, f"Login failed for {email}: {res.text}"
            data = res.json()
            assert "access_token" in data
            assert "refresh_token" in data
            assert data["token_type"] == "bearer"
            assert data["user"]["email"] == email
            assert data["user"]["role"] == expected_role


@pytest.mark.asyncio
async def test_login_invalid_password():
    """Verify invalid password returns 401 Unauthorized."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
        res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "admin@smartcampus.edu", "password": "WrongPassword123!"},
        )
        assert res.status_code == 401
        data = res.json()
        assert data["success"] is False
        assert data["error"]["code"] == "UNAUTHORIZED"


@pytest.mark.asyncio
async def test_registration_and_validation():
    """Verify new student registration, password complexity validation, and duplicate rejection."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
        # Weak password rejection (missing uppercase/digit)
        weak_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Weak Password User",
                "email": "weak@student.smartcampus.edu",
                "password": "weakpassword",
            },
        )
        assert weak_res.status_code == 422

        # Valid registration
        new_email = f"newstudent_{uuid.uuid4().hex[:8]}@student.smartcampus.edu"
        valid_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "New Enrolled Student",
                "email": new_email,
                "password": "StrongStudentPass@2026",
            },
        )
        assert valid_res.status_code == 201
        data = valid_res.json()
        assert data["user"]["email"] == new_email
        assert data["user"]["role"] == "STUDENT"
        assert "access_token" in data

        # Duplicate email rejection
        dup_res = await ac.post(
            "/api/v1/auth/register",
            json={
                "name": "Another Person",
                "email": new_email,
                "password": "StrongStudentPass@2026",
            },
        )
        assert dup_res.status_code == 409
        assert dup_res.json()["error"]["code"] == "EMAIL_ALREADY_EXISTS"


@pytest.mark.asyncio
async def test_current_user_me_and_logout_revocation():
    """Verify /me profile endpoint, logout revocation, and invalidation."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
        # Login
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "aarav.mehta@student.smartcampus.edu", "password": "Campus@2026!"},
        )
        token = login_res.json()["access_token"]
        auth_headers = {"Authorization": f"Bearer {token}"}

        # Check /me
        me_res = await ac.get("/api/v1/auth/me", headers=auth_headers)
        assert me_res.status_code == 200
        assert me_res.json()["email"] == "aarav.mehta@student.smartcampus.edu"

        # Logout
        logout_res = await ac.post("/api/v1/auth/logout", headers=auth_headers)
        assert logout_res.status_code == 200
        assert logout_res.json()["success"] is True

        # Verify revoked token cannot be reused
        revoked_check = await ac.get("/api/v1/auth/me", headers=auth_headers)
        assert revoked_check.status_code == 401
        assert "terminated" in revoked_check.json()["error"]["message"]


@pytest.mark.asyncio
async def test_refresh_token_lifecycle():
    """Verify refresh token exchange for fresh credentials."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
        login_res = await ac.post(
            "/api/v1/auth/login",
            json={"email": "diya.s@student.smartcampus.edu", "password": "Campus@2026!"},
        )
        refresh_token = login_res.json()["refresh_token"]

        # Refresh
        ref_res = await ac.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert ref_res.status_code == 200
        ref_data = ref_res.json()
        assert "access_token" in ref_data
        assert "refresh_token" in ref_data

        # Test new access token
        new_token = ref_data["access_token"]
        me_res = await ac.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {new_token}"})
        assert me_res.status_code == 200


@pytest.mark.asyncio
async def test_role_based_access_control():
    """Verify RBAC permissions matrix and denial of unauthorized roles."""
    async with AsyncClient(transport=ASGITransport(app=app), base_url=BASE_URL) as ac:
        # Get tokens for Student, Staff, Dept Head, Admin, Management
        async def get_token(email: str):
            res = await ac.post("/api/v1/auth/login", json={"email": email, "password": "Campus@2026!"})
            return {"Authorization": f"Bearer {res.json()['access_token']}"}

        student_hdr = await get_token("aarav.mehta@student.smartcampus.edu")
        staff_hdr = await get_token("staff.it@smartcampus.edu")
        head_hdr = await get_token("head.it@smartcampus.edu")
        admin_hdr = await get_token("admin@smartcampus.edu")
        mgmt_hdr = await get_token("director@smartcampus.edu")

        # 1. Student Access Tests
        # Student CAN access student route
        assert (await ac.get("/api/v1/auth/test/student", headers=student_hdr)).status_code == 200
        # Student CANNOT access staff route
        assert (await ac.get("/api/v1/auth/test/staff", headers=student_hdr)).status_code == 403
        # Student CANNOT access dept head route
        assert (await ac.get("/api/v1/auth/test/department-head", headers=student_hdr)).status_code == 403
        # Student CANNOT access admin route
        assert (await ac.get("/api/v1/auth/test/admin", headers=student_hdr)).status_code == 403
        # Student CANNOT access management route
        assert (await ac.get("/api/v1/auth/test/management", headers=student_hdr)).status_code == 403

        # 2. Staff Access Tests
        # Staff CAN access staff route
        assert (await ac.get("/api/v1/auth/test/staff", headers=staff_hdr)).status_code == 200
        # Staff CANNOT access dept head or admin routes
        assert (await ac.get("/api/v1/auth/test/department-head", headers=staff_hdr)).status_code == 403
        assert (await ac.get("/api/v1/auth/test/admin", headers=staff_hdr)).status_code == 403

        # 3. Department Head Access Tests
        # Dept Head CAN access staff and dept-head routes
        assert (await ac.get("/api/v1/auth/test/staff", headers=head_hdr)).status_code == 200
        assert (await ac.get("/api/v1/auth/test/department-head", headers=head_hdr)).status_code == 200
        # Dept Head CANNOT access admin route
        assert (await ac.get("/api/v1/auth/test/admin", headers=head_hdr)).status_code == 403

        # 4. Management Access Tests
        # Management CAN access management analytics route
        assert (await ac.get("/api/v1/auth/test/management", headers=mgmt_hdr)).status_code == 200
        # Management CANNOT access admin configuration route
        assert (await ac.get("/api/v1/auth/test/admin", headers=mgmt_hdr)).status_code == 403

        # 5. Admin Access Tests (Superuser permissions)
        # Admin CAN access staff, dept-head, admin, and management routes
        assert (await ac.get("/api/v1/auth/test/staff", headers=admin_hdr)).status_code == 200
        assert (await ac.get("/api/v1/auth/test/department-head", headers=admin_hdr)).status_code == 200
        assert (await ac.get("/api/v1/auth/test/admin", headers=admin_hdr)).status_code == 200
        assert (await ac.get("/api/v1/auth/test/management", headers=admin_hdr)).status_code == 200
