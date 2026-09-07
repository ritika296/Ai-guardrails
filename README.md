# AI Guardrails: Build, Attack, and Protect an AI Student Support Assistant

An AI/ML classroom project demonstrating a defense-in-depth guardrail architecture around
a Grok-powered student support assistant: a rule-based input filter, an LLM classifier, a
safety layer, a deterministic router, and an output guardrail — plus an Attack Lab and a
measured Evaluation suite so every claim in the UI is computed, not hard-coded.

## Problem Statement

A system prompt alone is not a sufficient guardrail — it's an instruction, not an
enforcement mechanism, and can often be talked around. This project shows what a real
defense-in-depth architecture looks like, lets you attack it directly, and measures how
well it actually holds up.

## Learning Objectives

1. Why a system prompt alone is not a sufficient guardrail.
2. How input guardrails work (rule-based, deterministic, no model call).
3. How an LLM-based guardrail classifier works (classification only, never answers).
4. How a safety/moderation layer works (and how to describe it honestly).
5. How ALLOW / BLOCK / ESCALATE routing decisions are made.
6. How output guardrails protect the final response.
7. How multiple layers combine into defense-in-depth.
8. How to evaluate a guardrail system with real, computed metrics.

## Architecture

```
USER INPUT
    │
    ▼
LAYER 1 — Rule-Based Input Guardrail (deterministic, no LLM call)
    ▼
LAYER 2 — Grok Guardrail Classifier (classification only, never answers)
    ▼
LAYER 3 — Safety / Moderation Layer
    ▼
ROUTER (deterministic decision fusion)
    │
    ├── ALLOW ──► Grok Student Assistant ──► LAYER 4 — Output Guardrail ──► FINAL RESPONSE
    ├── BLOCK ──► Safe Refusal Message ────────────────────────────────► FINAL RESPONSE
    └── ESCALATE ► Human Review Notice ────────────────────────────────► FINAL RESPONSE
```

## Technology Stack

**Frontend:** Next.js 14, React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Recharts
**Backend:** Python, FastAPI, Pydantic, httpx
**AI:** xAI Grok API

## Grok API Setup

1. Get an API key from xAI.
2. Copy the example env file: `cp .env.example backend/.env`
3. Fill in `XAI_API_KEY` and `GROK_MODEL` in `backend/.env`.

The API key is read server-side only (`backend/app/config.py`) and is never sent to or
exposed in the frontend/browser. All Grok calls originate from `backend/app/services/`.

## Environment Variables

See `.env.example` at the project root — copy it to `backend/.env`:

| Variable | Purpose |
|---|---|
| `XAI_API_KEY` | Your xAI API key (required) |
| `GROK_MODEL` | Grok model identifier |
| `XAI_BASE_URL` | xAI API base URL |
| `GROK_TIMEOUT_SECONDS` | Per-request timeout |
| `GROK_MAX_RETRIES` | Retry attempts on transient failures |
| `MAX_INPUT_CHARS` | Max characters accepted per chat message |
| `MAX_OUTPUT_TOKENS` | Max tokens per Grok completion |
| `FRONTEND_ORIGIN` | Allowed CORS origin |

## Installation & Running Locally (Windows PowerShell)

### Backend

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy ..\.env.example .env
# edit .env and add your XAI_API_KEY
uvicorn app.main:app --reload --port 8000
```

Backend runs at **http://localhost:8000** — API docs at **http://localhost:8000/docs**.

### Frontend

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at **http://localhost:3000**.

### macOS / Linux

```bash
cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
cp ../.env.example .env   # then edit .env
uvicorn app.main:app --reload --port 8000
```

```bash
cd frontend && npm install && npm run dev
```

## Pages

- **Landing (`/`)** — hero, animated architecture preview, entry points.
- **Dashboard (`/dashboard`)** — system health, cumulative request counts, evaluation summary.
- **Student Assistant (`/assistant`)** — the protected chat interface.
- **Guardrail Pipeline (`/pipeline`)** — animates a single request through every layer live.
- **Attack Lab (`/attack-lab`)** — runs the 18-case test suite through the real pipeline; also
  offers an Unprotected vs Protected side-by-side comparison (clearly labeled as a demo).
- **Evaluation (`/evaluation`)** — computed metrics and charts from the test dataset.
- **About (`/about`)** — plain-language explainer + Limitations.

## Attack Lab

Predefined cases live in `backend/app/evaluation/dataset.py`. Each case has an `id`,
`input`, `expected_decision`, `category`, and `expected_reason`. Run individually or as a
full suite — both the UI and `/api/attack/run` call the same `run_pipeline()` used by
`/api/chat`, so results are never simulated.

## Evaluation & Metrics

`POST /api/evaluation/run` executes the full dataset through the real pipeline and computes:

- **Attack Blocking Rate** = correctly blocked attacks ÷ total attacks × 100
- **False Refusal Rate** = safe requests incorrectly blocked ÷ total safe requests × 100
- **Routing Accuracy** = correct routing decisions ÷ total test cases × 100
- **Overall Guardrail Accuracy** = correct decisions ÷ total test cases × 100

...plus ALLOW/BLOCK/ESCALATE counts and average latency. Nothing is hard-coded — see
`backend/app/evaluation/metrics.py`.

## API Reference

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/health` | GET | Grok config + guardrail status |
| `/api/chat` | POST | Full protected (or unprotected-demo) pipeline |
| `/api/guardrail/check` | POST | Same pipeline, used by the Pipeline/Inspector views |
| `/api/attack/run` | POST | Run one or all attack test cases |
| `/api/attack/cases` | GET | List predefined attack cases |
| `/api/evaluation/run` | POST | Run the full evaluation suite |
| `/api/evaluation/results` | GET | Retrieve the last evaluation run |
| `/api/demo/run` | POST | Run the 3-scenario ALLOW/BLOCK/ESCALATE demo |
| `/api/dashboard/stats` | GET | Cumulative request counts |
| `/api/session/{id}/history` | GET/DELETE | Session chat history |

Full interactive docs at `/docs` once the backend is running.

## Limitations

- Guardrails reduce risk; they do not guarantee complete safety.
- LLM classifiers can make mistakes, including confidently wrong ones.
- Rule-based systems can miss novel or obfuscated attacks.
- False positives and false negatives are both possible — that's exactly what the
  Evaluation page measures.
- Human escalation is a core part of the system, not an afterthought.
- No claim of 100% security is made anywhere in this project.

## Future Improvements

- Persistent storage (database) for session history and evaluation runs across restarts.
- Streaming responses from the assistant.
- Configurable/admin-editable rule patterns and router thresholds.
- Multi-turn conversation context in the classifier and safety layers.

## Troubleshooting

- **"Grok API key is not configured"** — set `XAI_API_KEY` in `backend/.env` and restart uvicorn.
- **CORS errors in the browser console** — confirm `FRONTEND_ORIGIN` in `.env` matches
  `http://localhost:3000` and that the backend was restarted after editing `.env`.
- **Frontend can't reach the backend** — confirm the backend is running on port 8000, or set
  `NEXT_PUBLIC_API_BASE` in `frontend/.env.local` to point elsewhere.
