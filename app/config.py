from dotenv import load_dotenv
import os

load_dotenv()

class Settings:
    LLM_PROVIDER = os.getenv("LLM_PROVIDER", "gemini")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

settings = Settings()