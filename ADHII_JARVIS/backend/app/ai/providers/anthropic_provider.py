import json
import httpx
from typing import List, Dict, Any, AsyncGenerator, Optional
from app.ai.providers.base import BaseLLMProvider
from app.core.logging import logger
from app.core.exceptions import ProviderError

class AnthropicProvider(BaseLLMProvider):
    """
    Anthropic Claude API provider adapter.
    Default model: claude-3-5-sonnet-20241022 or configurable via environment.
    """
    DEFAULT_MODEL = "claude-3-5-sonnet-20241022"
    BASE_URL = "https://api.anthropic.com/v1/messages"

    def __init__(self, api_key: Optional[str] = None, model: Optional[str] = None):
        super().__init__(api_key=api_key, model=model or self.DEFAULT_MODEL)

    def _convert_messages(self, messages: List[Dict[str, str]]):
        system_prompt = ""
        user_messages = []
        for msg in messages:
            role = msg.get("role")
            content = msg.get("content", "")
            if role == "system":
                system_prompt += content + "\n"
            else:
                user_messages.append({"role": role, "content": content})
        return system_prompt.strip(), user_messages

    async def generate(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> str:
        if not self.api_key:
            raise ProviderError("Anthropic API key is not configured")

        system_prompt, formatted_messages = self._convert_messages(messages)
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "max_tokens": 4096,
            "temperature": temperature,
            "stream": False
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                resp = await client.post(self.BASE_URL, headers=headers, json=payload)
                if resp.status_code != 200:
                    logger.error(f"Anthropic API error: {resp.status_code} - {resp.text}")
                    raise ProviderError(f"Anthropic API returned error {resp.status_code}")
                data = resp.json()
                return data["content"][0]["text"]
        except httpx.RequestError as e:
            logger.error(f"Anthropic connection error: {e}")
            raise ProviderError(f"Anthropic connection failure: {e}")

    async def stream(self, messages: List[Dict[str, str]], temperature: float = 0.7, **kwargs) -> AsyncGenerator[str, None]:
        if not self.api_key:
            raise ProviderError("Anthropic API key is not configured")

        system_prompt, formatted_messages = self._convert_messages(messages)
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "Content-Type": "application/json"
        }
        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "max_tokens": 4096,
            "temperature": temperature,
            "stream": True
        }
        if system_prompt:
            payload["system"] = system_prompt

        try:
            async with httpx.AsyncClient(timeout=60.0) as client:
                async with client.stream("POST", self.BASE_URL, headers=headers, json=payload) as resp:
                    if resp.status_code != 200:
                        err_body = await resp.aread()
                        logger.error(f"Anthropic stream error: {resp.status_code} - {err_body.decode()}")
                        raise ProviderError(f"Anthropic stream error {resp.status_code}")

                    async for line in resp.aiter_lines():
                        if not line or not line.startswith("data: "):
                            continue
                        data_str = line[6:].strip()
                        try:
                            chunk = json.loads(data_str)
                            c_type = chunk.get("type")
                            if c_type == "content_block_delta":
                                delta_text = chunk.get("delta", {}).get("text", "")
                                if delta_text:
                                    yield delta_text
                            elif c_type == "message_stop":
                                break
                        except json.JSONDecodeError:
                            continue
        except httpx.RequestError as e:
            logger.error(f"Anthropic stream connection error: {e}")
            raise ProviderError(f"Anthropic stream failed: {e}")

    def supports_tools(self) -> bool:
        return True
