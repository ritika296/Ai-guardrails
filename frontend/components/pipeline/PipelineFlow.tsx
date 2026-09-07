"use client";

import { motion } from "framer-motion";
import { ShieldAlert, Brain, Eye, GitBranch, Sparkles, ShieldCheck, ArrowDown, Ban } from "lucide-react";
import type { PipelineTrace } from "@/types/guardrail";
import DecisionBadge from "@/components/ui/DecisionBadge";
import MarkdownContent from "@/components/chat/MarkdownContent";

interface Stage {
  key: string;
  title: string;
  Icon: typeof ShieldAlert;
  called: boolean;
  status: "pass" | "fail" | "skip";
  detail: string;
  latency?: number;
}

function buildStages(trace: PipelineTrace): Stage[] {
  const stages: Stage[] = [
    {
      key: "rule",
      title: "Rule Guardrail",
      Icon: ShieldAlert,
      called: true,
      status: trace.rule_based.decision === "BLOCK" ? "fail" : "pass",
      detail: trace.rule_based.category,
      latency: trace.rule_based.latency_ms,
    },
    {
      key: "classifier",
      title: "Grok Classifier",
      Icon: Brain,
      called: !!trace.grok_classifier?.called,
      status: !trace.grok_classifier?.called
        ? "skip"
        : trace.grok_classifier.decision === "BLOCK"
        ? "fail"
        : "pass",
      detail: trace.grok_classifier?.category ?? "not called",
      latency: trace.grok_classifier?.latency_ms,
    },
    {
      key: "safety",
      title: "Safety Check",
      Icon: Eye,
      called: !!trace.safety?.called,
      status: !trace.safety?.called
        ? "skip"
        : ["HARMFUL", "HUMAN_REVIEW", "SENSITIVE"].includes(trace.safety.category)
        ? "fail"
        : "pass",
      detail: trace.safety?.category ?? "not called",
      latency: trace.safety?.latency_ms,
    },
    {
      key: "router",
      title: "Router",
      Icon: GitBranch,
      called: true,
      status: trace.router.decision === "ALLOW" ? "pass" : "fail",
      detail: trace.router.decision,
    },
    {
      key: "assistant",
      title: "Grok Assistant",
      Icon: Sparkles,
      called: trace.router.decision === "ALLOW",
      status: trace.router.decision === "ALLOW" ? "pass" : "skip",
      detail: trace.router.decision === "ALLOW" ? "executed" : "not called",
    },
    {
      key: "output",
      title: "Output Guardrail",
      Icon: ShieldCheck,
      called: !!trace.output_guardrail?.called,
      status: !trace.output_guardrail?.called
        ? "skip"
        : trace.output_guardrail.decision === "BLOCK"
        ? "fail"
        : "pass",
      detail: trace.output_guardrail?.category ?? "not called",
    },
  ];
  return stages;
}

const statusStyle = {
  pass: { border: "border-allow/40", bg: "bg-allowDim", text: "text-allow", ring: "shadow-[0_0_0_1px_rgba(52,211,153,0.25)]" },
  fail: { border: "border-block/40", bg: "bg-blockDim", text: "text-block", ring: "shadow-[0_0_0_1px_rgba(248,113,113,0.25)]" },
  skip: { border: "border-hairline", bg: "bg-raised", text: "text-faint", ring: "" },
};

export default function PipelineFlow({ trace }: { trace: PipelineTrace }) {
  const stages = buildStages(trace);

  return (
    <div className="flex flex-col items-stretch">
      {stages.map((stage, i) => {
        const s = statusStyle[stage.status];
        return (
          <div key={stage.key} className="flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.12, duration: 0.35 }}
              className={`w-full rounded-md border ${s.border} ${s.bg} ${s.ring} px-4 py-3`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <stage.Icon size={16} className={s.text} strokeWidth={2} />
                  <span className="text-sm font-medium text-ink">{stage.title}</span>
                </div>
                <div className="flex items-center gap-2">
                  {typeof stage.latency === "number" && stage.called && (
                    <span className="font-mono text-xs text-faint">{stage.latency}ms</span>
                  )}
                  {stage.status === "skip" ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-faint">
                      <Ban size={12} /> NOT CALLED
                    </span>
                  ) : (
                    <span className={`font-mono text-xs uppercase ${s.text}`}>
                      {stage.status === "pass" ? "PASSED" : "TRIGGERED"} · {stage.detail}
                    </span>
                  )}
                </div>
              </div>
            </motion.div>
            {i < stages.length - 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.12 + 0.1 }}
                className="py-1 text-faint"
              >
                <ArrowDown size={14} />
              </motion.div>
            )}
          </div>
        );
      })}

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: stages.length * 0.12, duration: 0.35 }}
        className="mt-3 rounded-md border border-signal/30 bg-signalDim px-4 py-3"
      >
        <div className="mb-1 flex items-center justify-between">
          <span className="text-sm font-medium text-ink">Final Response</span>
          <DecisionBadge decision={trace.router.decision} size="sm" />
        </div>
        {trace.router.decision === "ALLOW" ? (
          <MarkdownContent content={trace.final_response} />
        ) : (
          <p className="text-sm text-muted">{trace.final_response}</p>
        )}
      </motion.div>
    </div>
  );
}