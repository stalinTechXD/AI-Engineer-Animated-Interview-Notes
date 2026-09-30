import { useState } from "react";
import { api, FunctionCallResp } from "../api";
import { Page, Panel, Callout, RunButton, Chip } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

const TOOLS = [
  { name: "calculator", desc: "Evaluate arithmetic like 24 * 7 + 12" },
  { name: "kb_search", desc: "Search the company knowledge base" },
];

const SAMPLES = [
  "What is 24 * 7 + 12?",
  "What is our refund window?",
  "Write a haiku about the ocean.",
];

export default function FunctionCallLab() {
  const [msg, setMsg] = useState("What is 24 * 7 + 12?");
  const [enabled, setEnabled] = useState<string[]>(["calculator", "kb_search"]);
  const [resp, setResp] = useState<FunctionCallResp | null>(null);
  const [loading, setLoading] = useState(false);

  const toggle = (name: string) =>
    setEnabled((e) => (e.includes(name) ? e.filter((n) => n !== name) : [...e, name]));

  async function run() {
    setLoading(true);
    try { setResp(await api.functionCall({ user_message: msg, enabled })); }
    finally { setLoading(false); }
  }

  return (
    <Page
      title="Function Calling — Under the Hood"
      subtitle="Function calling isn't magic: the model looks at the tool schemas you offer and, if useful, emits a structured JSON tool call instead of prose. You run the tool and feed the result back. Toggle tools to change its decision."
    >
      <NeedsConfig />
      <Panel title="Message & available tools">
        <input type="text" value={msg} onChange={(e) => setMsg(e.target.value)} />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
          {SAMPLES.map((s) => (
            <button key={s} className="btn ghost" onClick={() => setMsg(s)}>{s}</button>
          ))}
        </div>
        <div style={{ marginTop: 14, display: "flex", gap: 18, flexWrap: "wrap" }}>
          {TOOLS.map((t) => (
            <label key={t.name} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
              <input type="checkbox" checked={enabled.includes(t.name)} onChange={() => toggle(t.name)} />
              <span><code className="inline">{t.name}</code> — <span style={{ color: "var(--muted)" }}>{t.desc}</span></span>
            </label>
          ))}
        </div>
        <div style={{ marginTop: 14 }}>
          <RunButton onClick={run} loading={loading} disabled={enabled.length === 0}>
            Send with {enabled.length} tool{enabled.length === 1 ? "" : "s"}
          </RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp && !resp.error && (
        resp.called_tool ? (
          <>
            <Panel title="1 · The model chose to call a tool">
              <div className="usage-row" style={{ marginBottom: 10 }}>
                <span>tool <Chip tone="green">{resp.tool_name}</Chip></span>
              </div>
              <label style={{ fontSize: 12, color: "var(--muted)" }}>raw arguments (JSON the model emitted)</label>
              <div className="answer-card mono">{resp.raw_arguments}</div>
            </Panel>
            <div className="grid cols-2">
              <Panel title="2 · Your code runs the tool">
                <label style={{ fontSize: 12, color: "var(--muted)" }}>observation returned to the model</label>
                <div className="answer-card">{resp.observation}</div>
              </Panel>
              <Panel title="3 · Model answers with the result">
                <div className="answer-card">{resp.final_answer}</div>
              </Panel>
            </div>
            <Callout tone="good">{resp.note}</Callout>
          </>
        ) : (
          <Panel title="No tool call — answered directly">
            <div className="answer-card">{resp.direct_answer}</div>
            <Callout>{resp.note} Try enabling a relevant tool, or ask a question a tool can help with.</Callout>
          </Panel>
        )
      )}
    </Page>
  );
}
