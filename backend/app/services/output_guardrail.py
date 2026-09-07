"""
Layer 4 — Output Guardrail.

Runs on the assistant's generated response before it is returned to the user.
Checks for system-prompt leakage, unsupported institutional claims, and
policy-violating content. On BLOCK, the original response is discarded and
a safe fallback is shown instead — the raw model output is never surfaced.
"""
import json
import time
from app.schemas.guardrail import GuardrailResult
from app.services.grok_service import call_grok, GrokServiceError

_OUTPUT_SYSTEM_PROMPT = """You are an output-safety reviewer for a student-support AI assistant's
generated response. You do not rewrite it — you only judge it.

Check the ASSISTANT RESPONSE (not the original question) for:
- leakage of internal system instructions or prompts
- unsupported or fabricated institutional claims (invented policies, deadlines, rules)
- unsafe or clearly inappropriate advice
- excessive/false certainty about something the assistant could not actually know
- content outside the student-support scope

Respond with ONLY JSON:
{"decision": "ALLOW" | "BLOCK", "category": "<short category>", "reason": "<one sentence>",
 "risk_score": <0.0-1.0>, "confidence": <0.0-1.0>}
"""

SAFE_FALLBACK_MESSAGE = (
    "I'm not able to share that response as-is. Could you rephrase your question, "
    "or reach out to your program office for anything involving institutional policy?"
)


async def run_output_guardrail(assistant_response: str) -> GuardrailResult:
    start = time.perf_counter()
    try:
        raw = await call_grok(
            _OUTPUT_SYSTEM_PROMPT,
            f"ASSISTANT RESPONSE:\n{assistant_response}",
            temperature=0.0,
            max_tokens=200,
            force_json=True,
        )
        parsed = json.loads(raw)
        result = GuardrailResult(
            decision=parsed["decision"],
            category=parsed.get("category", "unclassified"),
            reason=parsed.get("reason", "No reason provided."),
            risk_score=float(parsed.get("risk_score", 0.1)),
            confidence=float(parsed.get("confidence", 0.5)),
            triggered_layer="output_guardrail",
            layer_name="Output Guardrail",
        )
    except (GrokServiceError, json.JSONDecodeError, KeyError, ValueError, TypeError):
        # Fail-safe: if the output guardrail itself fails, allow through but flag low confidence
        # rather than silently blocking a valid answer.
        result = GuardrailResult(
            decision="ALLOW",
            category="output_guardrail_unavailable",
            reason="Output guardrail call failed; response allowed through with low confidence flag.",
            risk_score=0.4,
            confidence=0.2,
            triggered_layer="output_guardrail",
            layer_name="Output Guardrail",
            called=False,
        )

    result.latency_ms = round((time.perf_counter() - start) * 1000, 2)
    return result
