# AI Engineer — Animated Interview Notes

<img width="1670" height="949" alt="image" src="https://github.com/user-attachments/assets/69a2deaa-ac4b-4a73-aa73-c86d94663465" />

An interactive, fully animated learning app that teaches **every topic** from the
*AI Engineer Interview Notes* by letting you *play* with each concept. A React +
Framer Motion frontend drives live demos backed by a real **Python / FastAPI**
service, so tokenization, embeddings, sampling, RAG retrieval, reranking and a
ReAct agent all run for real — not slides.

## What's covered

| Topic | What you can do live |
|-------|----------------------|
| Transformer & Attention | Interactive attention matrix — hover a token to see where it attends |
| Tokenization | Type text, see tokens + real token/word/cost counts from the backend |
| Embeddings & Search | Cosine similarity + semantic search over a live vector space |
| Sampling | Drag temperature / top-k / top-p and watch the distribution reshape |
| Context & Hallucination | "Lost in the middle" curve, cost/latency scaling, mitigations |
| Prompt Engineering | Zero/few-shot/CoT toggles + a working prompt-injection defense demo |
| RAG Systems | Animate chunk → embed → retrieve (dense/sparse/hybrid) → rerank |
| AI Agents | A real ReAct loop (Thought→Action→Observation) with safe tools |
| Fine-tune vs RAG vs Prompt | Interactive decision helper + comparison matrix |
| Evaluation & Production | Live metrics dashboard + LLM-as-judge biases |
| System Design | The 5-step framework on a 10M-user support bot |
| 30-Day Checklist / Glossary | Trackable prep plan + searchable A–Z glossary |

## Project layout

```
backend/    FastAPI service (pure-python embeddings, tokenizer, RAG, agent)
frontend/   Vite + React + TypeScript + framer-motion
```

## Run it

Two terminals (or use `start-all.ps1`).

### 1. Backend

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --port 8000
```

### 2. Frontend

```powershell
cd frontend
npm install
npm run dev
```

Open http://localhost:5173 — the Vite dev server proxies `/api/*` to the backend.

### One command

```powershell
./start-all.ps1
```

## Notes

- Embeddings are a lightweight, dependency-free char-n-gram embedder so everything
  runs offline. If `sentence-transformers` is installed, the backend transparently
  upgrades to real embeddings (the sidebar shows which backend is active).
- The agent's calculator uses a safe AST evaluator (no `eval`/`exec`).



