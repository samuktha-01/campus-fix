"""Health check endpoints for container and service readiness."""

from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession
from app.core.config import settings
from app.core.database import get_db

router = APIRouter()


@router.get("", summary="Health Check")
async def health_check(db: AsyncSession = Depends(get_db)):
    """Liveness and readiness probe for database, configuration, and AI mode."""
    db_status = "healthy"
    try:
        await db.execute(text("SELECT 1"))
    except Exception as e:
        db_status = f"unhealthy: {str(e)}"

    return {
        "status": "ok" if "unhealthy" not in db_status else "degraded",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "ai_provider": settings.AI_PROVIDER,
    }
