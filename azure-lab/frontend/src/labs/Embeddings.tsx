import { useState } from "react";
import { api, EmbedResp } from "../api";
import { Page, Panel, Callout, Bar, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

export default function Embeddings() {
  const [query, setQuery] = useState("how do I get my money back");
  const [itemsText, setItemsText] = useState(
    ["return policy and refunds", "reset my password", "pricing of the pro plan", "engine fault warning light"].join("\n")
  );
  const [resp, setResp] = useState<EmbedResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    const items = itemsText.split("\n").map((s) => s.trim()).filter(Boolean);
    setLoading(true);
    try { setResp(await api.embed({ query, items })); }
    finally { setLoading(false); }
  }

  const best = resp?.results?.[0]?.cosine ?? 1;

  return (
    <Page
      title="Embeddings & Semantic Search"
      subtitle="Real embedding vectors from your deployment. The query and every candidate are embedded, then ranked by cosine similarity."
    >
      <NeedsConfig embed />
      <Panel title="Query and candidates">
        <label className="field">Query</label>
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
        <label className="field" style={{ marginTop: 12 }}>Candidates (one per line)</label>
        <textarea value={itemsText} onChange={(e) => setItemsText(e.target.value)} style={{ minHeight: 120 }} />
        <div style={{ marginTop: 12 }}>
          <RunButton onClick={run} loading={loading}>Embed &amp; rank</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp?.results && (
        <Panel title={`Ranking · ${resp.dims}-dim vectors`}>
          {resp.results.map((r, i) => (
            <Bar
              key={i}
              value={r.cosine}
              max={best}
              label={r.text}
              color={i === 0 ? "var(--green)" : "var(--accent)"}
            />
          ))}
          <Callout>
            Semantic search matches meaning, not keywords — "get my money back" ranks the refund
            document top even though it shares no words with it.
          </Callout>
        </Panel>
      )}
    </Page>
  );
}
