"""API v1 router aggregator."""

from fastapi import APIRouter
from app.api.v1.endpoints import auth, health

api_router = APIRouter()

# Health probe
api_router.include_router(health.router, prefix="/health", tags=["Health"])

# Authentication & RBAC
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
