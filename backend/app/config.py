"""
Central configuration for the AI Guardrails backend.
Loads environment variables and defines the named thresholds used by the
router, so decision logic is never based on hidden magic numbers.
"""
import os
from dotenv import load_dotenv

load_dotenv()

# --- Grok / xAI ---
XAI_API_KEY = os.getenv("XAI_API_KEY", "")
GROK_MODEL = os.getenv("GROK_MODEL", "grok-2-latest")
XAI_BASE_URL = os.getenv("XAI_BASE_URL", "https://api.x.ai/v1")
GROK_TIMEOUT_SECONDS = float(os.getenv("GROK_TIMEOUT_SECONDS", "20"))
GROK_MAX_RETRIES = int(os.getenv("GROK_MAX_RETRIES", "2"))

# --- Request limits ---
MAX_INPUT_CHARS = int(os.getenv("MAX_INPUT_CHARS", "2000"))
MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "600"))

# --- Router thresholds (named, documented, no magic numbers) ---
RULE_BLOCK_RISK_THRESHOLD = 0.80   # rule-based risk_score at/above this -> hard BLOCK
CLASSIFIER_BLOCK_CONFIDENCE_MIN = 0.50  # below this, classifier BLOCK is downgraded to ESCALATE
SAFETY_ESCALATE_CATEGORIES = {"HUMAN_REVIEW", "SENSITIVE"}
SAFETY_BLOCK_CATEGORIES = {"HARMFUL"}

# --- CORS ---
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")

def grok_configured() -> bool:
    return bool(XAI_API_KEY)
