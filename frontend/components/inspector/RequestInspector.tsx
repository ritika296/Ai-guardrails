"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import clsx from "clsx";
import type { PipelineTrace, GuardrailResult, SafetyResult } from "@/types/guardrail";
import DecisionBadge from "@/components/ui/DecisionBadge";

function Row({
  title,
  called,
  decision,
  reason,
  risk,
  confidence,
  latency,
  layer,
}: {
  title: string;
  called: boolean;
  decision?: string;
  reason: string;
  risk?: number;
  confidence?: number;
  latency?: number;
  layer: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-hairline last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="focus-ring flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="flex items-center gap-3">
          <ChevronDown size={14} className={clsx("text-faint transition-transform", open && "rotate-180")} />
          <span className="text-sm font-medium text-ink">{title}</span>
          {!called && <span className="font-mono text-xs text-faint">not called</span>}
        </div>
        {decision && <DecisionBadge decision={decision as any} size="sm" />}
      </button>
      {open && (
        <div className="grid grid-cols-2 gap-3 px-4 pb-4 text-xs sm:grid-cols-4">
          <div>
            <div className="text-faint">Reason</div>
            <div className="col-span-3 mt-0.5 text-muted">{reason}</div>
          </div>
          {typeof risk === "number" && (
            <div>
              <div className="text-faint">Risk</div>
              <div className="mt-0.5 font-mono text-ink">{risk.toFixed(2)}</div>
            </div>
          )}
          {typeof confidence === "number" && (
            <div>
              <div className="text-faint">Confidence</div>
              <div className="mt-0.5 font-mono text-ink">{confidence.toFixed(2)}</div>
            </div>
          )}
          {typeof latency === "number" && (
            <div>
              <div className="text-faint">Latency</div>
              <div className="mt-0.5 font-mono text-ink">{latency}ms</div>
            </div>
          )}
          <div>
            <div className="text-faint">Triggered layer</div>
            <div className="mt-0.5 font-mono text-ink">{layer}</div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RequestInspector({ trace }: { trace: PipelineTrace }) {
  const gr = (r: GuardrailResult | null, title: string) =>
    r && (
      <Row
        title={title}
        called={r.called}
        decision={r.decision}
        reason={r.reason}
        risk={r.risk_score}
        confidence={r.confidence}
        latency={r.latency_ms}
        layer={r.triggered_layer}
      />
    );

  const safety = trace.safety;

  return (
    <div className="rounded-lg border border-hairline bg-panel">
      <div className="border-b border-hairline px-4 py-3">
        <div className="text-xs text-faint">Input</div>
        <div className="mt-1 font-mono text-sm text-ink">{trace.input}</div>
      </div>
      {gr(trace.rule_based, "Rule Result")}
      {gr(trace.grok_classifier, "Grok Classifier")}
      {safety && (
        <Row
          title="Safety Result"
          called={safety.called}
          decision={undefined}
          reason={`${safety.category} — ${safety.reason} (component: ${safety.component})`}
          risk={safety.risk_score}
          confidence={safety.confidence}
          latency={safety.latency_ms}
          layer={safety.component}
        />
      )}
      <Row
        title="Router Result"
        called={true}
        decision={trace.router.decision}
        reason={trace.router.reason}
        risk={trace.router.risk_score}
        confidence={trace.router.confidence}
        layer={trace.router.triggered_layer}
      />
      {trace.assistant_output && (
        <Row
          title="Assistant Result"
          called={true}
          reason={trace.assistant_output}
          layer="grok_assistant"
        />
      )}
      {gr(trace.output_guardrail, "Output Guardrail")}
      <div className="px-4 py-3">
        <div className="text-xs text-faint">Final Response</div>
        <div className="mt-1 text-sm text-muted">{trace.final_response}</div>
        <div className="mt-2 font-mono text-xs text-faint">Total latency: {trace.total_latency_ms}ms</div>
      </div>
    </div>
  );
}
