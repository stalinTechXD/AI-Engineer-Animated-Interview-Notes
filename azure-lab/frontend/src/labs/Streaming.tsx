import { useRef, useState } from "react";
import { api } from "../api";
import { Page, Panel, Callout, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

export default function Streaming() {
  const [prompt, setPrompt] = useState("Explain how transformer attention works, step by step.");
  const [temperature, setTemperature] = useState(0.7);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [ttft, setTtft] = useState<number | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  async function run() {
    setOutput("");
    setError(null);
    setTtft(null);
    setTotal(null);
    setLoading(true);
    const start = performance.now();
    let first = true;
    try {
      await api.chatStream({ prompt, temperature, max_tokens: 500 }, (chunk) => {
        if (first) { setTtft(Math.round(performance.now() - start)); first = false; }
        setOutput((o) => o + chunk);
        requestAnimationFrame(() => { if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight; });
      });
      setTotal(Math.round(performance.now() - start));
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page
      title="Streaming"
      subtitle="Tokens arrive one at a time with stream=True. Watch time-to-first-token (TTFT) vs total time — the key latency metric for chat UX."
    >
      <NeedsConfig />
      <Panel title="Prompt">
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="field">Temperature: {temperature.toFixed(2)}</label>
            <input type="range" min={0} max={2} step={0.05} value={temperature}
              onChange={(e) => setTemperature(+e.target.value)} />
          </div>
          <RunButton onClick={run} loading={loading}>Stream</RunButton>
        </div>
      </Panel>

      {error && <Callout tone="warn">{error}</Callout>}

      <Panel title="Live output">
        <div ref={boxRef} className="answer-card" style={{ minHeight: 160, maxHeight: 360, overflowY: "auto" }}>
          {output || <span style={{ color: "var(--muted)" }}>Press Stream to watch tokens flow in…</span>}
          {loading && <span className="spinner" style={{ marginLeft: 6 }} />}
        </div>
        <div className="usage-row">
          <span>TTFT <b>{ttft != null ? `${ttft} ms` : "—"}</b></span>
          <span>total <b>{total != null ? `${total} ms` : "—"}</b></span>
          <span>chars <b>{output.length}</b></span>
        </div>
        <Callout>
          Streaming doesn't make the model faster — it improves perceived latency by showing the
          first token quickly instead of waiting for the whole response.
        </Callout>
      </Panel>
    </Page>
  );
}
