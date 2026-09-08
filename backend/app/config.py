"""
Central configuration for the AI Guardrails backend.
Loads environment variables and defines the named thresholds used by the
router, so decision logic is never based on hidden magic numbers.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# --- LLM provider: Groq (api.groq.com), OpenAI-compatible chat completions API ---
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
GROK_MODEL = os.getenv("GROK_MODEL", "openai/gpt-oss-120b")
GROQ_BASE_URL = os.getenv("GROQ_BASE_URL", "https://api.groq.com/openai/v1")
GROK_TIMEOUT_SECONDS = float(os.getenv("GROK_TIMEOUT_SECONDS", "20"))
GROK_MAX_RETRIES = int(os.getenv("GROK_MAX_RETRIES", "2"))

# --- Request limits ---
MAX_INPUT_CHARS = int(os.getenv("MAX_INPUT_CHARS", "2000"))
MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "600"))

# --- Router thresholds (named, documented, no magic numbers) ---
RULE_BLOCK_RISK_THRESHOLD = 0.80
CLASSIFIER_BLOCK_CONFIDENCE_MIN = 0.50
SAFETY_ESCALATE_CATEGORIES = {"HUMAN_REVIEW", "SENSITIVE"}
SAFETY_BLOCK_CATEGORIES = {"HARMFUL"}

# --- CORS ---
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

def grok_configured() -> bool:
    return bool(GROQ_API_KEY)