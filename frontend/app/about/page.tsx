import { Info } from "lucide-react";
import { Card } from "@/components/ui/Primitives";

const SECTIONS = [
  {
    title: "Why a system prompt alone isn't a guardrail",
    body: "A system prompt is an instruction, not an enforcement mechanism — a sufficiently determined user can often talk a model into ignoring, reframing, or 'forgetting' it. Guardrails add independent checks outside the model's own instruction-following: deterministic pattern detection, a second classification pass, and a review of what actually comes out, so no single point of failure can compromise the whole system.",
  },
  {
    title: "What guardrails are",
    body: "Guardrails are checks that sit around a language model — on its input, its behavior, and its output — deciding whether a request should proceed, be refused, or be routed to a human, independent of what the model itself would have done unprompted.",
  },
  {
    title: "What defense-in-depth means",
    body: "No single layer is trusted to catch everything. A rule-based filter catches known attack signatures cheaply; an LLM classifier catches novel or paraphrased attempts the rules miss; a safety layer adds a second, differently-scoped opinion; and an output guardrail catches anything that slipped through after generation. Each layer is a chance to catch what the others missed.",
  },
  { title: "What ALLOW means", body: "The request is safe and within the assistant's intended scope. It proceeds to the Grok-powered student assistant for a real response." },
  { title: "What BLOCK means", body: "The request was identified as malicious, unsafe, or a policy violation — prompt injection, jailbreak attempts, system-prompt extraction, or similarly prohibited content. The assistant is never called; a safe refusal is returned instead." },
  { title: "What ESCALATE means", body: "The request needs human or institutional judgment the assistant isn't authorized to give — grade disputes, faculty complaints, administrative decisions, or sensitive personal topics. The assistant is not called; the student is directed to the right human channel." },
  { title: "What input guardrails do", body: "They inspect a message before any expensive model call happens — the deterministic rule layer runs first specifically because it's fast, free, and catches the most obvious attacks without needing the network." },
  { title: "What LLM guardrails do", body: "A separate, narrowly-scoped Grok call classifies intent, scope, and risk. It is explicitly instructed never to answer the user's underlying question — its only output is a structured decision." },
  { title: "What safety layers do", body: "This project does not use a dedicated third-party moderation API or model — its safety layer is a second Grok pass with its own system prompt, plus a small set of deterministic topic rules for things that should always route to a human (e.g. wellbeing concerns) regardless of what a model concludes." },
  { title: "What output guardrails do", body: "After the assistant generates an answer, a final check looks for system-prompt leakage, fabricated institutional claims, or unsafe advice in the response itself — before it's shown to the student." },
  { title: "Why evaluation matters", body: "Claims about a guardrail system's effectiveness are only meaningful if they're measured against a real test set, run through the real pipeline, and recomputed every time — never asserted or hard-coded." },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <div className="mb-2 flex items-center gap-2">
        <Info size={20} className="text-signal" />
        <h1 className="font-display text-2xl font-semibold text-ink">About</h1>
      </div>
      <p className="mb-8 text-sm text-muted">
        AI Guardrails: Build, Attack, and Protect an AI Student Support Assistant — an AI/ML
        classroom project demonstrating layered defenses around a language model.
      </p>

      <div className="space-y-4">
        {SECTIONS.map((s) => (
          <Card key={s.title} className="p-5">
            <h2 className="font-display text-sm font-semibold text-ink">{s.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{s.body}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8 border-escalate/30 bg-escalateDim p-5">
        <h2 className="font-display text-sm font-semibold text-escalate">Limitations</h2>
        <ul className="mt-3 space-y-2 text-sm text-ink/90">
          <li>Guardrails reduce risk — they do not guarantee complete safety.</li>
          <li>LLM classifiers can make mistakes, including confident-sounding wrong ones.</li>
          <li>Rule-based systems can miss novel or heavily obfuscated attacks.</li>
          <li>False positives (blocking safe requests) and false negatives (missing attacks) are both possible.</li>
          <li>Human escalation remains an essential part of the system, not a fallback of last resort.</li>
          <li>This project makes no claim of 100% security, and neither should any guardrail system.</li>
        </ul>
      </Card>
    </div>
  );
}
