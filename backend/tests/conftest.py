"""Pytest fixtures for database testing with isolated async sessions and NullPool."""

import asyncio
from typing import AsyncGenerator
import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlalchemy.pool import NullPool
from app.core.config import settings
from app.core.database import get_db
from app.main import app

# Test engine using NullPool to prevent event loop mismatch on Windows
test_engine = create_async_engine(
    settings.DATABASE_URL,
    poolclass=NullPool,
    echo=False,
)

test_session_maker = async_sessionmaker(
    bind=test_engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autocommit=False,
    autoflush=False,
)


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a clean, isolated async session bound to the active test loop."""
    async with test_session_maker() as session:
        try:
            yield session
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()


@pytest_asyncio.fixture(autouse=True)
async def override_app_db_dependency():
    """Automatically override the FastAPI get_db dependency to use NullPool during test requests."""
    async def _test_get_db() -> AsyncGenerator[AsyncSession, None]:
        async with test_session_maker() as session:
            try:
                yield session
            except Exception:
                await session.rollback()
                raise
            finally:
                await session.close()

    app.dependency_overrides[get_db] = _test_get_db
    yield
    app.dependency_overrides.pop(get_db, None)
