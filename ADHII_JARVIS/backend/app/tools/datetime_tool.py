from datetime import datetime, timezone, timedelta
from typing import Dict, Any, Optional
from zoneinfo import ZoneInfo
from app.core.exceptions import ToolExecutionError

def get_current_datetime(tz_name: Optional[str] = "UTC") -> Dict[str, Any]:
    """Retrieve current date and time for requested or user timezone."""
    tz_str = tz_name or "UTC"
    try:
        tz = ZoneInfo(tz_str)
    except Exception:
        tz = timezone.utc
        tz_str = "UTC"

    now = datetime.now(tz)
    return {
        "timezone": tz_str,
        "current_time": now.strftime("%I:%M:%S %p"),
        "current_date": now.strftime("%A, %B %d, %Y"),
        "iso": now.isoformat(),
        "unix_timestamp": int(now.timestamp())
    }

def calculate_relative_date(days_offset: int, tz_name: Optional[str] = "UTC") -> Dict[str, Any]:
    """Calculate date offset by N days."""
    tz_str = tz_name or "UTC"
    try:
        tz = ZoneInfo(tz_str)
    except Exception:
        tz = timezone.utc
        tz_str = "UTC"

    target_dt = datetime.now(tz) + timedelta(days=days_offset)
    return {
        "timezone": tz_str,
        "offset_days": days_offset,
        "date": target_dt.strftime("%A, %B %d, %Y"),
        "iso": target_dt.isoformat()
    }
