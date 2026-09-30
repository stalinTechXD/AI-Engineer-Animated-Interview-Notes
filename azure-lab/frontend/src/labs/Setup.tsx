import { useConfig } from "../App";
import { Page, Panel, Chip, Callout } from "../components/ui";

export default function Setup() {
  const { cfg, refresh } = useConfig();
  const ok = cfg?.chat_ready;

  return (
    <Page
      title="Setup & Status"
      subtitle="This sub-project calls REAL Azure AI Foundry model deployments. Point it at your endpoint once and every lab lights up."
    >
      <Panel title="Connection status">
        <div className="row" style={{ marginBottom: 12 }}>
          <Chip tone={cfg?.chat_ready ? "green" : "red"}>
            {cfg?.chat_ready ? "● chat ready" : "○ chat not configured"}
          </Chip>
          <Chip tone={cfg?.embed_ready ? "green" : "red"}>
            {cfg?.embed_ready ? "● embeddings ready" : "○ embeddings not configured"}
          </Chip>
          <button className="btn ghost" onClick={refresh}>Re-check</button>
        </div>
        <div className="kv"><span className="k">Endpoint</span><span>{cfg?.endpoint ?? "—"}</span></div>
        <div className="kv"><span className="k">API version</span><span>{cfg?.api_version ?? "—"}</span></div>
        <div className="kv"><span className="k">Chat deployment</span><span>{cfg?.chat_deployment ?? "—"}</span></div>
        <div className="kv"><span className="k">Embed deployment</span><span>{cfg?.embed_deployment ?? "—"}</span></div>
      </Panel>

      {!ok && (
        <Panel title="Connect your Azure AI Foundry deployment">
          <Callout tone="warn">
            The backend boots without keys and every lab shows this notice until you fill in
            <code className="inline">backend/.env</code> and restart the backend.
          </Callout>
          <ol style={{ lineHeight: 1.9, fontSize: 14 }}>
            <li>
              Open the <b>Azure AI Foundry</b> portal → your project → <b>Deployments</b>. Deploy a
              chat model (e.g. <code className="inline">gpt-4o-mini</code>) and an embeddings model
              (e.g. <code className="inline">text-embedding-3-small</code>) if you haven't.
            </li>
            <li>
              On a deployment's <b>Endpoint</b> tab, copy the <b>Target URI</b> host and the <b>Key</b>.
            </li>
            <li>
              Edit <code className="inline">c:\dev\AI\azure-lab\backend\.env</code>:
              <div className="mono" style={{ marginTop: 8, background: "#0d1330", padding: 12, borderRadius: 8, border: "1px solid var(--border)" }}>
{`AZURE_OPENAI_ENDPOINT=https://<your-resource>.openai.azure.com
AZURE_OPENAI_API_KEY=<your-key>
AZURE_OPENAI_API_VERSION=2024-10-21
AZURE_OPENAI_CHAT_DEPLOYMENT=<your-chat-deployment-name>
AZURE_OPENAI_EMBED_DEPLOYMENT=<your-embed-deployment-name>`}
              </div>
            </li>
            <li>Restart the backend, then press <b>Re-check</b> above.</li>
          </ol>
          <Callout>
            Use the <b>deployment name</b> you chose in Foundry — not the base model name. They are
            often the same, but not always.
          </Callout>
        </Panel>
      )}

      {ok && (
        <Panel title="You're connected 🎉">
          <Callout tone="good">
            Every lab in the sidebar now runs against your live deployment. Start with the Chat
            Playground, then explore Tokenizer, Embeddings, Sampling, Prompt Techniques, RAG, the
            Tool-calling Agent, and LLM-as-Judge.
          </Callout>
        </Panel>
      )}

      <Panel title="What each lab teaches" hint="Mapped to the interview topics, but with real model behavior.">
        <table className="notes">
          <thead><tr><th>Lab</th><th>Topic</th><th>What you'll observe</th></tr></thead>
          <tbody>
            <tr><td>Chat Playground</td><td>Inference & decoding</td><td>Live completions, token usage, latency of a real deployment.</td></tr>
            <tr><td>Tokenizer</td><td>Tokenization</td><td>Real tiktoken token IDs and tokens-per-word cost ratio.</td></tr>
            <tr><td>Embeddings</td><td>Vector search</td><td>Real embedding cosine ranking of your candidates.</td></tr>
            <tr><td>Sampling</td><td>Temperature / top-p</td><td>N completions of one prompt to see diversity change.</td></tr>
            <tr><td>Prompt Techniques</td><td>Prompt engineering</td><td>Zero-shot vs few-shot vs chain-of-thought on the same task.</td></tr>
            <tr><td>RAG</td><td>Retrieval-augmented generation</td><td>Real retrieval + grounded answer with citations.</td></tr>
            <tr><td>Tool-calling Agent</td><td>Agents / ReAct</td><td>The model actually deciding to call calculator / kb_search tools.</td></tr>
            <tr><td>LLM-as-Judge</td><td>Evaluation</td><td>Position-bias check by swapping answer order.</td></tr>
          </tbody>
        </table>
      </Panel>
    </Page>
  );
}
