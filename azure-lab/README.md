# Azure AI Foundry — Hands-on Labs (`azure-lab`)

A **separate sub-project** that connects the interview topics to **real Azure AI
Foundry model deployments**. Where the main project (`../backend` + `../frontend`)
*simulates* model behavior for teaching, this one makes **live calls** so you get
hands-on experience with actual chat, embeddings, tokenization, tool-calling, RAG,
and evaluation.

- Backend: FastAPI on **:8001** (`app.main:app`)
- Frontend: Vite + React + TypeScript + framer-motion on **:5174**
- The app **boots without keys** — every lab shows a friendly setup notice until
  you connect a deployment, so nothing crashes.

## Labs → topics

| Lab | Topic |
| --- | --- |
| Chat Playground | Inference, decoding controls, token usage |
| Tokenizer | Real tiktoken tokens & cost ratio (no key needed) |
| Embeddings | Real embedding cosine ranking / semantic search |
| Sampling & Temp | N completions of one prompt to see diversity |
| Prompt Techniques | Zero-shot vs few-shot vs chain-of-thought |
| RAG | Real retrieval + grounded answer with citations |
| Tool-calling Agent | Real Azure function-calling ReAct loop |
| LLM-as-Judge | Position-bias check by swapping answer order |

## 1. Connect your Azure AI Foundry deployment

1. In the **Azure AI Foundry** portal, open your project → **Deployments** and
   deploy a chat model (e.g. `gpt-4o-mini`) and an embeddings model
   (e.g. `text-embedding-3-small`).
2. On a deployment's **Endpoint** tab, copy the endpoint host and the key.
3. Edit `backend/.env`:

   ```env
   AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
   AZURE_OPENAI_API_KEY=<your-key>
   AZURE_OPENAI_API_VERSION=2024-10-21
   AZURE_OPENAI_CHAT_DEPLOYMENT=<your-chat-deployment-name>
   AZURE_OPENAI_EMBED_DEPLOYMENT=<your-embed-deployment-name>
   ```

   > Use the **deployment name** you picked in Foundry, not the base model name.

## 2. Run it

From `c:\dev\AI\azure-lab`:

```powershell
# Backend (terminal 1)
.\backend\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8001 --app-dir .\backend

# Frontend (terminal 2)
npm --prefix .\frontend run dev
```

Then open **http://localhost:5174/** and start on the **Setup & Status** page.
Press **Re-check** after editing `.env` and restarting the backend.

Or use the helper: `./start-all.ps1`.

## First-time setup (already done once)

```powershell
python -m venv .\backend\.venv
.\backend\.venv\Scripts\python.exe -m pip install -r .\backend\requirements.txt
npm --prefix .\frontend install
```

## Notes

- The Tokenizer lab works **without** any Azure key (pure local tiktoken).
- All other labs need a chat deployment; Embeddings and RAG also need the
  embeddings deployment.
- Errors from Azure (bad key, wrong deployment name, network) are caught and shown
  inline instead of crashing the lab.
