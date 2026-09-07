"use client";

import { useState, useRef, useEffect } from "react";
import { Send } from "lucide-react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Primitives";
import { UserBubble, AssistantBubble } from "@/components/chat/ChatBubbles";
import { ErrorState } from "@/components/ui/States";
import type { PipelineTrace } from "@/types/guardrail";

type Turn = { role: "user"; text: string } | { role: "assistant"; trace: PipelineTrace };

export default function AssistantPage() {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const sessionId = useRef(`session-${Date.now()}`);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [turns]);

  async function send() {
    const message = input.trim();
    if (!message || loading) return;
    setInput("");
    setError(null);
    setTurns((t) => [...t, { role: "user", text: message }]);
    setLoading(true);
    try {
      const { trace } = await api.chat(message, sessionId.current, "protected");
      setTurns((t) => [...t, { role: "assistant", trace }]);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto flex h-screen max-w-3xl flex-col px-6 py-8">
      <div className="mb-4">
        <h1 className="font-display text-2xl font-semibold text-ink">Student Assistant</h1>
        <p className="mt-1 text-sm text-muted">
          Ask about study planning, assignments, exam prep, or academic productivity.
        </p>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {turns.length === 0 && (
          <div className="mt-10 text-center text-sm text-faint">
            Try: &ldquo;How can I improve my study schedule before mid-terms?&rdquo;
          </div>
        )}
        {turns.map((turn, i) =>
          turn.role === "user" ? <UserBubble key={i} text={turn.text} /> : <AssistantBubble key={i} trace={turn.trace} />
        )}
        {loading && <div className="px-10 text-xs text-faint">Processing through guardrail pipeline…</div>}
        {error && <ErrorState message={error} />}
        <div ref={bottomRef} />
      </div>

      <div className="mt-4 flex items-end gap-2 rounded-lg border border-hairline bg-panel p-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
          rows={1}
          placeholder="Ask a student-support question…"
          className="focus-ring max-h-32 flex-1 resize-none bg-transparent px-2 py-2 text-sm text-ink placeholder:text-faint outline-none"
        />
        <Button onClick={send} disabled={loading || !input.trim()}>
          <Send size={15} />
        </Button>
      </div>
    </div>
  );
}
