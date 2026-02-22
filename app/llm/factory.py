from app.llm.llm_provider import GeminiProvider
from app.config import settings


def get_llm_provider():
    if settings.LLM_PROVIDER == "gemini":
        return GeminiProvider()
    else:
        raise ValueError("Unsupported LLM_PROVIDER")