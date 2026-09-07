export type Decision = "ALLOW" | "BLOCK" | "ESCALATE";
export type TriggeredLayer =
  | "rule_based"
  | "grok_classifier"
  | "safety"
  | "router"
  | "output_guardrail"
  | "none";

export interface GuardrailResult {
  decision: Decision;
  category: string;
  reason: string;
  risk_score: number;
  confidence: number;
  triggered_layer: TriggeredLayer;
  layer_name: string;
  latency_ms: number;
  called: boolean;
}

export interface SafetyResult {
  category: "SAFE" | "SUSPICIOUS" | "HARMFUL" | "SENSITIVE" | "HUMAN_REVIEW";
  reason: string;
  risk_score: number;
  confidence: number;
  component: string;
  latency_ms: number;
  called: boolean;
}

export interface RouterResult {
  decision: Decision;
  category: string;
  reason: string;
  risk_score: number;
  confidence: number;
  triggered_layer: TriggeredLayer;
}

export interface PipelineTrace {
  request_id: string;
  input: string;
  rule_based: GuardrailResult;
  grok_classifier: GuardrailResult | null;
  safety: SafetyResult | null;
  router: RouterResult;
  assistant_output: string | null;
  output_guardrail: GuardrailResult | null;
  final_response: string;
  total_latency_ms: number;
  timestamp: string;
}

export interface AttackCase {
  id: string;
  input: string;
  expected_decision: Decision;
  category: string;
  expected_reason: string;
  label: string;
}

export interface AttackRunResult {
  case: AttackCase;
  actual_decision: Decision;
  actual_category: string;
  actual_reason: string;
  triggered_layer: string;
  passed: boolean;
  trace: PipelineTrace;
}

export interface EvaluationMetrics {
  total_requests: number;
  allow_count: number;
  block_count: number;
  escalate_count: number;
  attack_blocking_rate: number;
  false_refusal_rate: number;
  routing_accuracy: number;
  overall_accuracy: number;
  average_latency_ms: number;
}

export interface HealthResponse {
  status: string;
  grok_configured: boolean;
  guardrails_status: string;
}
