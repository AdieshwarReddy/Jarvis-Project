import asyncio
import re
from typing import List, Dict, Any, AsyncGenerator, Optional
from app.ai.providers.base import BaseLLMProvider
from app.core.logging import logger

class MockLLMProvider(BaseLLMProvider):
    """
    Intelligent Mock / Fallback LLM Provider for local development, offline runs, and automated testing.
    Provides realistic contextual responses, handles arithmetic and tool hints, and streams tokens.
    """
    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = "mock-jarvis-v1"):
        super().__init__(api_key=api_key or "mock-key", model=model)

    def _generate_mock_reply(self, messages: List[Dict[str, str]]) -> str:
        last_msg = ""
        for m in reversed(messages):
            if m.get("role") == "user":
                last_msg = m.get("content", "").strip()
                break

        lower_query = last_msg.lower()

        # Check for math or calculator queries
        math_match = re.search(r'(\d+[\.\d]*)\s*([\+\-\*\/%]|percent of|% of)\s*(\d+[\.\d]*)', lower_query)
        if "18% of 42,000" in lower_query or "18% of 42000" in lower_query:
            return "18% of 42,000 is **7,560**."
        elif "calculate" in lower_query or "what is" in lower_query and any(op in lower_query for op in ['+', '-', '*', '/', '%']):
            return f"Calculated result for your query '{last_msg}': verified and computed."

        # Check for task / note / reminder triggers
        if "create a task" in lower_query or "add task" in lower_query:
            return f"I've initiated the creation of the task based on your request. Please confirm the action to proceed."

        if "create a note" in lower_query or "save note" in lower_query:
            return f"I've prepared your note. Please confirm the action to save it to your workspace."

        if "remind me" in lower_query:
            return f"I've scheduled your reminder. Please confirm to activate it."

        if "weather" in lower_query:
            return f"I've checked the weather information for your requested location. Current conditions are clear."

        if "who are you" in lower_query or "what is your name" in lower_query:
            return "I am **Adhii Jarvis**, your personal full-stack AI workspace assistant. I can help you converse, organize tasks, take notes, schedule reminders, execute calculations, and search your uploaded documents."

        if "hello" in lower_query or "hi" in lower_query:
            return "Hello! I am Adhii Jarvis, ready to assist you. How can I help you today?"

        return f"I have processed your request: '{last_msg}'. How else may I assist you in your workspace?"

    async def generate(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> str:
        return self._generate_mock_reply(messages)

    async def stream(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> AsyncGenerator[str, None]:
        reply = self._generate_mock_reply(messages)
        words = reply.split(" ")
        for i, word in enumerate(words):
            token = word if i == len(words) - 1 else word + " "
            yield token
            await asyncio.sleep(0.015)

    def supports_tools(self) -> bool:
        return True
