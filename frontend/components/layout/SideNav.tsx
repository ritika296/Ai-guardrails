"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShieldCheck, LayoutDashboard, MessageSquare, Workflow, Swords, BarChart3, Info, PlayCircle } from "lucide-react";
import clsx from "clsx";

const ITEMS = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/assistant", label: "Student Assistant", Icon: MessageSquare },
  { href: "/pipeline", label: "Guardrail Pipeline", Icon: Workflow },
  { href: "/attack-lab", label: "Attack Lab", Icon: Swords },
  { href: "/evaluation", label: "Evaluation", Icon: BarChart3 },
  { href: "/demo", label: "Demo Mode", Icon: PlayCircle },
  { href: "/about", label: "About", Icon: Info },
];

export default function SideNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex w-60 shrink-0 flex-col border-r border-hairline bg-panel/60 backdrop-blur-sm">
      <Link href="/" className="flex items-center gap-2 px-5 py-5">
        <ShieldCheck size={20} className="text-signal" strokeWidth={2.2} />
        <span className="font-display text-sm font-semibold tracking-tight">AI Guardrails</span>
      </Link>
      <div className="flex-1 space-y-0.5 px-3">
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                "focus-ring flex items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                active ? "bg-raised text-ink" : "text-muted hover:text-ink hover:bg-raised/60"
              )}
            >
              <Icon size={16} className={active ? "text-signal" : ""} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </div>
      <div className="px-5 py-4 text-xs text-faint">Defense-in-depth demo</div>
    </nav>
  );
}
