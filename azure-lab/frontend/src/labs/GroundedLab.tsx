import { useState } from "react";
import { api, GroundedCompareResp } from "../api";
import { Page, Panel, Callout, Bar, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

const EXAMPLES = [
  "What is our exact API rate limit on the Free plan?",
  "How many days do I have to get a refund?",
  "What does error code E-402 mean?",
];

export default function GroundedLab() {
  const [query, setQuery] = useState(EXAMPLES[0]);
  const [resp, setResp] = useState<GroundedCompareResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.groundedCompare({ query })); }
    finally { setLoading(false); }
  }

  const best = resp?.retrieved?.[0]?.score ?? 1;

  return (
    <Page
      title="Grounded vs Ungrounded"
      subtitle="Same question, two ways: straight from the model's memory vs constrained to retrieved context. See how grounding cuts hallucination on company-specific facts."
    >
      <NeedsConfig embed />
      <Panel title="Question">
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
        <div className="row" style={{ marginTop: 12 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="btn ghost" style={{ fontSize: 12 }} onClick={() => setQuery(ex)}>
              example {i + 1}
            </button>
          ))}
          <RunButton onClick={run} loading={loading}>Compare</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp && !resp.error && (
        <>
          <div className="grid cols-2">
            <Panel title="🧠 Ungrounded (model memory)">
              <div className="answer-card">{resp.ungrounded}</div>
              <Callout tone="warn">
                No context — the model may confidently invent specifics it was never told.
              </Callout>
            </Panel>
            <Panel title="🎯 Grounded (with retrieval)">
              <div className="answer-card">{resp.grounded}</div>
              <Callout tone="good">
                Constrained to the retrieved passages and cites them, or admits it doesn't know.
              </Callout>
            </Panel>
          </div>
          <Panel title="Retrieved context used">
            {resp.retrieved?.map((r, i) => (
              <div key={i} style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 4 }}>[{i + 1}] {r.doc}</div>
                <Bar value={r.score} max={best} label={`passage ${i + 1}`}
                  color={i === 0 ? "var(--green)" : "var(--accent)"} />
              </div>
            ))}
          </Panel>
        </>
      )}
    </Page>
  );
}
