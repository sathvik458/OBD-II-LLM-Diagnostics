from google import genai
import asyncio
from app.llm.base import LLMProvider
from app.config import settings


class GeminiProvider(LLMProvider):

    def __init__(self):
        if not settings.GEMINI_API_KEY:
            raise ValueError("GEMINI_API_KEY not set")

        self.client = genai.Client(api_key=settings.GEMINI_API_KEY)

    async def generate(self, prompt: str) -> str:
        def sync_generate():
            response = self.client.models.generate_content(
                model="gemini-2.5-flash",
                contents=prompt,
            )
            return response.candidates[0].content.parts[0].text

        return await asyncio.to_thread(sync_generate)