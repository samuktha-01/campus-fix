"""Security utilities for hashing passwords, signing JWT tokens, and token revocation."""

import re
import uuid
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, Optional, Set, Tuple, Union
import bcrypt
import jwt
from app.core.config import settings

# Thread-safe in-memory blacklist of revoked JWT IDs (JTIs)
_revoked_tokens: Set[str] = set()


def is_token_revoked(jti: str) -> bool:
    """Check if a token has been explicitly invalidated via logout."""
    return jti in _revoked_tokens


def revoke_token(jti: str) -> None:
    """Add a token JTI to the revocation list."""
    if jti:
        _revoked_tokens.add(jti)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plain password against the stored bcrypt hash."""
    try:
        return bcrypt.checkpw(
            plain_password.encode("utf-8"),
            hashed_password.encode("utf-8"),
        )
    except Exception:
        return False


def get_password_hash(password: str) -> str:
    """Generate a bcrypt hash of the provided password with 12 salt rounds."""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")


def validate_password_strength(password: str) -> Tuple[bool, str]:
    """Validate password against security policy."""
    if len(password) < 8:
        return False, "Password must be at least 8 characters long."
    if not re.search(r"[A-Z]", password):
        return False, "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return False, "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password) and not re.search(r"[!@#$%^&*(),.?\":{}|<>]", password):
        return False, "Password must contain at least one digit or special symbol."
    return True, "Password meets complexity requirements."


def create_access_token(
    subject: Union[str, Any],
    role: str,
    department_id: Optional[str] = None,
    expires_delta: Optional[timedelta] = None,
) -> Tuple[str, str]:
    """Create a signed JWT access token. Returns (token_string, jti)."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    jti = str(uuid.uuid4())
    to_encode = {
        "sub": str(subject),
        "role": str(role),
        "department_id": str(department_id) if department_id else None,
        "jti": jti,
        "exp": expire,
        "iat": now,
        "type": "access",
    }
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti


def create_refresh_token(
    subject: Union[str, Any],
    expires_delta: Optional[timedelta] = None,
) -> Tuple[str, str]:
    """Create a signed JWT refresh token. Returns (token_string, jti)."""
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)

    jti = str(uuid.uuid4())
    to_encode = {
        "sub": str(subject),
        "jti": jti,
        "exp": expire,
        "iat": now,
        "type": "refresh",
    }
    token = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return token, jti


def decode_token(token: str) -> Dict[str, Any]:
    """Decode and validate signature and expiration of a JWT token."""
    return jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
