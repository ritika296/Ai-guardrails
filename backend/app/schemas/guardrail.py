from typing import Literal, Optional
from pydantic import BaseModel, Field

Decision = Literal["ALLOW", "BLOCK", "ESCALATE"]
TriggeredLayer = Literal[
    "rule_based", "grok_classifier", "safety", "router", "output_guardrail", "none"
]


class GuardrailResult(BaseModel):
    """Common structured output every guardrail layer produces."""
    decision: Decision
    category: str
    reason: str
    risk_score: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    triggered_layer: TriggeredLayer
    layer_name: str
    latency_ms: float = 0.0
    called: bool = True


class SafetyResult(BaseModel):
    category: Literal["SAFE", "SUSPICIOUS", "HARMFUL", "SENSITIVE", "HUMAN_REVIEW"]
    reason: str
    risk_score: float = Field(ge=0.0, le=1.0)
    confidence: float = Field(ge=0.0, le=1.0)
    component: str
    latency_ms: float = 0.0
    called: bool = True


class RouterResult(BaseModel):
    decision: Decision
    category: str
    reason: str
    risk_score: float
    confidence: float
    triggered_layer: TriggeredLayer


class PipelineTrace(BaseModel):
    """Full record of a single request moving through every layer."""
    request_id: str
    input: str
    rule_based: GuardrailResult
    grok_classifier: Optional[GuardrailResult] = None
    safety: Optional[SafetyResult] = None
    router: RouterResult
    assistant_output: Optional[str] = None
    output_guardrail: Optional[GuardrailResult] = None
    final_response: str
    total_latency_ms: float = 0.0
    timestamp: str
