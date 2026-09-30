import { useState } from "react";
import { motion } from "framer-motion";
import { api, SelfConsistencyResp } from "../api";
import { Page, Panel, Callout, Chip, Bar, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

const EXAMPLES = [
  "A shirt costs $40 after a 20% discount. What was the original price?",
  "If a train travels 60 km in 45 minutes, what is its speed in km/h?",
  "I have 3 apples and buy 2 bags of 4 apples each. How many apples total?",
];

export default function SelfConsistencyLab() {
  const [question, setQuestion] = useState(EXAMPLES[0]);
  const [samples, setSamples] = useState(5);
  const [resp, setResp] = useState<SelfConsistencyResp | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  async function run() {
    setLoading(true);
    setOpen(null);
    try { setResp(await api.selfConsistency({ question, samples })); }
    finally { setLoading(false); }
  }

  const maxVotes = resp?.tally?.[0]?.votes ?? 1;

  return (
    <Page
      title="Self-Consistency"
      subtitle="Run chain-of-thought several times at higher temperature, then majority-vote the final answers. Trades tokens for accuracy on reasoning tasks."
    >
      <NeedsConfig />
      <Panel title="Reasoning question">
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <div className="row" style={{ marginTop: 12 }}>
          {EXAMPLES.map((ex, i) => (
            <button key={i} className="btn ghost" style={{ fontSize: 12 }} onClick={() => setQuestion(ex)}>
              example {i + 1}
            </button>
          ))}
        </div>
        <div className="row" style={{ marginTop: 12 }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label className="field">Samples: {samples}</label>
            <input type="range" min={2} max={8} step={1} value={samples}
              onChange={(e) => setSamples(+e.target.value)} />
          </div>
          <RunButton onClick={run} loading={loading}>Run {samples}×</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp && !resp.error && (
        <>
          <Panel title="Vote tally">
            <div className="row" style={{ marginBottom: 14 }}>
              <Chip tone="green">winner: {resp.winner}</Chip>
              <Chip>{resp.votes}/{resp.samples} votes</Chip>
              {resp.latency_ms != null && <Chip tone="amber">{resp.latency_ms} ms</Chip>}
            </div>
            {resp.tally?.map((t, i) => (
              <Bar key={i} value={t.votes} max={maxVotes} label={t.answer}
                color={i === 0 ? "var(--green)" : "var(--accent)"} />
            ))}
            <Callout>
              If all samples agree, the model is confident. Split votes signal an ambiguous or hard
              problem — majority voting picks the most frequent answer.
            </Callout>
          </Panel>

          <Panel title="Individual reasoning paths" hint="Click a run to expand its chain-of-thought.">
            {resp.runs?.map((r, i) => (
              <motion.div
                key={i}
                className="step-card"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setOpen(open === i ? null : i)}
                style={{ cursor: "pointer" }}
              >
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="lbl">Run {i + 1}</span>
                  <Chip tone={r.answer === resp.winner ? "green" : ""}>{r.answer}</Chip>
                </div>
                {open === i && <div className="mono" style={{ marginTop: 10 }}>{r.reasoning}</div>}
              </motion.div>
            ))}
          </Panel>
        </>
      )}
    </Page>
  );
}
