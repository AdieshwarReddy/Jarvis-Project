from fastapi import APIRouter, Depends, Query, Body
from typing import Dict, Any, Optional
from app.services.spotify_service import spotify_service
from app.core.security import get_current_user

router = APIRouter(prefix="/api/spotify", tags=["Spotify"])

@router.get("/status")
async def spotify_status():
    """Return Spotify connectivity and configuration status."""
    return {
        "connected": bool(spotify_service.user_token),
        "configured": spotify_service.is_configured(),
        "client_id_available": bool(spotify_service.client_id)
    }

@router.get("/search")
async def spotify_search(q: str = Query(..., description="Track or artist search query")):
    """Search Spotify catalog for tracks."""
    tracks = await spotify_service.search_tracks(q, limit=6)
    return {"query": q, "tracks": tracks}

@router.post("/play")
async def spotify_play(data: Dict[str, Any] = Body(default={})):
    """Start or resume Spotify playback, with automatic desktop app fallback."""
    query_or_uri = data.get("query") or data.get("uri")
    device_id = data.get("device_id")
    return await spotify_service.play(query_or_uri, device_id=device_id)

@router.post("/pause")
async def spotify_pause():
    """Pause playback."""
    return await spotify_service.pause()

@router.post("/next")
async def spotify_next():
    """Skip track."""
    return await spotify_service.next()

@router.post("/previous")
async def spotify_previous():
    """Previous track."""
    return await spotify_service.previous()

@router.get("/state")
async def spotify_state():
    """Get current playback state."""
    return await spotify_service.get_state()

@router.post("/token")
async def set_user_token(
    data: Dict[str, str] = Body(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Save user Spotify OAuth access token."""
    token = data.get("access_token")
    if token:
        spotify_service.user_token = token
        return {"status": "success", "message": "Spotify account linked successfully."}
    return {"status": "error", "message": "Missing access_token."}
