import json
import httpx
from typing import List, Dict, Any, AsyncGenerator, Optional
from app.ai.providers.base import BaseLLMProvider
from app.core.logging import logger
from app.core.exceptions import ProviderError

class OpenAIProvider(BaseLLMProvider):
    """
    OpenAI-compatible LLM provider adapter.
    Default model: gpt-4o-mini or configurable via environment.
    """
    DEFAULT_MODEL = "gpt-4o-mini"
    BASE_URL = "https://api.openai.com/v1/chat/completions"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None, base_url: Optional[str] = None):
        super().__init__(api_key=api_key, model=model or self.DEFAULT_MODEL)
        self.base_url = base_url or self.BASE_URL

    async def generate(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> str:
        if not self.api_key:
            raise ProviderError("OpenAI API key is not configured")

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
                resp = await client.post(self.base_url, headers=headers, json=payload)
                if resp.status_code != 200:
                    logger.error(f"OpenAI API error: {resp.status_code} - {resp.text}")
                    raise ProviderError(f"OpenAI API returned error {resp.status_code}")
                data = resp.json()
                return data["choices"][0]["message"]["content"]
        except httpx.RequestError as e:
            logger.error(f"OpenAI network error: {e}")
            raise ProviderError(f"OpenAI connection error: {e}")

    async def stream(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise ProviderError("OpenAI API key is not configured")

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
                async with client.stream("POST", self.base_url, headers=headers, json=payload) as resp:
                    if resp.status_code != 200:
                        err_body = await resp.aread()
                        logger.error(f"OpenAI stream error: {resp.status_code} - {err_body.decode()}")
                        raise ProviderError(f"OpenAI stream error {resp.status_code}")

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
            logger.error(f"OpenAI stream error: {e}")
            raise ProviderError(f"OpenAI stream connection error: {e}")

    def supports_tools(self) -> bool:
        return True
