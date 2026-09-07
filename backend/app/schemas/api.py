from typing import List, Optional
from pydantic import BaseModel, Field
from app.schemas.guardrail import PipelineTrace, Decision


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)
    session_id: str = "default"
    mode: str = "protected"  # "protected" | "unprotected"


class ChatResponse(BaseModel):
    trace: PipelineTrace


class GuardrailCheckRequest(BaseModel):
    message: str = Field(min_length=1, max_length=2000)


class AttackCase(BaseModel):
    id: str
    input: str
    expected_decision: Decision
    category: str
    expected_reason: str
    label: str


class AttackRunRequest(BaseModel):
    attack_id: Optional[str] = None  # None => run full suite


class AttackRunResult(BaseModel):
    case: AttackCase
    actual_decision: Decision
    actual_category: str
    actual_reason: str
    triggered_layer: str
    passed: bool
    trace: PipelineTrace


class AttackRunResponse(BaseModel):
    results: List[AttackRunResult]


class EvaluationMetrics(BaseModel):
    total_requests: int
    allow_count: int
    block_count: int
    escalate_count: int
    attack_blocking_rate: float
    false_refusal_rate: float
    routing_accuracy: float
    overall_accuracy: float
    average_latency_ms: float


class EvaluationRunResponse(BaseModel):
    metrics: EvaluationMetrics
    results: List[AttackRunResult]


class DemoRunResponse(BaseModel):
    scenarios: List[AttackRunResult]


class HealthResponse(BaseModel):
    status: str
    grok_configured: bool
    guardrails_status: str
