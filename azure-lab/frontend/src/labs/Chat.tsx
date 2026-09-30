import { useState } from "react";
import { api, Msg, Usage } from "../api";
import { Page, Panel, Callout, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "system", content: "You are a concise, helpful AI engineering tutor." },
  ]);
  const [input, setInput] = useState("Explain self-attention like I'm preparing for an interview.");
  const [temperature, setTemperature] = useState(0.7);
  const [topP, setTopP] = useState(1.0);
  const [maxTokens, setMaxTokens] = useState(400);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState<Usage | null>(null);
  const [model, setModel] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const text = input.trim();
    if (!text) return;
    const next = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    setError(null);
    try {
      const r = await api.chat({ messages: next, temperature, top_p: topP, max_tokens: maxTokens });
      if (r.error) { setError(r.error); }
      else if (r.choices?.[0] != null) {
        setMessages([...next, { role: "assistant", content: r.choices[0] }]);
        setUsage(r.usage ?? null);
        setModel(r.model ?? null);
      }
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Page
      title="Chat Playground"
      subtitle="Have a real multi-turn conversation with your deployment. Watch token usage and how temperature changes tone."
    >
      <NeedsConfig />
      <div className="grid cols-2">
        <Panel title="Conversation">
          <div style={{ maxHeight: 420, overflowY: "auto", paddingRight: 6 }}>
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.role}`}>
                <div className="role">{m.role}</div>
                {m.content}
              </div>
            ))}
            {loading && <div className="bubble assistant"><div className="role">assistant</div><span className="spinner" /></div>}
          </div>
          {error && <Callout tone="warn">{error}</Callout>}
          <div style={{ marginTop: 12 }}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) send(); }}
              placeholder="Type a message… (Ctrl+Enter to send)"
            />
            <div className="row" style={{ marginTop: 10, justifyContent: "space-between" }}>
              <button className="btn ghost" onClick={() => { setMessages(messages.slice(0, 1)); setUsage(null); }}>
                Reset
              </button>
              <RunButton onClick={send} loading={loading}>Send</RunButton>
            </div>
          </div>
        </Panel>

        <Panel title="Decoding controls" hint="These map straight to the Azure chat completion request.">
          <label className="field">Temperature: {temperature.toFixed(2)}</label>
          <input type="range" min={0} max={2} step={0.05} value={temperature}
            onChange={(e) => setTemperature(+e.target.value)} />
          <label className="field" style={{ marginTop: 14 }}>Top-p: {topP.toFixed(2)}</label>
          <input type="range" min={0} max={1} step={0.05} value={topP}
            onChange={(e) => setTopP(+e.target.value)} />
          <label className="field" style={{ marginTop: 14 }}>Max tokens: {maxTokens}</label>
          <input type="range" min={50} max={1200} step={50} value={maxTokens}
            onChange={(e) => setMaxTokens(+e.target.value)} />

          {usage && (
            <div className="usage-row">
              <span>prompt <b>{usage.prompt_tokens}</b></span>
              <span>completion <b>{usage.completion_tokens}</b></span>
              <span>total <b>{usage.total_tokens}</b></span>
              {model && <span>model <b>{model}</b></span>}
            </div>
          )}
          <Callout>
            Low temperature ≈ deterministic and factual. High temperature ≈ creative but more
            hallucination-prone. Top-p narrows the candidate pool instead of flattening it.
          </Callout>
        </Panel>
      </div>
    </Page>
  );
}
