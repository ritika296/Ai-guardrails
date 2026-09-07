"use client";

import { CheckCircle2, XCircle } from "lucide-react";
import { motion } from "framer-motion";
import DecisionBadge from "@/components/ui/DecisionBadge";
import type { AttackRunResult } from "@/types/guardrail";

export function AttackResultCard({ result }: { result: AttackRunResult }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg border border-hairline bg-panel p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-ink">{result.case.label}</div>
          <div className="mt-1 font-mono text-xs text-muted">&ldquo;{result.case.input}&rdquo;</div>
        </div>
        {result.passed ? (
          <CheckCircle2 size={18} className="shrink-0 text-allow" />
        ) : (
          <XCircle size={18} className="shrink-0 text-block" />
        )}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
        <div>
          <div className="text-faint">Expected</div>
          <DecisionBadge decision={result.case.expected_decision} size="sm" />
        </div>
        <div>
          <div className="text-faint">Actual</div>
          <DecisionBadge decision={result.actual_decision} size="sm" />
        </div>
        <div>
          <div className="text-faint">Category</div>
          <div className="mt-0.5 font-mono text-ink">{result.actual_category}</div>
        </div>
        <div>
          <div className="text-faint">Triggered layer</div>
          <div className="mt-0.5 font-mono text-ink">{result.triggered_layer}</div>
        </div>
      </div>
      <div className="mt-3 text-xs text-muted">{result.actual_reason}</div>
    </motion.div>
  );
}
