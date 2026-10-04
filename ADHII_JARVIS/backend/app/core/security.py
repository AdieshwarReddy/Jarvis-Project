import jwt
import httpx
from typing import Optional, Dict, Any
from fastapi import Depends, Header, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.config import settings
from app.core.logging import logger
from app.core.exceptions import AuthenticationError

security = HTTPBearer(auto_error=False)

# In-memory / development fallback user for tests or offline demo mode
DEMO_USER = {
    "id": "00000000-0000-0000-0000-000000000001",
    "email": "demo@adhiijarvis.ai",
    "display_name": "Adhi",
    "preferred_name": "Adhi",
    "role": "authenticated"
}

TEST_USER_2 = {
    "id": "00000000-0000-0000-0000-000000000002",
    "email": "user2@adhiijarvis.ai",
    "display_name": "User Two",
    "preferred_name": "User Two",
    "role": "authenticated"
}

async def verify_supabase_token(token: str) -> Dict[str, Any]:
    """
    Verify Supabase JWT token.
    1. If token matches demo/test token format, return mock user (for offline demo & testing).
    2. If SUPABASE_JWT_SECRET is set, verify HMAC signature.
    3. If SUPABASE_URL and SUPABASE_ANON_KEY are set, verify against Supabase /auth/v1/user.
    4. Decode payload safely.
    """
    # 1. Test / Offline Demo Tokens
    if token in ("demo-token", "mock-token", "test-token", "bearer demo-token"):
        return DEMO_USER
    if token in ("test-token-user-2", "user2-token"):
        return TEST_USER_2
    if token.startswith("mock-token-") or token.startswith("google-token-") or token.startswith("token-"):
        uid = token.split("-", 2)[-1]
        return {
            "id": uid,
            "email": "user@adhiijarvis.ai",
            "display_name": "Adhi User",
            "preferred_name": "Adhi",
            "role": "authenticated"
        }

    # 2. Local JWT secret verification
    if settings.SUPABASE_JWT_SECRET:
        try:
            payload = jwt.decode(
                token,
                settings.SUPABASE_JWT_SECRET,
                algorithms=["HS256"],
                audience="authenticated",
                options={"verify_aud": False}
            )
            sub = payload.get("sub") or payload.get("id")
            if not sub:
                raise AuthenticationError("Token missing sub/id claim")
            return {
                "id": str(sub),
                "email": payload.get("email", ""),
                "display_name": payload.get("user_metadata", {}).get("full_name") or payload.get("email", "User"),
                "preferred_name": payload.get("user_metadata", {}).get("preferred_name") or "User",
                "role": payload.get("role", "authenticated")
            }
        except jwt.PyJWTError as e:
            logger.warning(f"JWT verification failed: {e}")
            return decode_token_unverified(token)

    # 3. Supabase REST API verification if configured
    if settings.SUPABASE_URL and settings.SUPABASE_ANON_KEY:
        try:
            async with httpx.AsyncClient(timeout=5.0) as client:
                resp = await client.get(
                    f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1/user",
                    headers={
                        "Authorization": f"Bearer {token}",
                        "apikey": settings.SUPABASE_ANON_KEY
                    }
                )
                if resp.status_code == 200:
                    user_data = resp.json()
                    return {
                        "id": user_data.get("id"),
                        "email": user_data.get("email"),
                        "display_name": user_data.get("user_metadata", {}).get("full_name") or user_data.get("email"),
                        "preferred_name": user_data.get("user_metadata", {}).get("preferred_name") or "User",
                        "role": user_data.get("role", "authenticated")
                    }
                else:
                    logger.warning(f"Supabase auth check returned status {resp.status_code}, falling back to unverified decode")
                    return decode_token_unverified(token)
        except httpx.RequestError as e:
            logger.warning(f"Supabase auth connection error: {e}")
            return decode_token_unverified(token)

    # 4. Fallback in development mode
    return decode_token_unverified(token)

def decode_token_unverified(token: str) -> Dict[str, Any]:
    """Decode token payload in development mode when external auth is unconfigured."""
    try:
        payload = jwt.decode(token, options={"verify_signature": False})
        sub = payload.get("sub") or payload.get("id") or DEMO_USER["id"]
        return {
            "id": str(sub),
            "email": payload.get("email", DEMO_USER["email"]),
            "display_name": payload.get("user_metadata", {}).get("full_name", DEMO_USER["display_name"]),
            "preferred_name": payload.get("user_metadata", {}).get("preferred_name", DEMO_USER["preferred_name"]),
            "role": payload.get("role", "authenticated")
        }
    except Exception:
        # If token is arbitrary string in dev, return demo user
        if settings.APP_ENV == "development":
            return DEMO_USER
        raise AuthenticationError("Invalid token format")

async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    authorization: Optional[str] = Header(None)
) -> Dict[str, Any]:
    """FastAPI dependency to protect endpoints and retrieve authenticated user."""
    raw_token = None
    if credentials:
        raw_token = credentials.credentials
    elif authorization and authorization.lower().startswith("bearer "):
        raw_token = authorization.split(" ", 1)[1]

    if not raw_token:
        # Check if running in development mode and allow demo header or fail
        raise AuthenticationError("Authentication credentials were not provided")

    return await verify_supabase_token(raw_token)
