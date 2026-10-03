import uuid
from typing import Dict, Any
from pydantic import BaseModel, EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
import httpx
from app.core.config import settings
from app.core.security import get_current_user, DEMO_USER
from app.core.logging import logger
from app.database.repositories.profiles_repo import profiles_repo

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

class AuthLoginRequest(BaseModel):
    email: str
    password: str

class AuthSignupRequest(BaseModel):
    email: str
    password: str
    display_name: str = "Adhi User"

class AuthResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

@router.post("/signup", response_model=AuthResponse)
async def signup(body: AuthSignupRequest):
    """Register new account via Supabase Auth or mock demo account."""
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/signup",
                    headers={"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"},
                    json={
                        "email": body.email,
                        "password": body.password,
                        "data": {"full_name": body.display_name, "preferred_name": body.display_name}
                    }
                )
                if resp.status_code in (200, 201):
                    data = resp.json()
                    user = data.get("user") or {}
                    token = data.get("access_token") or "demo-token"
                    return AuthResponse(
                        access_token=token,
                        user={
                            "id": user.get("id", str(uuid.uuid4())),
                            "email": user.get("email", body.email),
                            "display_name": body.display_name,
                            "preferred_name": body.display_name
                        }
                    )
                else:
                    logger.warning(f"Supabase signup failed: {resp.text}")
        except Exception as e:
            logger.error(f"Supabase signup request error: {e}")

    # Fallback development registration
    user_id = str(uuid.uuid4())
    user_data = {
        "id": user_id,
        "email": body.email,
        "display_name": body.display_name,
        "preferred_name": body.display_name
    }
    profiles_repo.update(user_id, {"display_name": body.display_name, "preferred_name": body.display_name})
    return AuthResponse(
        access_token=f"mock-token-{user_id}",
        user=user_data
    )

@router.post("/login", response_model=AuthResponse)
async def login(body: AuthLoginRequest):
    """Authenticate existing account via Supabase Auth or demo login."""
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.post(
                    f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/token?grant_type=password",
                    headers={"apikey": settings.SUPABASE_ANON_KEY, "Content-Type": "application/json"},
                    json={"email": body.email, "password": body.password}
                )
                if resp.status_code == 200:
                    data = resp.json()
                    user = data.get("user") or {}
                    return AuthResponse(
                        access_token=data.get("access_token"),
                        user={
                            "id": user.get("id"),
                            "email": user.get("email"),
                            "display_name": user.get("user_metadata", {}).get("full_name") or user.get("email"),
                            "preferred_name": user.get("user_metadata", {}).get("preferred_name") or "User"
                        }
                    )
        except Exception as e:
            logger.error(f"Supabase login error: {e}")

    # Fallback demo authentication
    if body.email.lower() == "demo@adhiijarvis.ai" or settings.APP_ENV == "development":
        profile = profiles_repo.get(DEMO_USER["id"])
        return AuthResponse(
            access_token="demo-token",
            user={
                "id": DEMO_USER["id"],
                "email": body.email,
                "display_name": profile.get("display_name", DEMO_USER["display_name"]),
                "preferred_name": profile.get("preferred_name", DEMO_USER["preferred_name"])
            }
        )

    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

@router.get("/me")
async def get_me(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve current authenticated user and profile."""
    profile = profiles_repo.get(user["id"])
    return {
        "user": user,
        "profile": profile
    }

@router.post("/logout")
async def logout(user: Dict[str, Any] = Depends(get_current_user)):
    return {"status": "success", "message": "Successfully logged out"}
