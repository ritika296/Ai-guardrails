"""
Pipeline orchestrator. Every endpoint that needs to run a request through
the guardrail stack (chat, guardrail-check, attack lab, evaluation, demo)
calls run_pipeline() so there is exactly one real code path — no separate
mocked logic for the Attack Lab or Evaluation pages.
"""
import time
import uuid
from datetime import datetime, timezone

from app.schemas.guardrail import GuardrailResult, PipelineTrace
from app.services.rule_guardrail import run_rule_guardrail
from app.services.grok_guardrail import run_grok_classifier
from app.services.safety_guardrail import run_safety_layer
from app.services.router import route
from app.services.assistant import get_assistant_response
from app.services.output_guardrail import run_output_guardrail, SAFE_FALLBACK_MESSAGE


def _not_called(triggered_layer: str, layer_name: str) -> GuardrailResult:
    return GuardrailResult(
        decision="ALLOW",
        category="not_called",
        reason="This layer was not invoked because an earlier layer already made the routing decision.",
        risk_score=0.0,
        confidence=1.0,
        triggered_layer=triggered_layer,
        layer_name=layer_name,
        called=False,
        latency_ms=0.0,
    )


async def run_pipeline(user_message: str, mode: str = "protected") -> PipelineTrace:
    request_id = str(uuid.uuid4())[:8]
    overall_start = time.perf_counter()

    if mode == "unprotected":
        # Demonstration-only mode: straight to the assistant, no guardrails.
        assistant_output = await get_assistant_response(user_message)
        rule_result = _not_called("rule_based", "Rule-Based Input Guardrail")
        rule_result.reason = "Unprotected demonstration mode: guardrails intentionally bypassed."
        router_result = route(rule_result, None, None)
        router_result.decision = "ALLOW"
        router_result.reason = "Unprotected mode: no guardrails were applied."
        return PipelineTrace(
            request_id=request_id,
            input=user_message,
            rule_based=rule_result,
            grok_classifier=None,
            safety=None,
            router=router_result,
            assistant_output=assistant_output,
            output_guardrail=None,
            final_response=assistant_output,
            total_latency_ms=round((time.perf_counter() - overall_start) * 1000, 2),
            timestamp=datetime.now(timezone.utc).isoformat(),
        )

    # --- Protected pipeline ---
    rule_result = run_rule_guardrail(user_message)

    hard_blocked = rule_result.decision == "BLOCK" and rule_result.risk_score >= 0.80
    classifier_result = None
    safety_result = None

    if not hard_blocked:
        classifier_result = await run_grok_classifier(user_message)
        safety_result = await run_safety_layer(user_message)

    router_result = route(rule_result, classifier_result, safety_result)

    assistant_output = None
    output_guardrail_result = None
    final_response: str

    if router_result.decision == "ALLOW":
        assistant_output = await get_assistant_response(user_message)
        output_guardrail_result = await run_output_guardrail(assistant_output)
        if output_guardrail_result.decision == "BLOCK":
            final_response = SAFE_FALLBACK_MESSAGE
        else:
            final_response = assistant_output
    elif router_result.decision == "BLOCK":
        final_response = (
            "This request was blocked by the guardrail system. "
            f"Reason: {router_result.reason}"
        )
    else:  # ESCALATE
        final_response = (
            "This request has been routed for human review — a member of your "
            "program team is better placed to help with this. "
            f"Reason: {router_result.reason}"
        )

    if classifier_result is None:
        classifier_result = _not_called("grok_classifier", "Grok Guardrail Classifier")
    if safety_result is None:
        from app.schemas.guardrail import SafetyResult
        safety_result = SafetyResult(
            category="SAFE", reason="Not called — blocked earlier by the rule-based layer.",
            risk_score=0.0, confidence=1.0, component="not_called", called=False,
        )
    if output_guardrail_result is None:
        output_guardrail_result = _not_called("output_guardrail", "Output Guardrail")

    return PipelineTrace(
        request_id=request_id,
        input=user_message,
        rule_based=rule_result,
        grok_classifier=classifier_result,
        safety=safety_result,
        router=router_result,
        assistant_output=assistant_output,
        output_guardrail=output_guardrail_result,
        final_response=final_response,
        total_latency_ms=round((time.perf_counter() - overall_start) * 1000, 2),
        timestamp=datetime.now(timezone.utc).isoformat(),
    )


# --- In-memory session history store (Phase-1 scope; see README for persistence note) ---
_SESSION_HISTORY: dict[str, list[PipelineTrace]] = {}


def record_history(session_id: str, trace: PipelineTrace) -> None:
    _SESSION_HISTORY.setdefault(session_id, []).append(trace)


def get_history(session_id: str) -> list[PipelineTrace]:
    return _SESSION_HISTORY.get(session_id, [])


def clear_history(session_id: str) -> None:
    _SESSION_HISTORY[session_id] = []


_ALL_TRACES: list[PipelineTrace] = []


def record_global(trace: PipelineTrace) -> None:
    _ALL_TRACES.append(trace)


def get_all_traces() -> list[PipelineTrace]:
    return _ALL_TRACES
