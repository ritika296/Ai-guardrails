"use client";

import { motion } from "framer-motion";
import { User, Bot } from "lucide-react";
import type { PipelineTrace } from "@/types/guardrail";
import DecisionBadge from "@/components/ui/DecisionBadge";
import MarkdownContent from "@/components/chat/MarkdownContent";

export function UserBubble({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start justify-end gap-3"
    >
      <div className="max-w-[75%] rounded-lg rounded-tr-sm bg-raised px-4 py-3 text-sm text-ink">{text}</div>
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-raised text-muted">
        <User size={14} />
      </div>
    </motion.div>
  );
}

export function AssistantBubble({ trace }: { trace: PipelineTrace }) {
  const decision = trace.router.decision;
  const guardrailsPassed = [
    trace.rule_based.decision !== "BLOCK",
    trace.grok_classifier ? trace.grok_classifier.decision !== "BLOCK" : true,
    trace.safety ? !["HARMFUL"].includes(trace.safety.category) : true,
    trace.output_guardrail ? trace.output_guardrail.decision !== "BLOCK" : true,
  ].filter(Boolean).length;

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-signalDim text-signal">
        <Bot size={14} />
      </div>
      <div className="max-w-[75%] space-y-2">
        <div
          className={
            "rounded-lg rounded-tl-sm px-4 py-3 text-sm " +
            (decision === "BLOCK"
              ? "border border-block/30 bg-blockDim text-ink"
              : decision === "ESCALATE"
              ? "border border-escalate/30 bg-escalateDim text-ink"
              : "bg-raised text-ink")
          }
        >
          {decision === "BLOCK" && <div className="mb-1 text-xs font-semibold text-block">🔴 REQUEST BLOCKED</div>}
          {decision === "ESCALATE" && (
            <div className="mb-1 text-xs font-semibold text-escalate">⚠️ HUMAN ASSISTANCE RECOMMENDED</div>
          )}
          {decision === "ALLOW" ? (
            <MarkdownContent content={trace.final_response} />
          ) : (
            <p>{trace.final_response}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 px-1 font-mono text-xs text-faint">
          <DecisionBadge decision={decision} size="sm" />
          <span>risk {trace.router.risk_score.toFixed(2)}</span>
          <span>·</span>
          <span>confidence {trace.router.confidence.toFixed(2)}</span>
          <span>·</span>
          <span>guardrails {guardrailsPassed}/4</span>
          <span>·</span>
          <span>{trace.total_latency_ms}ms</span>
        </div>
      </div>
    </motion.div>
  );
}
