import re
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
from app.tools.registry import tool_registry
from app.core.logging import logger

class ToolRouter:
    """
    Identifies tool invocation intents from user messages,
    extracts parameters, and checks confirmation requirements.
    """

    def identify_tool(self, user_message: str, user_profile: Optional[Dict[str, Any]] = None) -> Optional[Dict[str, Any]]:
        text = user_message.strip()
        lower = text.lower()

        # -------------------------------------------------------------
        # 1. CALCULATOR TOOL (Read-only)
        # -------------------------------------------------------------
        # e.g., "What is 18% of 42,000?" or "Calculate 15 * 80"
        calc_pct = re.search(r'([0-9\.]+)\s*(?:%|percent)\s*of\s*([0-9,]+(?:\.[0-9]+)?)', text, re.I)
        if calc_pct:
            pct_val = calc_pct.group(1)
            base_val = calc_pct.group(2).replace(",", "")
            return {
                "tool_name": "calculator",
                "parameters": {"expression": f"{pct_val}% of {base_val}"},
                "summary": f"Calculate {pct_val}% of {base_val}",
                "requires_confirmation": False
            }

        calc_keyword = re.search(r'(?:calculate|what is|compute)\s+([0-9\.\s\+\-\*\/\(\)\^%]+)$', text, re.I)
        if calc_keyword:
            expr = calc_keyword.group(1).strip()
            if any(op in expr for op in ['+', '-', '*', '/', '%']):
                return {
                    "tool_name": "calculator",
                    "parameters": {"expression": expr},
                    "summary": f"Calculate '{expr}'",
                    "requires_confirmation": False
                }

        # -------------------------------------------------------------
        # 2. DATE & TIME TOOL (Read-only)
        # -------------------------------------------------------------
        if any(phrase in lower for phrase in ["current time", "what time is it", "what's the time", "current date", "today's date", "what is today's date"]):
            tz = (user_profile or {}).get("timezone", "UTC")
            # Check if user mentioned another city/timezone
            if "in tokyo" in lower:
                tz = "Asia/Tokyo"
            elif "in new york" in lower or "in nyc" in lower:
                tz = "America/New_York"
            elif "in london" in lower:
                tz = "Europe/London"
            elif "in india" in lower or "in ist" in lower:
                tz = "Asia/Kolkata"

            return {
                "tool_name": "current_datetime",
                "parameters": {"timezone": tz},
                "summary": f"Check current time in {tz}",
                "requires_confirmation": False
            }

        # -------------------------------------------------------------
        # 3. WEATHER TOOL (Read-only)
        # -------------------------------------------------------------
        weather_match = re.search(r'weather\s+(?:in|for|at)\s+([a-zA-Z\s]+)', text, re.I)
        if weather_match:
            loc = weather_match.group(1).strip()
            return {
                "tool_name": "weather",
                "parameters": {"location": loc},
                "summary": f"Check weather for {loc}",
                "requires_confirmation": False
            }

        # -------------------------------------------------------------
        # 4. WEB SEARCH TOOL (Read-only)
        # -------------------------------------------------------------
        search_match = re.search(r'(?:search for|search the web for|look up|google)\s+(.+)', text, re.I)
        if search_match:
            query = search_match.group(1).strip()
            return {
                "tool_name": "search",
                "parameters": {"query": query},
                "summary": f"Search the web for '{query}'",
                "requires_confirmation": False
            }

        # -------------------------------------------------------------
        # 5. CREATE NOTE TOOL (Requires confirmation)
        # -------------------------------------------------------------
        note_match = re.search(r'(?:create|make|add|save)\s+(?:a\s+)?note\s+(?:called|titled|named)\s+["\']?([^"\']+)["\']?\s*(?:with content|saying|:)?\s*(.*)', text, re.I)
        if note_match:
            title = note_match.group(1).strip()
            content = note_match.group(2).strip() or "Note created from assistant prompt."
            return {
                "tool_name": "create_note",
                "parameters": {"title": title, "content": content},
                "summary": f"Create note titled '{title}'",
                "requires_confirmation": True
            }

        # -------------------------------------------------------------
        # 6. CREATE TASK TOOL (Requires confirmation)
        # -------------------------------------------------------------
        task_match = re.search(r'(?:create|add|schedule)\s+(?:a\s+)?task\s+(?:to\s+|called\s+|:\s*)?(.+)', text, re.I)
        if task_match:
            raw_task = task_match.group(1).strip()
            # Extract priority if specified
            priority = "medium"
            if "urgent" in lower or "asap" in lower:
                priority = "urgent"
            elif "high priority" in lower:
                priority = "high"
            elif "low priority" in lower:
                priority = "low"

            return {
                "tool_name": "create_task",
                "parameters": {
                    "title": raw_task,
                    "description": f"Created via AI conversation: {text}",
                    "priority": priority,
                    "due_at": (datetime.now(timezone.utc) + timedelta(days=1)).isoformat()
                },
                "summary": f"Create task '{raw_task}' (Priority: {priority.capitalize()})",
                "requires_confirmation": True
            }

        # -------------------------------------------------------------
        # 7. CREATE REMINDER TOOL (Requires confirmation)
        # -------------------------------------------------------------
        rem_match = re.search(r'remind me\s+(?:to\s+)?(.+?)\s+(?:tomorrow|at\s+\d+|in\s+\d+)', text, re.I)
        if rem_match or "remind me" in lower:
            rem_title = rem_match.group(1).strip() if rem_match else text.replace("remind me to", "").replace("remind me", "").strip()
            target_time = (datetime.now(timezone.utc) + timedelta(hours=2)).isoformat()
            return {
                "tool_name": "create_reminder",
                "parameters": {
                    "title": rem_title or "Scheduled reminder",
                    "reminder_at": target_time
                },
                "summary": f"Set reminder: '{rem_title}'",
                "requires_confirmation": True
            }

        # -------------------------------------------------------------
        # 8. DOCUMENT SEARCH TOOL (Read-only)
        # -------------------------------------------------------------
        if any(phrase in lower for phrase in ["my document", "my file", "the document", "in the pdf", "in my notes"]):
            return {
                "tool_name": "document_search",
                "parameters": {"query": text},
                "summary": f"Search uploaded documents for '{text[:40]}'",
                "requires_confirmation": False
            }

        # -------------------------------------------------------------
        # 9. OPEN APPLICATION TOOL (Immediate execution)
        # -------------------------------------------------------------
        # Cleaned prompt for command identification
        cleaned = re.sub(r'^[^\w]+|[^\w]+$', '', lower).strip()
        for pfx in ["hey jarvis", "ok jarvis", "jarvis", "please", "could you", "can you", "i want you to"]:
            if cleaned.startswith(pfx):
                cleaned = cleaned[len(pfx):].strip(" ,:.-")

        app_match = re.search(
            r'^(?:please\s+)?(?:open(?:\s+up)?|launch|start|run|go\s+to|bring\s+up)\s+(?:the\s+)?([a-zA-Z0-9_\-\.\s]+?)(?:\s+for\s+me|\s+app|\s+application|\s+website|\s+page|\s+please)*$',
            cleaned,
            re.I
        )
        if app_match:
            raw_target = app_match.group(1).strip(" .?!,;:'\"")
            if not any(kw in raw_target.lower() for kw in ["note", "task", "reminder", "document", "chat", "conversation"]):
                return {
                    "tool_name": "open_app",
                    "parameters": {"app_name": raw_target},
                    "summary": f"Launch {raw_target}",
                    "requires_confirmation": False
                }

        # Direct app name request (e.g. user just said "youtube", "whatsapp", "vs code", "lock pc")
        from app.tools.app_launcher import KNOWN_APPS
        direct_target = cleaned.strip(" .?!,;:'\"")
        if direct_target in KNOWN_APPS or any(act in direct_target for act in ["lock pc", "lock computer", "mute audio"]):
            return {
                "tool_name": "open_app",
                "parameters": {"app_name": direct_target},
                "summary": f"Launch {direct_target}",
                "requires_confirmation": False
            }

        # -------------------------------------------------------------
        # 10. SPOTIFY PLAYBACK TOOL (Immediate execution)
        # -------------------------------------------------------------
        # e.g., "play Starboy on Spotify", "play Blinding Lights", "listen to Bohemian Rhapsody"
        if "play " in cleaned or "spotify" in cleaned or "listen to " in cleaned:
            spotify_match = re.search(
                r'^(?:please\s+)?(?:play|listen\s+to)\s+(.+?)(?:\s+on\s+spotify|\s+in\s+spotify)?$',
                cleaned,
                re.I
            )
            if spotify_match:
                song = spotify_match.group(1).replace("on spotify", "").replace("in spotify", "").strip(" .?!,;:'\"")
                if song and not any(kw in song.lower() for kw in ["game", "video", "youtube", "task", "note"]):
                    return {
                        "tool_name": "spotify_play",
                        "parameters": {"query": song},
                        "summary": f"Play '{song}' on Spotify",
                        "requires_confirmation": False
                    }

        return None

tool_router = ToolRouter()
