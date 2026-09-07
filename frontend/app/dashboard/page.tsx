"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { StatCard, Card, StatusDot } from "@/components/ui/Primitives";
import { Skeleton, ErrorState } from "@/components/ui/States";
import type { EvaluationMetrics, HealthResponse } from "@/types/guardrail";

export default function DashboardPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [stats, setStats] = useState<{
    total_requests: number;
    allow_count: number;
    block_count: number;
    escalate_count: number;
  } | null>(null);
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [h, s] = await Promise.all([api.health(), api.dashboardStats()]);
        setHealth(h);
        setStats(s);
        try {
          const evalRes = await api.getEvaluationResults();
          setMetrics(evalRes.metrics);
        } catch {
          // no evaluation run yet — fine, dashboard just omits those cards
        }
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ink">Dashboard</h1>
          <p className="mt-1 text-sm text-muted">System health and cumulative guardrail activity.</p>
        </div>
      </div>

      {error && <ErrorState message={error} />}

      {loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <Card className="flex items-center gap-3 p-4">
              <StatusDot ok={!!health?.grok_configured} />
              <div>
                <div className="text-xs text-faint">Grok API Status</div>
                <div className="text-sm text-ink">{health?.grok_configured ? "Configured" : "Not configured"}</div>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <StatusDot ok={health?.guardrails_status === "active"} />
              <div>
                <div className="text-xs text-faint">Guardrails Status</div>
                <div className="text-sm text-ink capitalize">{health?.guardrails_status ?? "unknown"}</div>
              </div>
            </Card>
            <Card className="flex items-center gap-3 p-4">
              <StatusDot ok={health?.status === "ok"} />
              <div>
                <div className="text-xs text-faint">System Health</div>
                <div className="text-sm text-ink">{health?.status === "ok" ? "Operational" : "Degraded"}</div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Requests" value={stats?.total_requests ?? 0} accent="signal" />
            <StatCard label="ALLOW" value={stats?.allow_count ?? 0} accent="allow" />
            <StatCard label="BLOCK" value={stats?.block_count ?? 0} accent="block" />
            <StatCard label="ESCALATE" value={stats?.escalate_count ?? 0} accent="escalate" />
          </div>

          {metrics ? (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard
                label="Attack Blocking Rate"
                value={`${metrics.attack_blocking_rate}%`}
                sublabel="from last evaluation run"
                accent="allow"
              />
              <StatCard
                label="False Refusal Rate"
                value={`${metrics.false_refusal_rate}%`}
                sublabel="from last evaluation run"
                accent="block"
              />
              <StatCard
                label="Routing Accuracy"
                value={`${metrics.routing_accuracy}%`}
                sublabel="from last evaluation run"
                accent="signal"
              />
            </div>
          ) : (
            <p className="mt-6 text-sm text-muted">
              Run the evaluation suite on the Evaluation page to populate blocking rate, false
              refusal rate, and routing accuracy here.
            </p>
          )}
        </>
      )}
    </div>
  );
}
