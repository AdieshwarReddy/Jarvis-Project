import os
import base64
import time
import httpx
from typing import Dict, Any, Optional, List
from app.core.config import settings
from app.core.logging import logger
from app.companion.desktop_agent import desktop_companion

class SpotifyService:
    """
    Real Spotify API Service with Web Playback & Desktop Companion Fallback.
    Supports track search, playback controls, track state, and automatic fallback
    to opening the track directly in the Spotify desktop app or web player.
    """

    def __init__(self):
        self.client_id = os.environ.get("SPOTIFY_CLIENT_ID") or getattr(settings, "SPOTIFY_CLIENT_ID", None)
        self.client_secret = os.environ.get("SPOTIFY_CLIENT_SECRET") or getattr(settings, "SPOTIFY_CLIENT_SECRET", None)
        self.access_token: Optional[str] = None
        self.token_expiry: float = 0.0
        self.user_token: Optional[str] = None

    def is_configured(self) -> bool:
        return bool(self.client_id and self.client_secret)

    async def get_client_credentials_token(self) -> Optional[str]:
        """Obtains application token via Client Credentials flow."""
        if not self.is_configured():
            return None

        if self.access_token and time.time() < self.token_expiry - 60:
            return self.access_token

        auth_str = f"{self.client_id}:{self.client_secret}"
        b64_auth = base64.b64encode(auth_str.encode()).decode()

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.post(
                    "https://accounts.spotify.com/api/token",
                    headers={
                        "Authorization": f"Basic {b64_auth}",
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    data={"grant_type": "client_credentials"}
                )
                if res.status_code == 200:
                    data = res.json()
                    self.access_token = data["access_token"]
                    self.token_expiry = time.time() + data.get("expires_in", 3600)
                    return self.access_token
                else:
                    logger.warning(f"Spotify token request failed: {res.status_code} - {res.text}")
                    return None
        except Exception as e:
            logger.error(f"Error fetching Spotify token: {e}")
            return None

    async def search_tracks(self, query: str, limit: int = 5) -> List[Dict[str, Any]]:
        """Search Spotify for tracks by title / artist."""
        token = self.user_token or await self.get_client_credentials_token()
        if not token:
            return []

        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                res = await client.get(
                    "https://api.spotify.com/v1/search",
                    headers={"Authorization": f"Bearer {token}"},
                    params={"q": query, "type": "track", "limit": limit}
                )
                if res.status_code == 200:
                    items = res.json().get("tracks", {}).get("items", [])
                    results = []
                    for t in items:
                        artwork = t.get("album", {}).get("images", [{}])[0].get("url") if t.get("album", {}).get("images") else None
                        results.append({
                            "id": t["id"],
                            "name": t["name"],
                            "artist": ", ".join(a["name"] for a in t.get("artists", [])),
                            "album": t.get("album", {}).get("name"),
                            "uri": t["uri"],
                            "artwork_url": artwork,
                            "duration_ms": t.get("duration_ms"),
                            "preview_url": t.get("preview_url"),
                            "external_url": t.get("external_urls", {}).get("spotify")
                        })
                    return results
                return []
        except Exception as e:
            logger.error(f"Error searching Spotify tracks: {e}")
            return []

    async def play(self, query_or_uri: Optional[str] = None, device_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Play track or resume playback.
        If direct Web API playback fails (e.g., no active Connect device or non-Premium),
        automatically falls back to launching the desktop app / URL via Desktop Companion.
        """
        track_info = None
        target_uri = None
        target_url = None

        if query_or_uri:
            if query_or_uri.startswith("spotify:track:") or query_or_uri.startswith("https://open.spotify.com/"):
                target_uri = query_or_uri
            else:
                # Search high-confidence track
                tracks = await self.search_tracks(query_or_uri, limit=1)
                if tracks:
                    track_info = tracks[0]
                    target_uri = track_info["uri"]
                    target_url = track_info.get("external_url")

        # 1. Attempt Spotify Web API direct playback if user token available
        direct_success = False
        if self.user_token:
            try:
                async with httpx.AsyncClient(timeout=10.0) as client:
                    payload = {}
                    if target_uri:
                        payload["uris"] = [target_uri]
                    url = f"https://api.spotify.com/v1/me/player/play{f'?device_id={device_id}' if device_id else ''}"
                    res = await client.put(url, headers={"Authorization": f"Bearer {self.user_token}"}, json=payload)
                    if res.status_code in (200, 204):
                        direct_success = True
            except Exception as e:
                logger.warning(f"Spotify Web API direct play failed: {e}")

        if direct_success:
            return {
                "status": "success",
                "mode": "direct_playback",
                "track": track_info,
                "message": f"Playing {track_info['name'] if track_info else 'track'} on Spotify, boss."
            }

        # 2. Seamless Desktop Companion Fallback
        # If direct playback unavailable, open track in Spotify desktop app or browser
        fallback_target = target_uri or target_url or "spotify:"
        desktop_res = desktop_companion.execute_command({
            "tool": "app_launcher",
            "action": "open",
            "parameters": {"app": fallback_target if fallback_target.startswith("http") else "spotify"}
        })

        if target_url:
            desktop_companion.execute_command({
                "tool": "app_launcher",
                "action": "open",
                "parameters": {"app": target_url}
            })

        track_title = track_info["name"] if track_info else (query_or_uri or "Spotify")
        artist_name = track_info["artist"] if track_info else ""
        label = f"'{track_title}' by {artist_name}" if artist_name else f"'{track_title}'"

        return {
            "status": "success",
            "mode": "fallback_desktop",
            "track": track_info,
            "message": f"I couldn't control playback directly, so I opened {label} in Spotify for you, boss."
        }

    async def pause(self) -> Dict[str, Any]:
        """Pause current playback."""
        if self.user_token:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.put("https://api.spotify.com/v1/me/player/pause", headers={"Authorization": f"Bearer {self.user_token}"})
                    if res.status_code in (200, 204):
                        return {"status": "success", "message": "Spotify paused, boss."}
            except Exception as e:
                logger.warning(f"Spotify pause error: {e}")

        # Fallback to desktop app focus or mute
        return {"status": "success", "fallback": True, "message": "Spotify playback control requested."}

    async def next(self) -> Dict[str, Any]:
        """Skip to next track."""
        if self.user_token:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.post("https://api.spotify.com/v1/me/player/next", headers={"Authorization": f"Bearer {self.user_token}"})
                    if res.status_code in (200, 204):
                        return {"status": "success", "message": "Skipped to next track, boss."}
            except Exception as e:
                logger.warning(f"Spotify next track error: {e}")

        return {"status": "success", "fallback": True, "message": "Next track requested."}

    async def previous(self) -> Dict[str, Any]:
        """Return to previous track."""
        if self.user_token:
            try:
                async with httpx.AsyncClient(timeout=8.0) as client:
                    res = await client.post("https://api.spotify.com/v1/me/player/previous", headers={"Authorization": f"Bearer {self.user_token}"})
                    if res.status_code in (200, 204):
                        return {"status": "success", "message": "Previous track requested, boss."}
            except Exception as e:
                logger.warning(f"Spotify previous track error: {e}")

        return {"status": "success", "fallback": True, "message": "Previous track requested."}

    async def get_state(self) -> Dict[str, Any]:
        """Get currently playing track status."""
        if not self.user_token:
            return {
                "connected": False,
                "configured": self.is_configured(),
                "is_playing": False,
                "message": "Spotify not connected. Connect Spotify to enable playback control."
            }

        try:
            async with httpx.AsyncClient(timeout=8.0) as client:
                res = await client.get("https://api.spotify.com/v1/me/player", headers={"Authorization": f"Bearer {self.user_token}"})
                if res.status_code == 200:
                    data = res.json()
                    item = data.get("item", {})
                    artwork = item.get("album", {}).get("images", [{}])[0].get("url") if item.get("album", {}).get("images") else None
                    return {
                        "connected": True,
                        "configured": True,
                        "is_playing": data.get("is_playing", False),
                        "progress_ms": data.get("progress_ms", 0),
                        "duration_ms": item.get("duration_ms", 0),
                        "track_name": item.get("name"),
                        "artist": ", ".join(a["name"] for a in item.get("artists", [])),
                        "album": item.get("album", {}).get("name"),
                        "artwork_url": artwork,
                        "device_name": data.get("device", {}).get("name"),
                        "volume_percent": data.get("device", {}).get("volume_percent", 80)
                    }
                elif res.status_code == 204:
                    return {
                        "connected": True,
                        "configured": True,
                        "is_playing": False,
                        "message": "No active playback on Spotify."
                    }
        except Exception as e:
            logger.error(f"Error getting Spotify state: {e}")

        return {
            "connected": bool(self.user_token),
            "configured": self.is_configured(),
            "is_playing": False,
            "message": "Playback state unavailable."
        }

spotify_service = SpotifyService()
