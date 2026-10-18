"""SmartCampus AI FastAPI application entrypoint."""

import os
import logging
from contextlib import asynccontextmanager
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles

from app.api.v1.api import api_router
from app.api.v1.endpoints.tickets import router as tickets_router
from app.api.v1.endpoints.auth import router as auth_router
from app.core.config import settings
from app.core.database import Base, engine
from app.core.exceptions import AppException

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - [%(levelname)s] - %(name)s: %(message)s",
)
logger = logging.getLogger("smartcampus")

# Uploads directory
UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context for startup and shutdown routines."""
    logger.info("Starting up SmartCampus AI Backend...")
    # Create tables if using SQLite for instant development
    if settings.DATABASE_URL.startswith("sqlite"):
        async with engine.begin() as conn:
            await conn.run_sync(Base.metadata.create_all)
        logger.info("SQLite database tables verified/initialized.")
    yield
    logger.info("Shutting down SmartCampus AI Backend...")
    await engine.dispose()


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Intelligent Campus Ticketing and Issue Resolution System API",
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.BACKEND_CORS_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


# Global AppException Handler
@app.exception_handler(AppException)
async def app_exception_handler(request: Request, exc: AppException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "error": exc.detail},
    )


# Generic Fallback Exception Handler
@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    logger.exception(f"Unhandled exception during {request.method} {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected internal server error occurred",
                "details": str(exc) if settings.DEBUG else [],
            },
        },
    )


# Static files mount for ticket photo and video attachments
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Mount API V1
app.include_router(api_router, prefix=settings.API_V1_STR)

# Also mount /api/tickets and /api/auth directly to satisfy direct /api calls
app.include_router(tickets_router, prefix="/api/tickets", tags=["Tickets (Direct /api)"])
app.include_router(auth_router, prefix="/api/auth", tags=["Authentication (Direct /api)"])


@app.get("/", tags=["Root"])
async def root():
    """Root welcoming endpoint redirecting users to docs."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API v{settings.VERSION}",
        "documentation": "/docs",
        "health": f"{settings.API_V1_STR}/health",
        "tickets_api": "/api/tickets",
    }
