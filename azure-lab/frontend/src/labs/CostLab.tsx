import { useState } from "react";
import { api, BenchmarkResp } from "../api";
import { Page, Panel, Callout, Bar, RunButton, Chip } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

export default function CostLab() {
  const [prompt, setPrompt] = useState("Explain what a vector embedding is.");
  const [resp, setResp] = useState<BenchmarkResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.benchmark({ prompt, sizes: [32, 128, 384] })); }
    finally { setLoading(false); }
  }

  const maxLatency = Math.max(1, ...(resp?.runs?.map((r) => r.latency_ms) ?? [1]));
  const maxCost = Math.max(1e-6, ...(resp?.runs?.map((r) => r.cost_usd) ?? [1e-6]));

  return (
    <Page
      title="Cost & Latency Dashboard"
      subtitle="The two numbers that decide if an LLM feature ships: dollars and milliseconds. This runs the same prompt at three output caps and measures real token usage, latency, and cost."
    >
      <NeedsConfig />
      <Panel title="Benchmark prompt">
        <textarea rows={2} value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div style={{ marginTop: 12 }}>
          <RunButton onClick={run} loading={loading}>Run benchmark (3 calls)</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp?.runs && (
        <>
          <div className="grid cols-3" style={{ marginTop: 4 }}>
            <Panel title="Total cost">
              <div className="answer-card" style={{ fontSize: 22, textAlign: "center" }}>
                ${resp.total_cost_usd?.toFixed(6)}
              </div>
              <div style={{ textAlign: "center", marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                across 3 calls
              </div>
            </Panel>
            <Panel title="Avg latency">
              <div className="answer-card" style={{ fontSize: 22, textAlign: "center" }}>
                {resp.avg_latency_ms} ms
              </div>
              <div style={{ textAlign: "center", marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                per call
              </div>
            </Panel>
            <Panel title="Projected @ 1k calls">
              <div className="answer-card" style={{ fontSize: 22, textAlign: "center" }}>
                ${resp.projected_cost_1k_calls?.toFixed(2)}
              </div>
              <div style={{ textAlign: "center", marginTop: 6, color: "var(--muted)", fontSize: 12 }}>
                avg call × 1,000
              </div>
            </Panel>
          </div>

          <div className="grid cols-2">
            <Panel title="Latency by output size">
              {resp.runs.map((r) => (
                <Bar key={r.label} value={r.latency_ms} max={maxLatency} label={r.label}
                  color="var(--accent)" />
              ))}
              <Callout>
                Latency scales with <b>output</b> tokens (they are generated one at a time), not
                input. Cap <code className="inline">max_tokens</code> to keep responses snappy.
              </Callout>
            </Panel>
            <Panel title="Cost by output size">
              {resp.runs.map((r) => (
                <Bar key={r.label} value={r.cost_usd} max={maxCost} label={r.label}
                  color="var(--green)" />
              ))}
              <Callout>
                Output tokens cost {resp.prices_per_1m ? (resp.prices_per_1m.output / resp.prices_per_1m.input).toFixed(0) : "4"}×
                more than input. Prices shown: ${resp.prices_per_1m?.input}/1M in, $
                {resp.prices_per_1m?.output}/1M out ({resp.model}).
              </Callout>
            </Panel>
          </div>

          <Panel title="Per-call breakdown">
            <table className="kv-table">
              <thead>
                <tr>
                  <th>Run</th><th>Latency</th><th>Prompt tok</th><th>Completion tok</th>
                  <th>ms/token</th><th>Cost</th>
                </tr>
              </thead>
              <tbody>
                {resp.runs.map((r) => (
                  <tr key={r.label}>
                    <td><Chip>{r.label}</Chip></td>
                    <td>{r.latency_ms} ms</td>
                    <td>{r.prompt_tokens}</td>
                    <td>{r.completion_tokens}</td>
                    <td>{r.ms_per_token ?? "—"}</td>
                    <td>${r.cost_usd.toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </>
      )}
    </Page>
  );
}
