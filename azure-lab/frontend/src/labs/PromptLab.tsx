import { useState } from "react";
import { api, PromptLabResp } from "../api";
import { Page, Panel, Callout, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

const TECHNIQUES = [
  { id: "zero", label: "Zero-shot", desc: "Just ask. No examples." },
  { id: "few", label: "Few-shot", desc: "Show a few labeled examples first." },
  { id: "cot", label: "Chain-of-thought", desc: "Ask it to reason step by step." },
];

export default function PromptLab() {
  const [technique, setTechnique] = useState("zero");
  const [task, setTask] = useState("The battery dies in an hour.");
  const [resp, setResp] = useState<PromptLabResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.promptLab({ technique, task })); }
    finally { setLoading(false); }
  }

  return (
    <Page
      title="Prompt Techniques"
      subtitle="Run the same task through zero-shot, few-shot, and chain-of-thought prompts on your real model and compare the outputs and their prompt shapes."
    >
      <NeedsConfig />
      <Panel title="Choose a technique">
        <div className="grid cols-3">
          {TECHNIQUES.map((t) => (
            <div
              key={t.id}
              className="answer-card"
              onClick={() => setTechnique(t.id)}
              style={{
                cursor: "pointer",
                borderColor: technique === t.id ? "var(--accent)" : "var(--border)",
                boxShadow: technique === t.id ? "0 0 0 1px var(--accent)" : "none",
              }}
            >
              <b>{t.label}</b>
              <div style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 4 }}>{t.desc}</div>
            </div>
          ))}
        </div>
        <label className="field" style={{ marginTop: 16 }}>Task / review text</label>
        <input type="text" value={task} onChange={(e) => setTask(e.target.value)} />
        <div style={{ marginTop: 12 }}>
          <RunButton onClick={run} loading={loading}>Run on model</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp?.prompt && (
        <div className="grid cols-2">
          <Panel title="Prompt sent to the model">
            <div className="mono">{resp.prompt}</div>
          </Panel>
          <Panel title="Model response">
            <div className="answer-card">{resp.choices?.[0]}</div>
            {resp.usage && (
              <div className="usage-row">
                <span>prompt <b>{resp.usage.prompt_tokens}</b></span>
                <span>completion <b>{resp.usage.completion_tokens}</b></span>
                <span>total <b>{resp.usage.total_tokens}</b></span>
              </div>
            )}
            <Callout>
              Few-shot steers format with examples; chain-of-thought trades tokens for accuracy on
              reasoning tasks. Zero-shot is cheapest when the task is simple.
            </Callout>
          </Panel>
        </div>
      )}
    </Page>
  );
}
