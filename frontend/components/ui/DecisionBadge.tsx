import { Check, X, AlertTriangle } from "lucide-react";
import type { Decision } from "@/types/guardrail";

const STYLES: Record<Decision, { bg: string; text: string; border: string; Icon: typeof Check; label: string }> = {
  ALLOW: { bg: "bg-allowDim", text: "text-allow", border: "border-allow/30", Icon: Check, label: "ALLOW" },
  BLOCK: { bg: "bg-blockDim", text: "text-block", border: "border-block/30", Icon: X, label: "BLOCK" },
  ESCALATE: { bg: "bg-escalateDim", text: "text-escalate", border: "border-escalate/30", Icon: AlertTriangle, label: "ESCALATE" },
};

export default function DecisionBadge({ decision, size = "md" }: { decision: Decision; size?: "sm" | "md" }) {
  const s = STYLES[decision];
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${s.bg} ${s.text} ${s.border} ${pad} font-mono font-medium tracking-tight`}
    >
      <s.Icon size={size === "sm" ? 12 : 14} strokeWidth={2.5} />
      {s.label}
    </span>
  );
}
