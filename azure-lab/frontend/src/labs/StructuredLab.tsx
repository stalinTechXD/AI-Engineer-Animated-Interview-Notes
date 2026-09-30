import { useState } from "react";
import { api, StructuredResp } from "../api";
import { Page, Panel, Callout, Chip, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

const EXAMPLES = [
  "Customer wrote: 'The app keeps crashing on launch and support never replied. Very frustrated.'",
  "Review: 'Fast shipping, great quality, will buy again! Loved the packaging.'",
  "Ticket: 'Cannot log in after the update, password reset email never arrives.'",
];

export default function StructuredLab() {
  const [task, setTask] = useState(EXAMPLES[0]);
  const [resp, setResp] = useState<StructuredResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.structured({ task })); }
    finally { setLoading(false); }
  }

  return (
    <Page
      title="Structured Output (JSON mode)"
      subtitle="Force the model to return machine-parseable JSON with response_format. This is how you wire LLMs into real pipelines instead of parsing prose."
    >
      <NeedsConfig />
      <Panel title="Input text">
        <textarea value={task} onChange={(e) => setTask(e.target.value)} />
        <div className="row" style={{ marginTop: 12 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="btn ghost" style={{ fontSize: 12 }} onClick={() => setTask(ex)}>
              example {i + 1}
            </button>
          ))}
          <RunButton onClick={run} loading={loading}>Extract JSON</RunButton>
        </div>
        <Callout>
          Target schema: <code className="inline">{`{ sentiment, priority, topics[], summary }`}</code>
        </Callout>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp?.raw && (
        <div className="grid cols-2">
          <Panel title="Raw model output">
            <div className="row" style={{ marginBottom: 10 }}>
              <Chip tone={resp.valid_json ? "green" : "red"}>
                {resp.valid_json ? "valid JSON ✓" : "invalid JSON ✗"}
              </Chip>
              {resp.usage && <Chip>{resp.usage.total_tokens} tokens</Chip>}
            </div>
            <div className="mono">{resp.raw}</div>
          </Panel>
          <Panel title="Parsed fields">
            {resp.parsed ? (
              <div>
                {Object.entries(resp.parsed).map(([k, v]) => (
                  <div key={k} className="kv">
                    <span className="k">{k}</span>
                    <span>{Array.isArray(v) ? v.join(", ") : String(v)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <Callout tone="warn">Could not parse JSON.</Callout>
            )}
            <Callout tone="good">
              Because the fields are guaranteed keys, downstream code can route by priority, filter by
              sentiment, or store topics — no fragile text parsing.
            </Callout>
          </Panel>
        </div>
      )}
    </Page>
  );
}
