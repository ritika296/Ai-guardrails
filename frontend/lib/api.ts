import type {
  PipelineTrace,
  AttackRunResult,
  EvaluationMetrics,
  HealthResponse,
  AttackCase,
} from "@/types/guardrail";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options?.headers || {}) },
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      message = body.error || body.detail || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json();
}

export const api = {
  health: () => request<HealthResponse>("/api/health"),

  chat: (message: string, sessionId: string, mode: "protected" | "unprotected" = "protected") =>
    request<{ trace: PipelineTrace }>("/api/chat", {
      method: "POST",
      body: JSON.stringify({ message, session_id: sessionId, mode }),
    }),

  guardrailCheck: (message: string) =>
    request<PipelineTrace>("/api/guardrail/check", {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  listAttackCases: () => request<{ cases: AttackCase[] }>("/api/attack/cases"),

  runAttack: (attackId?: string) =>
    request<{ results: AttackRunResult[] }>("/api/attack/run", {
      method: "POST",
      body: JSON.stringify({ attack_id: attackId ?? null }),
    }),

  runEvaluation: () =>
    request<{ metrics: EvaluationMetrics; results: AttackRunResult[] }>("/api/evaluation/run", {
      method: "POST",
    }),

  getEvaluationResults: () =>
    request<{ metrics: EvaluationMetrics; results: AttackRunResult[] }>("/api/evaluation/results"),

  runDemo: () => request<{ scenarios: AttackRunResult[] }>("/api/demo/run", { method: "POST" }),

  dashboardStats: () =>
    request<{ total_requests: number; allow_count: number; block_count: number; escalate_count: number }>(
      "/api/dashboard/stats"
    ),

  clearHistory: (sessionId: string) =>
    request(`/api/session/${sessionId}/history`, { method: "DELETE" }),

  getHistory: (sessionId: string) =>
    request<{ history: PipelineTrace[] }>(`/api/session/${sessionId}/history`),
};
