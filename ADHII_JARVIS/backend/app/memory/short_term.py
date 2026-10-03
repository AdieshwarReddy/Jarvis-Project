from typing import List, Dict, Any

class ShortTermMemory:
    """
    Manages short-term conversation context using a sliding window
    combined with persistent conversation summaries.
    """
    def __init__(self, window_size: int = 8):
        self.window_size = window_size

    def format_history(self, messages: List[Dict[str, Any]], summary: str = None) -> List[Dict[str, str]]:
        formatted: List[Dict[str, str]] = []

        # If summary exists from older conversation turns, prepend as context
        if summary:
            formatted.append({
                "role": "system",
                "content": f"[Previous Conversation Context Summary]: {summary}"
            })

        # Take last N messages
        recent = messages[-self.window_size:] if len(messages) > self.window_size else messages
        for msg in recent:
            role = msg.get("role", "user")
            content = msg.get("content", "")
            if role in ("user", "assistant", "system"):
                formatted.append({"role": role, "content": content})

        return formatted

short_term_memory = ShortTermMemory()
