"""
MPLAD Rakshak — Authentication Router
=======================================
Mock JWT authentication with role-based access control.
"""

from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from jose import jwt, JWTError
from passlib.context import CryptContext

from config import settings
from database import get_db
from models import User
from schemas import LoginRequest, LoginResponse, UserResponse

import bcrypt

router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])
security = HTTPBearer(auto_error=False)

def hash_password(password: str) -> str:
    pwd_bytes = password.encode("utf-8")[:72]
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(pwd_bytes, salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    try:
        pwd_bytes = plain_password.encode("utf-8")[:72]
        return bcrypt.checkpw(pwd_bytes, hashed_password.encode("utf-8"))
    except Exception:
        return False


# ═══════════════════════════════════════════════════════════
# JWT Helpers
# ═══════════════════════════════════════════════════════════

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """Create a JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=settings.JWT_EXPIRATION_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, settings.JWT_SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db),
) -> Optional[User]:
    """
    Extract and validate the current user from JWT token.
    Returns None if no token is provided (for public endpoints).
    """
    if credentials is None:
        return None

    try:
        payload = jwt.decode(
            credentials.credentials,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token payload")

        user = db.query(User).filter(User.username == username).first()
        if user is None:
            raise HTTPException(status_code=401, detail="User not found")

        return user

    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


def require_auth(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db),
) -> User:
    """Dependency that requires authentication."""
    if credentials is None:
        raise HTTPException(status_code=401, detail="Authentication required")

    user = get_current_user(credentials, db)
    if user is None:
        raise HTTPException(status_code=401, detail="Authentication required")
    return user


def require_role(*roles):
    """Dependency factory that requires specific roles."""
    def _check_role(user: User = Depends(require_auth)):
        if user.role not in roles and user.role.value not in roles:
            raise HTTPException(
                status_code=403,
                detail=f"Access denied. Required roles: {[r.value if hasattr(r, 'value') else r for r in roles]}",
            )
        return user
    return _check_role


# ═══════════════════════════════════════════════════════════
# Endpoints
# ═══════════════════════════════════════════════════════════

@router.post("/login", response_model=LoginResponse)
def login(request: LoginRequest, db: Session = Depends(get_db)):
    """
    Authenticate user and return JWT token.
    For the prototype, uses simple password verification against hashed passwords.
    """
    user = db.query(User).filter(User.username == request.username).first()

    if not user or not verify_password(request.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is deactivated",
        )

    access_token = create_access_token(
        data={"sub": user.username, "role": user.role.value}
    )

    return LoginResponse(
        access_token=access_token,
        role=user.role.value,
        username=user.username,
        full_name=user.full_name,
        district=user.district,
        state=user.state,
    )


@router.get("/me", response_model=UserResponse)
def get_me(user: User = Depends(require_auth)):
    """Get the current authenticated user's profile."""
    return user


@router.get("/users", response_model=list[UserResponse])
def list_users(
    db: Session = Depends(get_db),
    user: User = Depends(require_role("MINISTRY_ADMIN")),
):
    """List all users (Ministry Admin only)."""
    return db.query(User).all()
