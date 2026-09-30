import { useState } from "react";
import { motion } from "framer-motion";
import { api, AgentResp } from "../api";
import { Page, Panel, Callout, Chip, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

const EXAMPLES = [
  "What is 24 * 7 + 12?",
  "What does error code E-402 mean, and what should I do?",
  "How much is the Pro plan per year?",
];

export default function AgentLab() {
  const [question, setQuestion] = useState(EXAMPLES[0]);
  const [resp, setResp] = useState<AgentResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.agent({ question })); }
    finally { setLoading(false); }
  }

  return (
    <Page
      title="Tool-calling Agent"
      subtitle="A real ReAct loop using Azure function calling. The model decides when to call calculator or kb_search, sees the result, and keeps going until it can answer."
    >
      <NeedsConfig />
      <Panel title="Ask the agent">
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <div className="row" style={{ marginTop: 12 }}>
          {EXAMPLES.map((ex) => (
            <button key={ex} className="btn ghost" style={{ fontSize: 12 }} onClick={() => setQuestion(ex)}>
              {ex.length > 34 ? ex.slice(0, 34) + "…" : ex}
            </button>
          ))}
        </div>
        <div style={{ marginTop: 12 }}>
          <RunButton onClick={run} loading={loading}>Run agent</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp && !resp.error && (
        <Panel title="Reasoning trace">
          <div className="row" style={{ marginBottom: 14 }}>
            <Chip tone="accent">{resp.iterations} tool call(s)</Chip>
            <Chip>max {resp.max_iters} iterations</Chip>
          </div>
          {resp.steps?.length === 0 && (
            <Callout>The model answered directly without calling any tool.</Callout>
          )}
          {resp.steps?.map((s, i) => (
            <motion.div
              key={i}
              className="step-card"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
            >
              <div className="lbl">Thought</div>
              <div className="thought">{s.thought}</div>
              <div className="lbl" style={{ marginTop: 8 }}>Action</div>
              <div className="action">{s.action}</div>
              <div className="lbl" style={{ marginTop: 8 }}>Observation</div>
              <div className="obs">{s.observation}</div>
            </motion.div>
          ))}
          <div className="answer-card" style={{ marginTop: 8 }}>
            <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 6 }}>FINAL ANSWER</div>
            {resp.final_answer}
          </div>
          <Callout>
            The model isn't doing math itself — it delegates to the calculator tool and trusts the
            observation. Same idea powers production agents that call real APIs.
          </Callout>
        </Panel>
      )}
    </Page>
  );
}
