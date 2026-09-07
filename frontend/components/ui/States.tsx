import { ShieldOff, Inbox } from "lucide-react";

export function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-md bg-raised ${className || "h-4 w-full"}`} />;
}

export function PipelineSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-hairline py-14 text-center">
      <Inbox size={22} className="text-faint" />
      <div className="text-sm font-medium text-ink">{title}</div>
      <div className="max-w-sm text-xs text-muted">{description}</div>
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-block/30 bg-blockDim px-4 py-3">
      <ShieldOff size={16} className="mt-0.5 shrink-0 text-block" />
      <div>
        <div className="text-sm font-medium text-ink">Something went wrong</div>
        <div className="mt-0.5 text-xs text-muted">{message}</div>
      </div>
    </div>
  );
}
