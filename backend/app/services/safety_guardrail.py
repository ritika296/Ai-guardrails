"""
Layer 3 — Safety / Moderation Layer.

IMPORTANT: this project does not use a dedicated third-party moderation API.
This layer is a second, differently-scoped Grok pass (distinct system prompt
from the Layer 2 classifier) plus a small set of deterministic keyword
checks for topics that should always route to human review regardless of
model output. The component field always states plainly which part made
the decision — no claim of a moderation model that isn't actually used.
"""
import json
import re
import time
from app.schemas.guardrail import SafetyResult
from app.services.grok_service import call_grok, GrokServiceError

_SAFETY_SYSTEM_PROMPT = """You are a safety/moderation reviewer for a student-support AI assistant.
Classify the message into exactly one category:
SAFE, SUSPICIOUS, HARMFUL, SENSITIVE, HUMAN_REVIEW

SAFE: ordinary student-support request.
SUSPICIOUS: unclear intent, borderline, or testing boundaries.
HARMFUL: requests for content that could cause harm.
SENSITIVE: touches personal/institutional/emotional topics needing care.
HUMAN_REVIEW: needs a human/institution to actually resolve it (grades, faculty
  disputes, administrative decisions, mental health/wellbeing concerns).

Respond with ONLY JSON:
{"category": "<one of the above>", "reason": "<one sentence>", "risk_score": <0.0-1.0>, "confidence": <0.0-1.0>}
"""

# Deterministic escalation triggers that should never depend solely on the LLM's
# judgment — always route to human review regardless of what the model says.
_ALWAYS_ESCALATE_PATTERNS = [
    re.compile(r"\b(grade dispute|change my grade|failed unfairly|faculty complaint)\b", re.IGNORECASE),
    re.compile(r"\b(harassment|bullying|ragging|assault)\b", re.IGNORECASE),
    re.compile(r"\b(self harm|suicide|hurting myself)\b", re.IGNORECASE),
]


def _rule_escalation_check(text: str) -> str | None:
    for pattern in _ALWAYS_ESCALATE_PATTERNS:
        if pattern.search(text):
            return pattern.pattern
    return None


async def run_safety_layer(text: str) -> SafetyResult:
    start = time.perf_counter()

    forced_match = _rule_escalation_check(text)
    if forced_match:
        return SafetyResult(
            category="HUMAN_REVIEW",
            reason="Message matches a topic that always routes to human review regardless of model output.",
            risk_score=0.9,
            confidence=1.0,
            component="deterministic_topic_rule",
            latency_ms=round((time.perf_counter() - start) * 1000, 2),
        )

    try:
        raw = await call_grok(_SAFETY_SYSTEM_PROMPT, text, temperature=0.0, max_tokens=200, force_json=True)
        parsed = json.loads(raw)
        result = SafetyResult(
            category=parsed["category"],
            reason=parsed.get("reason", "No reason provided."),
            risk_score=float(parsed.get("risk_score", 0.3)),
            confidence=float(parsed.get("confidence", 0.5)),
            component="grok_safety_pass",
        )
    except (GrokServiceError, json.JSONDecodeError, KeyError, ValueError, TypeError):
        result = SafetyResult(
            category="HUMAN_REVIEW",
            reason="Safety layer call failed or returned an invalid response; routed to human review as a fail-safe.",
            risk_score=0.5,
            confidence=0.3,
            component="fallback_on_error",
            called=False,
        )

    result.latency_ms = round((time.perf_counter() - start) * 1000, 2)
    return result
