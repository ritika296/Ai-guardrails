"""
Layer 1 — Rule-Based Input Guardrail.

Deterministic, no LLM call, no network call. Detects known attack *families*
via small explainable pattern functions rather than one giant keyword list,
so the reason string always names which family fired.
"""
import re
import time
from app.schemas.guardrail import GuardrailResult
from app import config

# Each family: (name, category, list of regex patterns, risk_score, reason)
_FAMILIES = [
    (
        "instruction_override",
        "prompt_injection",
        [
            r"\bignore (all|any|the)?\s*(previous|prior|above)\s*instructions?\b",
            r"\bforget (your|all|the)?\s*(rules|instructions|guidelines)\b",
            r"\bdisregard (your|the)?\s*(previous|prior)?\s*(instructions|rules)\b",
            r"\boverrid(e|ing) (your|the)?\s*(instructions|rules|programming)\b",
        ],
        0.95,
        "Detected phrasing attempting to override the assistant's instructions.",
    ),
    (
        "system_prompt_extraction",
        "prompt_extraction",
        [
            r"\b(reveal|show|print|output|repeat)\s+(your|the)?\s*system\s*prompt\b",
            r"\b(reveal|show|print|output)\s+(your|the)?\s*hidden\s*instructions?\b",
            r"\bwhat (are|is) your (system prompt|instructions|rules)\b",
            r"\brepeat (the|your) (words|text) above\b",
        ],
        0.93,
        "Detected an attempt to extract the assistant's system prompt or hidden instructions.",
    ),
    (
        "role_reassignment",
        "jailbreak",
        [
            r"\byou are now\s+(unrestricted|free|jailbroken|dan)\b",
            r"\bact as (an?)?\s*(unrestricted|uncensored|jailbroken)\b",
            r"\bpretend (you have no|there are no) (rules|restrictions|guidelines)\b",
            r"\bbypass (your|the|any)?\s*(safety|content)?\s*restrictions?\b",
            r"\benter (developer|dan|god)\s*mode\b",
        ],
        0.92,
        "Detected role-reassignment / jailbreak phrasing attempting to strip safety behavior.",
    ),
    (
        "safety_bypass",
        "safety_bypass",
        [
            r"\bwithout any (filters?|restrictions?|limitations?)\b",
            r"\bno matter (what|the) (rules|policy|guidelines)\b",
            r"\bhypothetically,?\s*if you had no rules\b",
        ],
        0.85,
        "Detected phrasing attempting to bypass safety restrictions via hypothetical framing.",
    ),
]

_COMPILED = [
    (name, category, [re.compile(p, re.IGNORECASE) for p in patterns], risk, reason)
    for name, category, patterns, risk, reason in _FAMILIES
]


def run_rule_guardrail(text: str) -> GuardrailResult:
    start = time.perf_counter()

    if len(text) > config.MAX_INPUT_CHARS:
        return GuardrailResult(
            decision="BLOCK",
            category="input_too_long",
            reason=f"Input exceeds the maximum allowed length of {config.MAX_INPUT_CHARS} characters.",
            risk_score=0.60,
            confidence=1.0,
            triggered_layer="rule_based",
            layer_name="Rule-Based Input Guardrail",
            latency_ms=round((time.perf_counter() - start) * 1000, 2),
        )

    for name, category, patterns, risk, reason in _COMPILED:
        for pattern in patterns:
            if pattern.search(text):
                return GuardrailResult(
                    decision="BLOCK",
                    category=category,
                    reason=f"{reason} (pattern family: {name})",
                    risk_score=risk,
                    confidence=0.97,
                    triggered_layer="rule_based",
                    layer_name="Rule-Based Input Guardrail",
                    latency_ms=round((time.perf_counter() - start) * 1000, 2),
                )

    return GuardrailResult(
        decision="ALLOW",
        category="clean",
        reason="No known attack pattern detected by the rule-based layer.",
        risk_score=0.02,
        confidence=0.90,
        triggered_layer="rule_based",
        layer_name="Rule-Based Input Guardrail",
        latency_ms=round((time.perf_counter() - start) * 1000, 2),
    )
