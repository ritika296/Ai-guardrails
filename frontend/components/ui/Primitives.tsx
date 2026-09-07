import { ReactNode } from "react";
import clsx from "clsx";

export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={clsx("rounded-lg border border-hairline bg-panel", className)}>
      {children}
    </div>
  );
}

export function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  className,
  type = "button",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  disabled?: boolean;
  className?: string;
  type?: "button" | "submit";
}) {
  const base =
    "focus-ring inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-signal text-void hover:bg-signal/90",
    secondary: "bg-raised text-ink border border-hairline hover:border-signal/40",
    ghost: "text-muted hover:text-ink hover:bg-raised",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={clsx(base, variants[variant], className)}>
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  sublabel,
  accent,
}: {
  label: string;
  value: string | number;
  sublabel?: string;
  accent?: "allow" | "block" | "escalate" | "signal";
}) {
  const accentColor = accent
    ? { allow: "text-allow", block: "text-block", escalate: "text-escalate", signal: "text-signal" }[accent]
    : "text-ink";
  return (
    <Card className="p-5">
      <div className="text-xs uppercase tracking-wide text-faint">{label}</div>
      <div className={clsx("mt-2 font-display text-3xl font-semibold", accentColor)}>{value}</div>
      {sublabel && <div className="mt-1 text-xs text-muted">{sublabel}</div>}
    </Card>
  );
}

export function StatusDot({ ok }: { ok: boolean }) {
  return (
    <span className="relative flex h-2.5 w-2.5">
      {ok && (
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-allow opacity-60" />
      )}
      <span className={clsx("relative inline-flex h-2.5 w-2.5 rounded-full", ok ? "bg-allow" : "bg-block")} />
    </span>
  );
}
