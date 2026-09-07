"use client";

import { useState } from "react";
import { Play, BarChart3 } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { api } from "@/lib/api";
import { Button, StatCard, Card } from "@/components/ui/Primitives";
import { Skeleton, ErrorState, EmptyState } from "@/components/ui/States";
import type { EvaluationMetrics, AttackRunResult } from "@/types/guardrail";

const DECISION_COLORS: Record<string, string> = { ALLOW: "#34D399", BLOCK: "#F87171", ESCALATE: "#FBBF24" };

export default function EvaluationPage() {
  const [metrics, setMetrics] = useState<EvaluationMetrics | null>(null);
  const [results, setResults] = useState<AttackRunResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    try {
      const r = await api.runEvaluation();
      setMetrics(r.metrics);
      setResults(r.results);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const decisionData = metrics
    ? [
        { name: "ALLOW", value: metrics.allow_count },
        { name: "BLOCK", value: metrics.block_count },
        { name: "ESCALATE", value: metrics.escalate_count },
      ]
    : [];

  const layerData = results.length
    ? Object.entries(
        results.reduce<Record<string, number>>((acc, r) => {
          acc[r.triggered_layer] = (acc[r.triggered_layer] || 0) + 1;
          return acc;
        }, {})
      ).map(([layer, count]) => ({ layer, count }))
    : [];

  const latencyData = results.map((r) => ({ id: r.case.id, latency: r.trace.total_latency_ms }));

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="mb-2 flex items-center gap-2">
        <BarChart3 size={20} className="text-signal" />
        <h1 className="font-display text-2xl font-semibold text-ink">Evaluation</h1>
      </div>
      <p className="mb-6 text-sm text-muted">
        Metrics computed live from the test dataset — nothing here is hard-coded.
      </p>

      <Button onClick={run} disabled={loading}>
        <Play size={14} /> Run Evaluation Suite
      </Button>

      {error && <div className="mt-4"><ErrorState message={error} /></div>}

      {loading && (
        <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      )}

      {!loading && !metrics && (
        <div className="mt-8">
          <EmptyState
            title="No evaluation run yet"
            description="Run the suite to compute attack blocking rate, false refusal rate, and routing accuracy against the 18-case test dataset."
          />
        </div>
      )}

      {!loading && metrics && (
        <>
          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Attack Blocking Rate" value={`${metrics.attack_blocking_rate}%`} accent="allow" />
            <StatCard label="False Refusal Rate" value={`${metrics.false_refusal_rate}%`} accent="block" />
            <StatCard label="Routing Accuracy" value={`${metrics.routing_accuracy}%`} accent="signal" />
            <StatCard label="Overall Accuracy" value={`${metrics.overall_accuracy}%`} accent="signal" />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="Total Requests" value={metrics.total_requests} />
            <StatCard label="ALLOW" value={metrics.allow_count} accent="allow" />
            <StatCard label="BLOCK" value={metrics.block_count} accent="block" />
            <StatCard label="ESCALATE" value={metrics.escalate_count} accent="escalate" />
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="p-5">
              <div className="mb-4 text-xs uppercase tracking-wide text-faint">Decision Distribution</div>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={decisionData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80}>
                    {decisionData.map((d) => (
                      <Cell key={d.name} fill={DECISION_COLORS[d.name]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: "#1A2029", border: "1px solid #262D3A", borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5">
              <div className="mb-4 text-xs uppercase tracking-wide text-faint">Layer Performance (triggers)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={layerData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262D3A" />
                  <XAxis dataKey="layer" tick={{ fill: "#8B93A5", fontSize: 11 }} />
                  <YAxis tick={{ fill: "#8B93A5", fontSize: 11 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#1A2029", border: "1px solid #262D3A", borderRadius: 8 }} />
                  <Bar dataKey="count" fill="#3FD0C9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-5 md:col-span-2">
              <div className="mb-4 text-xs uppercase tracking-wide text-faint">
                Request Latency (avg {metrics.average_latency_ms}ms)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={latencyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#262D3A" />
                  <XAxis dataKey="id" tick={{ fill: "#8B93A5", fontSize: 10 }} />
                  <YAxis tick={{ fill: "#8B93A5", fontSize: 11 }} unit="ms" />
                  <Tooltip contentStyle={{ background: "#1A2029", border: "1px solid #262D3A", borderRadius: 8 }} />
                  <Bar dataKey="latency" fill="#3FD0C9" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
