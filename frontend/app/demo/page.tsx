"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PlayCircle, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { Button, Card } from "@/components/ui/Primitives";
import { Skeleton, ErrorState, EmptyState } from "@/components/ui/States";
import DecisionBadge from "@/components/ui/DecisionBadge";
import PipelineFlow from "@/components/pipeline/PipelineFlow";
import type { AttackRunResult } from "@/types/guardrail";

export default function DemoPage() {
  const [scenarios, setScenarios] = useState<AttackRunResult[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run() {
    setLoading(true);
    setError(null);
    setScenarios([]);
    setActiveIndex(0);
    try {
      const r = await api.runDemo();
      setScenarios(r.scenarios);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  function reset() {
    setScenarios([]);
    setActiveIndex(0);
    setError(null);
  }

  const active = scenarios[activeIndex];

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <div className="mb-2 flex items-center gap-2">
        <PlayCircle size={20} className="text-signal" />
        <h1 className="font-display text-2xl font-semibold text-ink">Demo Mode</h1>
      </div>
      <p className="mb-6 text-sm text-muted">
        A guided, classroom-ready walkthrough of all three routing outcomes — SAFE, BLOCKED, and
        ESCALATED — each traced through the real pipeline.
      </p>

      <div className="flex items-center gap-3">
        <Button onClick={run} disabled={loading}>
          <PlayCircle size={15} /> {scenarios.length ? "Run Again" : "Run Demo"}
        </Button>
        {scenarios.length > 0 && (
          <Button variant="ghost" onClick={reset}>
            <RotateCcw size={14} /> Reset
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-4">
          <ErrorState message={error} />
        </div>
      )}

      {loading && (
        <div className="mt-8 space-y-2">
          <Skeleton className="h-10 w-2/3" />
          <Skeleton className="h-64 w-full" />
        </div>
      )}

      {!loading && scenarios.length === 0 && !error && (
        <div className="mt-8">
          <EmptyState
            title="Demo not started"
            description="Press Run Demo to step through a safe request, a prompt-injection block, and a human-escalation case — in that order, live."
          />
        </div>
      )}

      {!loading && scenarios.length > 0 && (
        <>
          <div className="mt-8 flex gap-2">
            {scenarios.map((s, i) => (
              <button
                key={s.case.id}
                onClick={() => setActiveIndex(i)}
                className={`focus-ring flex-1 rounded-md border px-3 py-2.5 text-left transition-colors ${
                  i === activeIndex
                    ? "border-signal/40 bg-signalDim"
                    : "border-hairline bg-panel hover:border-signal/20"
                }`}
              >
                <div className="text-xs text-faint">Scenario {i + 1}</div>
                <div className="mt-0.5 text-sm font-medium text-ink">{s.case.label}</div>
                <div className="mt-1.5">
                  <DecisionBadge decision={s.actual_decision} size="sm" />
                </div>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {active && (
              <motion.div
                key={active.case.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-6"
              >
                <Card className="p-4">
                  <div className="mb-1 text-xs text-faint">Input</div>
                  <div className="font-mono text-sm text-ink">&ldquo;{active.case.input}&rdquo;</div>
                </Card>
                <Card className="mt-4 p-6">
                  <PipelineFlow trace={active.trace} />
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
