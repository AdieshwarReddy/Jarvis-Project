import json
import asyncio
import httpx
from typing import List, Dict, Any, AsyncGenerator, Optional
from app.ai.providers.base import BaseLLMProvider
from app.core.logging import logger
from app.core.exceptions import ProviderError

class GroqProvider(BaseLLMProvider):
    """
    Groq Cloud API provider adapter with automatic rate limit backoff.
    Default models: qwen/qwen3.8-27b, openai/gpt-oss-120b, llama-3.3-70b-versatile.
    """
    DEFAULT_MODEL = "openai/gpt-oss-120b"
    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        super().__init__(api_key=api_key, model=model or self.DEFAULT_MODEL)

    async def generate(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> str:
        if not self.api_key:
            raise ProviderError("Groq API key is not configured")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": False
        }

        for attempt in range(2):
            try:
                async with httpx.AsyncClient(timeout=30.0) as client:
                    resp = await client.post(self.BASE_URL, headers=headers, json=payload)
                    if resp.status_code == 429:
                        if attempt == 0:
                            logger.warning("Groq rate limit 429, retrying in 2 seconds...")
                            await asyncio.sleep(2.0)
                            continue
                        return "I am currently processing a high volume of requests. Please try your question again in a moment."
                    if resp.status_code != 200:
                        logger.error(f"Groq API error: {resp.status_code} - {resp.text}")
                        return "I encountered an issue processing your request with the AI model. Please try again."
                    data = resp.json()
                    return data["choices"][0]["message"]["content"]
            except httpx.RequestError as e:
                logger.error(f"Groq request network error: {e}")
                if attempt == 1:
                    return "Network connection to AI provider failed. Please check your internet connection."
                await asyncio.sleep(1.0)
        return "Service temporarily busy. Please try again."

    async def stream(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> AsyncGenerator[str, None]:
        if not self.api_key:
            yield "Groq API key is not configured. Please check your backend/.env file."
            return

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "stream": True
        }

        for attempt in range(2):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    async with client.stream("POST", self.BASE_URL, headers=headers, json=payload) as resp:
                        if resp.status_code == 429:
                            if attempt == 0:
                                logger.warning("Groq stream rate limit 429, retrying in 2 seconds...")
                                await asyncio.sleep(2.0)
                                continue
                            err_body = await resp.aread()
                            logger.error(f"Groq stream rate limit: {resp.status_code} - {err_body.decode()}")
                            yield "I am currently receiving a high volume of requests. Please try asking again in a few moments."
                            return
                        elif resp.status_code != 200:
                            err_body = await resp.aread()
                            logger.error(f"Groq stream error: {resp.status_code} - {err_body.decode()}")
                            yield "I encountered an error connecting to the AI model. Please try again."
                            return

                        async for line in resp.aiter_lines():
                            if not line or not line.startswith("data: "):
                                continue
                            data_str = line[6:].strip()
                            if data_str == "[DONE]":
                                break
                            try:
                                chunk = json.loads(data_str)
                                choices = chunk.get("choices")
                                if choices and len(choices) > 0:
                                    delta = choices[0].get("delta", {})
                                    content = delta.get("content")
                                    if content:
                                        yield content
                            except (json.JSONDecodeError, KeyError, IndexError, TypeError):
                                continue
                        return
            except httpx.RequestError as e:
                logger.error(f"Groq stream connection error: {e}")
                if attempt == 1:
                    yield "Network connection error while streaming response. Please try again."
                    return
                await asyncio.sleep(1.0)

    def supports_tools(self) -> bool:
        return True
