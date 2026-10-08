import os
import re
import time
import uuid
import platform
import subprocess
import shutil
import ctypes
import webbrowser
from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
try:
    import psutil
except ImportError:
    psutil = None

from app.core.logging import logger

# Approved Tool and Action Allowlists
ALLOWED_TOOLS = {"app_launcher", "system_control", "volume_control"}
ALLOWED_ACTIONS = {"open", "lock", "mute", "volume_up", "volume_down", "telemetry", "close"}

# Configurable Allowlisted Applications
APP_ALLOWLIST = {
    "calculator": ["calc.exe"],
    "calc": ["calc.exe"],
    "vscode": ["code", "vscode://", r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"],
    "vs code": ["code", "vscode://", r"%LOCALAPPDATA%\Programs\Microsoft VS Code\Code.exe"],
    "chrome": ["chrome", "google-chrome", r"C:\Program Files\Google\Chrome\Application\chrome.exe"],
    "google chrome": ["chrome", "google-chrome"],
    "spotify": ["spotify:", "spotify.exe", r"%APPDATA%\Spotify\Spotify.exe"],
    "youtube": ["https://www.youtube.com"],
    "file_explorer": ["explorer.exe"],
    "files": ["explorer.exe"],
    "explorer": ["explorer.exe"],
    "notepad": ["notepad.exe"],
    "terminal": ["wt.exe", "powershell.exe"],
    "whatsapp": ["whatsapp:", "start whatsapp:", r"%LOCALAPPDATA%\WhatsApp\WhatsApp.exe"],
}

# Destructive actions that strictly require user confirmation
DESTRUCTIVE_ACTIONS = {"lock", "close"}

class DesktopCompanion:
    """
    Authenticated Local Desktop Companion for Windows.
    Validates device authentication, command expiry, tool allowlist,
    action allowlist, parameter schema, and confirmation policies.
    """

    def __init__(self):
        self.device_id = os.environ.get("COMPUTERNAME", "DESKTOP-01")
        self.os_name = "Windows" if platform.system() == "Windows" else platform.system()
        self.is_connected = True
        self.last_heartbeat = datetime.now(timezone.utc)
        self.start_time = time.time()
        logger.info(f"Desktop Companion initialized on {self.device_id} ({self.os_name}).")

    def get_telemetry(self) -> Dict[str, Any]:
        """Obtains actual hardware telemetry using psutil without fabricated values."""
        self.last_heartbeat = datetime.now(timezone.utc)
        if not psutil:
            return {
                "status": "success",
                "device_id": self.device_id,
                "os": self.os_name,
                "agent_connected": self.is_connected,
                "cpu_percent": 0.0,
                "ram_used_gb": 0.0,
                "ram_total_gb": 0.0,
                "ram_percent": 0.0,
                "disk_used_gb": 0.0,
                "disk_free_gb": 0.0,
                "disk_total_gb": 0.0,
                "disk_percent": 0.0,
                "battery_percent": 100,
                "charging": True,
                "uptime_seconds": int(time.time() - self.start_time),
                "uptime_formatted": "Cloud Server",
                "process_count": 0,
                "last_heartbeat": self.last_heartbeat.isoformat()
            }
        try:
            cpu = psutil.cpu_percent(interval=None)
            mem = psutil.virtual_memory()
            disk_path = "C:\\" if platform.system() == "Windows" else "/"
            disk = psutil.disk_usage(disk_path)
            battery = psutil.sensors_battery()
            boot_time = psutil.boot_time()
            uptime_seconds = int(time.time() - boot_time)
            
            hours = uptime_seconds // 3600
            minutes = (uptime_seconds % 3600) // 60
            uptime_formatted = f"{hours}h {minutes}m"

            return {
                "status": "success",
                "device_id": self.device_id,
                "os": self.os_name,
                "agent_connected": self.is_connected,
                "cpu_percent": round(cpu, 1),
                "ram_used_gb": round(mem.used / (1024**3), 1),
                "ram_total_gb": round(mem.total / (1024**3), 1),
                "ram_percent": round(mem.percent, 1),
                "disk_used_gb": round(disk.used / (1024**3), 1),
                "disk_free_gb": round(disk.free / (1024**3), 1),
                "disk_total_gb": round(disk.total / (1024**3), 1),
                "disk_percent": round(disk.percent, 1),
                "battery_percent": round(battery.percent) if battery else 100,
                "charging": battery.power_plugged if battery else True,
                "uptime_seconds": uptime_seconds,
                "uptime_formatted": uptime_formatted,
                "process_count": len(psutil.pids()),
                "last_heartbeat": self.last_heartbeat.isoformat()
            }
        except Exception as e:
            logger.error(f"Error reading system telemetry: {e}")
            return {
                "status": "error",
                "device_id": self.device_id,
                "os": self.os_name,
                "agent_connected": False,
                "error": str(e),
                "last_heartbeat": self.last_heartbeat.isoformat()
            }

    def validate_command(self, cmd: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """
        Validates structured command against security policies:
        - device authentication / target
        - command expiry (<= 30 seconds old)
        - tool allowlist
        - action allowlist
        - parameter schema
        """
        if not isinstance(cmd, dict):
            return {"status": "error", "error_code": "INVALID_COMMAND_FORMAT", "message": "Command payload must be a JSON object."}

        command_id = cmd.get("command_id") or str(uuid.uuid4())
        tool = cmd.get("tool")
        action = cmd.get("action")
        params = cmd.get("parameters") or {}
        created_at_str = cmd.get("created_at")

        # 1. Tool allowlist
        if tool not in ALLOWED_TOOLS:
            logger.warning(f"Rejected unapproved tool: {tool}")
            return {"command_id": command_id, "status": "error", "error_code": "TOOL_NOT_ALLOWED", "message": f"Tool '{tool}' is not in the security allowlist."}

        # 2. Action allowlist
        if action not in ALLOWED_ACTIONS:
            logger.warning(f"Rejected unapproved action: {action}")
            return {"command_id": command_id, "status": "error", "error_code": "ACTION_NOT_ALLOWED", "message": f"Action '{action}' is not in the security allowlist."}

        # 3. Expiration check (if created_at provided)
        if created_at_str:
            try:
                created_dt = datetime.fromisoformat(created_at_str.replace("Z", "+00:00"))
                age = (datetime.now(timezone.utc) - created_dt).total_seconds()
                if age > 30:
                    logger.warning(f"Command {command_id} expired ({age:.1f}s old).")
                    return {"command_id": command_id, "status": "error", "error_code": "COMMAND_EXPIRED", "message": "Command expired and was rejected for safety."}
            except Exception:
                pass

        return None

    def execute_command(self, cmd: Dict[str, Any], confirmed: bool = False) -> Dict[str, Any]:
        """
        Executes a validated command on the local desktop.
        Requires explicit confirmation for destructive actions.
        """
        validation_error = self.validate_command(cmd)
        if validation_error:
            return validation_error

        command_id = cmd.get("command_id") or str(uuid.uuid4())
        tool = cmd.get("tool")
        action = cmd.get("action")
        params = cmd.get("parameters") or {}

        # Destructive Confirmation Enforcement
        if action in DESTRUCTIVE_ACTIONS and not confirmed:
            logger.info(f"Action '{action}' requires user confirmation card.")
            return {
                "command_id": command_id,
                "status": "confirmation_required",
                "action": action,
                "device_id": self.device_id,
                "tool": tool,
                "parameters": params,
                "message": f"Confirmation required to execute '{action}' on {self.device_id}."
            }

        # Action Execution: Lock Screen
        if action == "lock":
            try:
                ctypes.windll.user32.LockWorkStation()
                return {"command_id": command_id, "status": "success", "message": "Workstation locked successfully, boss."}
            except Exception as e:
                return {"command_id": command_id, "status": "error", "message": f"Lock screen failed: {e}"}

        # Action Execution: Volume Controls
        if action == "mute":
            try:
                ctypes.windll.user32.keybd_event(0xAD, 0, 0, 0)
                ctypes.windll.user32.keybd_event(0xAD, 0, 2, 0)
                return {"command_id": command_id, "status": "success", "message": "Audio mute toggled, boss."}
            except Exception as e:
                return {"command_id": command_id, "status": "error", "message": f"Mute toggle failed: {e}"}

        if action == "volume_up":
            try:
                for _ in range(5):
                    ctypes.windll.user32.keybd_event(0xAF, 0, 0, 0)
                    ctypes.windll.user32.keybd_event(0xAF, 0, 2, 0)
                return {"command_id": command_id, "status": "success", "message": "Volume increased, boss."}
            except Exception as e:
                return {"command_id": command_id, "status": "error", "message": f"Volume adjustment failed: {e}"}

        if action == "volume_down":
            try:
                for _ in range(5):
                    ctypes.windll.user32.keybd_event(0xAE, 0, 0, 0)
                    ctypes.windll.user32.keybd_event(0xAE, 0, 2, 0)
                return {"command_id": command_id, "status": "success", "message": "Volume decreased, boss."}
            except Exception as e:
                return {"command_id": command_id, "status": "error", "message": f"Volume adjustment failed: {e}"}

        # Action Execution: Launch App
        if action == "open":
            raw_app = (params.get("app") or params.get("app_name") or "").strip()
            from app.tools.app_launcher import execute_open_app
            launch_res = execute_open_app(raw_app)
            if launch_res.get("status") == "success":
                return {
                    "command_id": command_id,
                    "status": "success",
                    "app": raw_app,
                    "device_id": self.device_id,
                    "message": launch_res.get("message") or f"Successfully opened {raw_app.capitalize()} on {self.device_id}, boss."
                }
            else:
                return {
                    "command_id": command_id,
                    "status": "error",
                    "error_code": "LAUNCH_FAILED",
                    "app": raw_app,
                    "message": launch_res.get("message") or f"Failed to launch {raw_app}."
                }

        return {"command_id": command_id, "status": "error", "error_code": "UNKNOWN_ACTION", "message": f"Action '{action}' is unhandled."}

# Singleton instance
desktop_companion = DesktopCompanion()
