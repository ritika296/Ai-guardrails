"""
Central Router — fuses Layer 1 (rule-based), Layer 2 (Grok classifier), and
Layer 3 (safety) into a single ALLOW / BLOCK / ESCALATE decision.

Deterministic and transparent: no LLM call happens here, and the exact
if/elif chain below is the entire decision logic (mirrors the README/About page).
"""
from app.schemas.guardrail import GuardrailResult, SafetyResult, RouterResult
from app import config


def route(
    rule_result: GuardrailResult,
    classifier_result: GuardrailResult | None,
    safety_result: SafetyResult | None,
) -> RouterResult:

    # 1. Hard block from the deterministic rule layer, if risk is high enough.
    if rule_result.decision == "BLOCK" and rule_result.risk_score >= config.RULE_BLOCK_RISK_THRESHOLD:
        return RouterResult(
            decision="BLOCK",
            category=rule_result.category,
            reason=rule_result.reason,
            risk_score=rule_result.risk_score,
            confidence=rule_result.confidence,
            triggered_layer="rule_based",
        )

    # 2. Grok classifier says BLOCK (downgrade to ESCALATE if its own confidence is low).
    if classifier_result and classifier_result.decision == "BLOCK":
        if classifier_result.confidence < config.CLASSIFIER_BLOCK_CONFIDENCE_MIN:
            return RouterResult(
                decision="ESCALATE",
                category=classifier_result.category,
                reason=f"{classifier_result.reason} (low-confidence BLOCK downgraded to ESCALATE for human review)",
                risk_score=classifier_result.risk_score,
                confidence=classifier_result.confidence,
                triggered_layer="grok_classifier",
            )
        return RouterResult(
            decision="BLOCK",
            category=classifier_result.category,
            reason=classifier_result.reason,
            risk_score=classifier_result.risk_score,
            confidence=classifier_result.confidence,
            triggered_layer="grok_classifier",
        )

    # 3. Safety layer: HARMFUL -> BLOCK, HUMAN_REVIEW/SENSITIVE -> ESCALATE.
    if safety_result:
        if safety_result.category in config.SAFETY_BLOCK_CATEGORIES:
            return RouterResult(
                decision="BLOCK",
                category=safety_result.category.lower(),
                reason=safety_result.reason,
                risk_score=safety_result.risk_score,
                confidence=safety_result.confidence,
                triggered_layer="safety",
            )
        if safety_result.category in config.SAFETY_ESCALATE_CATEGORIES:
            return RouterResult(
                decision="ESCALATE",
                category=safety_result.category.lower(),
                reason=safety_result.reason,
                risk_score=safety_result.risk_score,
                confidence=safety_result.confidence,
                triggered_layer="safety",
            )

    # 4. Grok classifier says ESCALATE.
    if classifier_result and classifier_result.decision == "ESCALATE":
        return RouterResult(
            decision="ESCALATE",
            category=classifier_result.category,
            reason=classifier_result.reason,
            risk_score=classifier_result.risk_score,
            confidence=classifier_result.confidence,
            triggered_layer="grok_classifier",
        )

    # 5. Default: ALLOW.
    conf = classifier_result.confidence if classifier_result else rule_result.confidence
    risk = classifier_result.risk_score if classifier_result else rule_result.risk_score
    return RouterResult(
        decision="ALLOW",
        category="student_support",
        reason="No layer raised a block or escalation signal; request is safe and in scope.",
        risk_score=risk,
        confidence=conf,
        triggered_layer="router",
    )
