from typing import List, Dict, Any
from app.core.logging import logger

class ConversationSummarizer:
    """Summarizes extended conversation histories to maintain optimal LLM token bounds."""
    SUMMARY_THRESHOLD = 10

    def should_summarize(self, message_count: int) -> bool:
        return message_count > self.SUMMARY_THRESHOLD

    def create_summary(self, messages: List[Dict[str, Any]], existing_summary: str = None) -> str:
        """Create a compact summary of past conversation turns."""
        turns = []
        # Take messages before the last 6
        cutoff = max(0, len(messages) - 6)
        older_messages = messages[:cutoff]
        if not older_messages:
            return existing_summary or ""

        for m in older_messages:
            role = m.get("role", "unknown")
            text = m.get("content", "")[:100]
            turns.append(f"{role}: {text}")

        conversation_snippet = " | ".join(turns)
        summary = f"User engaged on: {conversation_snippet[:300]}..."
        if existing_summary:
            summary = f"{existing_summary} Then: {summary}"
        return summary[:500]

summarizer = ConversationSummarizer()
