import json
import httpx
from typing import List, Dict, Any, AsyncGenerator, Optional
from app.ai.providers.base import BaseLLMProvider
from app.core.logging import logger
from app.core.exceptions import ProviderError

class GroqProvider(BaseLLMProvider):
    """
    Groq Cloud API provider adapter.
    Default model: llama-3.3-70b-versatile or llama-3.1-8b-instant.
    """
    DEFAULT_MODEL = "llama-3.3-70b-versatile"
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

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(self.BASE_URL, headers=headers, json=payload)
                if resp.status_code != 200:
                    logger.error(f"Groq API error: {resp.status_code} - {resp.text}")
                    raise ProviderError(f"Groq API returned error {resp.status_code}")
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except httpx.RequestError as e:
            logger.error(f"Groq request network error: {e}")
            raise ProviderError(f"Groq connection failure: {e}")

    async def stream(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> AsyncGenerator[str, None]:
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
            "stream": True
        }

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", self.BASE_URL, headers=headers, json=payload) as resp:
                    if resp.status_code != 200:
                        err_body = await resp.aread()
                        logger.error(f"Groq stream error: {resp.status_code} - {err_body.decode()}")
                        raise ProviderError(f"Groq stream error {resp.status_code}")

                    async for line in resp.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        try:
                            chunk = json.loads(data_str)
                            delta = chunk["choices"][0].get("delta", {})
                            content = delta.get("content")
                            if content:
                                yield content
                        except json.JSONDecodeError:
                            continue
        except httpx.RequestError as e:
            logger.error(f"Groq stream connection error: {e}")
            raise ProviderError(f"Groq stream failed: {e}")

    def supports_tools(self) -> bool:
        return True
