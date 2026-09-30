import { useState } from "react";
import { api, RagResp } from "../api";
import { Page, Panel, Callout, Bar, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

export default function RagLab() {
  const [query, setQuery] = useState("how many days do I have to get a refund?");
  const [resp, setResp] = useState<RagResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.rag({ query })); }
    finally { setLoading(false); }
  }

  const best = resp?.retrieved?.[0]?.score ?? 1;

  return (
    <Page
      title="RAG — Grounded Generation"
      subtitle="Real retrieval + real generation. Your query is embedded, the top passages are retrieved by cosine similarity, then the model answers using ONLY that context, with [n] citations."
    >
      <NeedsConfig embed />
      <Panel title="Ask the knowledge base">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div style={{ marginTop: 12 }}>
          <RunButton onClick={run} loading={loading}>Retrieve &amp; answer</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp?.retrieved && (
        <div className="grid cols-2">
          <Panel title="Retrieved context">
            {resp.retrieved.map((r, i) => (
              <div key={i} style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>[{i + 1}] {r.doc}</div>
                <Bar value={r.score} max={best} label={`passage ${i + 1}`}
                  color={i === 0 ? "var(--green)" : "var(--accent)"} />
              </div>
            ))}
          </Panel>
          <Panel title="Grounded answer">
            <div className="answer-card">{resp.answer}</div>
            {resp.usage && (
              <div className="usage-row">
                <span>prompt <b>{resp.usage.prompt_tokens}</b></span>
                <span>completion <b>{resp.usage.completion_tokens}</b></span>
                <span>total <b>{resp.usage.total_tokens}</b></span>
              </div>
            )}
            <Callout tone="good">
              Because the model is told to use only the retrieved context and cite it, answers stay
              grounded and hallucinations drop. Ask something outside the KB to see it decline.
            </Callout>
          </Panel>
        </div>
      )}
    </Page>
  );
}
