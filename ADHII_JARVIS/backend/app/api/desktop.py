from fastapi import APIRouter, Depends, HTTPException, Body
from typing import Dict, Any, Optional
from app.companion.desktop_agent import desktop_companion
from app.core.security import get_current_user
from app.core.logging import logger

router = APIRouter(prefix="/api/desktop", tags=["Desktop Companion"])

@router.get("/status")
async def get_desktop_status():
    """Returns the authenticated Desktop Companion connectivity status and device info."""
    return {
        "status": "online" if desktop_companion.is_connected else "offline",
        "device_id": desktop_companion.device_id,
        "os": desktop_companion.os_name,
        "agent_connected": desktop_companion.is_connected,
        "last_heartbeat": desktop_companion.last_heartbeat.isoformat()
    }

@router.get("/telemetry")
async def get_desktop_telemetry():
    """Returns actual real hardware telemetry (CPU, RAM, Disk, Battery, Uptime) without fabrication."""
    return desktop_companion.get_telemetry()

@router.post("/command")
async def execute_desktop_command(
    payload: Dict[str, Any] = Body(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Executes a structured command through the Desktop Companion.
    Validates tool allowlist, action allowlist, parameters, and confirmation policies.
    """
    confirmed = payload.get("confirmed", False)
    result = desktop_companion.execute_command(payload, confirmed=confirmed)
    return result
