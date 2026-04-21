import asyncio

from google import genai
from google.genai import types

from app.llm.base import LLMProvider
from app.config import settings


class GeminiProvider(LLMProvider):
    """
    Uses Gemini's structured-output mode (response_mime_type=application/json)
    so the model is constrained to return a JSON string. Much more reliable
    than instructing JSON via the prompt alone.
    """

    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not set")

        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
        self.model_name = settings.GEMINI_MODEL

    async def generate(self, prompt: str) -> str:
        def sync_generate() -> str:
            response = self.client.models.generate_content(
                model=self.model_name,
                contents=prompt,
                config=types.GenerateContentConfig(
                    response_mime_type="application/json",
                    temperature=0.2,
                ),
            )
            return response.candidates[0].content.parts[0].text

        return await asyncio.to_thread(sync_generate)
