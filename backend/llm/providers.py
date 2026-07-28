"""
LLM provider abstraction and implementations.
Supports OpenAI, Google Gemini, and Ollama (local models).
"""

import json
from abc import ABC, abstractmethod
from typing import Optional, AsyncGenerator

from core.config import settings
from core.logging_config import get_logger

logger = get_logger(__name__)


class BaseLLMProvider(ABC):
    """Abstract base class for LLM providers."""

    def __init__(self, model: str, temperature: float = 0.3):
        self.model = model
        self.temperature = temperature

    @abstractmethod
    async def generate(self, messages: list[dict], json_mode: bool = True) -> str:
        """Generate a response from the LLM."""
        pass

    @abstractmethod
    async def generate_stream(
        self, messages: list[dict]
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response from the LLM."""
        pass

    def parse_json_response(self, response: str) -> dict:
        """Parse a JSON response, handling common LLM formatting issues."""
        # Strip markdown code fences if present
        cleaned = response.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        try:
            return json.loads(cleaned)
        except json.JSONDecodeError as e:
            logger.error("Failed to parse JSON response: {}", str(e))
            logger.debug("Raw response: {}", response[:500])
            raise ValueError(f"LLM returned invalid JSON: {str(e)}")


class OpenAIProvider(BaseLLMProvider):
    """OpenAI GPT provider."""

    def __init__(self, model: str = "gpt-4.1", temperature: float = 0.3):
        super().__init__(model, temperature)
        from openai import AsyncOpenAI

        self.client = AsyncOpenAI(api_key=settings.OPENAI_API_KEY)
        logger.info("Initialized OpenAI provider with model: {}", model)

    async def generate(self, messages: list[dict], json_mode: bool = True) -> str:
        """Generate a response using OpenAI."""
        kwargs = {
            "model": self.model,
            "messages": messages,
            "temperature": self.temperature,
            "max_tokens": 8000,
        }
        if json_mode:
            kwargs["response_format"] = {"type": "json_object"}

        response = await self.client.chat.completions.create(**kwargs)
        return response.choices[0].message.content

    async def generate_stream(
        self, messages: list[dict]
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response using OpenAI."""
        stream = await self.client.chat.completions.create(
            model=self.model,
            messages=messages,
            temperature=self.temperature,
            max_tokens=4000,
            stream=True,
        )
        async for chunk in stream:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content


class GeminiProvider(BaseLLMProvider):
    """Google Gemini provider."""

    def __init__(self, model: str = "gemini-2.5-flash", temperature: float = 0.3):
        super().__init__(model, temperature)
        import google.generativeai as genai

        genai.configure(api_key=settings.GOOGLE_API_KEY)
        self.genai = genai
        self.gen_model = genai.GenerativeModel(model)
        logger.info("Initialized Gemini provider with model: {}", model)

    async def generate(self, messages: list[dict], json_mode: bool = True) -> str:
        """Generate a response using Gemini."""
        # Convert messages to Gemini format
        prompt_parts = []
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                prompt_parts.append(f"System Instructions: {content}\n")
            elif role == "user":
                prompt_parts.append(content)
            elif role == "assistant":
                prompt_parts.append(f"Previous Response: {content}\n")

        combined_prompt = "\n".join(prompt_parts)

        generation_config = self.genai.GenerationConfig(
            temperature=self.temperature,
            max_output_tokens=8000,
        )
        if json_mode:
            generation_config.response_mime_type = "application/json"

        response = await self.gen_model.generate_content_async(
            combined_prompt,
            generation_config=generation_config,
        )
        return response.text

    async def generate_stream(
        self, messages: list[dict]
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response using Gemini."""
        prompt_parts = []
        for msg in messages:
            role = msg["role"]
            content = msg["content"]
            if role == "system":
                prompt_parts.append(f"System Instructions: {content}\n")
            elif role == "user":
                prompt_parts.append(content)

        combined_prompt = "\n".join(prompt_parts)

        response = await self.gen_model.generate_content_async(
            combined_prompt,
            generation_config=self.genai.GenerationConfig(
                temperature=self.temperature,
                max_output_tokens=4000,
            ),
            stream=True,
        )
        async for chunk in response:
            if chunk.text:
                yield chunk.text


class OllamaProvider(BaseLLMProvider):
    """Ollama local model provider."""

    def __init__(self, model: str = "llama3", temperature: float = 0.3):
        super().__init__(model, temperature)
        import httpx

        self.base_url = settings.OLLAMA_BASE_URL
        self.client = httpx.AsyncClient(timeout=120.0)
        logger.info("Initialized Ollama provider with model: {} at {}", model, self.base_url)

    async def generate(self, messages: list[dict], json_mode: bool = True) -> str:
        """Generate a response using Ollama."""
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": self.temperature},
        }
        if json_mode:
            payload["format"] = "json"

        response = await self.client.post(
            f"{self.base_url}/api/chat",
            json=payload,
        )
        response.raise_for_status()
        result = response.json()
        return result["message"]["content"]

    async def generate_stream(
        self, messages: list[dict]
    ) -> AsyncGenerator[str, None]:
        """Generate a streaming response using Ollama."""
        import httpx

        payload = {
            "model": self.model,
            "messages": messages,
            "stream": True,
            "options": {"temperature": self.temperature},
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/api/chat",
                json=payload,
            ) as response:
                async for line in response.aiter_lines():
                    if line:
                        data = json.loads(line)
                        if "message" in data and "content" in data["message"]:
                            yield data["message"]["content"]
