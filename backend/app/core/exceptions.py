"""Custom exception classes and HTTP error representations."""

from typing import Any, Optional
from fastapi import HTTPException, status


class AppException(HTTPException):
    """Base application exception."""

    def __init__(
        self,
        status_code: int = status.HTTP_400_BAD_REQUEST,
        code: str = "BAD_REQUEST",
        message: str = "An error occurred",
        details: Optional[Any] = None,
    ):
        super().__init__(
            status_code=status_code,
            detail={"code": code, "message": message, "details": details or []},
        )


class NotFoundException(AppException):
    def __init__(self, resource: str, resource_id: Any):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            code="NOT_FOUND",
            message=f"{resource} with id '{resource_id}' was not found",
        )


class UnauthorizedException(AppException):
    def __init__(self, message: str = "Could not validate credentials"):
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            code="UNAUTHORIZED",
            message=message,
        )


class ForbiddenException(AppException):
    def __init__(self, message: str = "You do not have permission to perform this action"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            code="FORBIDDEN",
            message=message,
        )
