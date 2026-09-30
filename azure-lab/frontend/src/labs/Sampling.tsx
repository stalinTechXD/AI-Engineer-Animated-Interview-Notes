import { useState } from "react";
import { api, SampleResp } from "../api";
import { Page, Panel, Callout, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

export default function Sampling() {
  const [prompt, setPrompt] = useState("Write a 6-word tagline for a coffee shop.");
  const [temperature, setTemperature] = useState(0.9);
  const [topP, setTopP] = useState(1.0);
  const [n, setN] = useState(4);
  const [resp, setResp] = useState<SampleResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.sample({ prompt, temperature, top_p: topP, n })); }
    finally { setLoading(false); }
  }

  return (
    <Page
      title="Sampling & Temperature"
      subtitle="Same prompt, multiple completions. Crank temperature up and watch the outputs diverge; set it to 0 and they collapse to (nearly) one answer."
    >
      <NeedsConfig />
      <Panel title="Prompt">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="grid cols-3" style={{ marginTop: 12 }}>
          <div>
            <label className="field">Temperature: {temperature.toFixed(2)}</label>
            <input type="range" min={0} max={2} step={0.05} value={temperature}
              onChange={(e) => setTemperature(+e.target.value)} />
          </div>
          <div>
            <label className="field">Top-p: {topP.toFixed(2)}</label>
            <input type="range" min={0} max={1} step={0.05} value={topP}
              onChange={(e) => setTopP(+e.target.value)} />
          </div>
          <div>
            <label className="field">Completions (n): {n}</label>
            <input type="range" min={1} max={6} step={1} value={n}
              onChange={(e) => setN(+e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <RunButton onClick={run} loading={loading}>Generate {n}</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp?.choices && (
        <Panel title={`${resp.choices.length} completions · temp ${resp.temperature} · top-p ${resp.top_p}`}>
          <div className="grid cols-2">
            {resp.choices.map((c, i) => (
              <div key={i} className="answer-card">
                <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 6 }}>#{i + 1}</div>
                {c}
              </div>
            ))}
          </div>
          <Callout>
            High diversity across completions = high effective temperature. If they're all identical,
            the distribution is too sharp (low temp / low top-p) for this task.
          </Callout>
        </Panel>
      )}
    </Page>
  );
}
