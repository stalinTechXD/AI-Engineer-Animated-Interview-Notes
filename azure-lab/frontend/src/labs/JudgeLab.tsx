import { useState } from "react";
import { api, JudgeResp } from "../api";
import { Page, Panel, Callout, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

export default function JudgeLab() {
  const [question, setQuestion] = useState("What is the capital of France?");
  const [answerA, setAnswerA] = useState("Paris, the capital and largest city of France.");
  const [answerB, setAnswerB] = useState("It's Paris.");
  const [resp, setResp] = useState<JudgeResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.judge({ question, answer_a: answerA, answer_b: answerB })); }
    finally { setLoading(false); }
  }

  return (
    <Page
      title="LLM-as-Judge"
      subtitle="Use the model to score two answers — then swap their order and re-run. If the verdict flips, the judge has position bias, a real evaluation pitfall."
    >
      <NeedsConfig />
      <Panel title="Question and two answers">
        <label className="field">Question</label>
        <input type="text" value={question} onChange={(e) => setQuestion(e.target.value)} />
        <div className="grid cols-2" style={{ marginTop: 12 }}>
          <div>
            <label className="field">Answer A</label>
            <textarea value={answerA} onChange={(e) => setAnswerA(e.target.value)} />
          </div>
          <div>
            <label className="field">Answer B</label>
            <textarea value={answerB} onChange={(e) => setAnswerB(e.target.value)} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <RunButton onClick={run} loading={loading}>Judge (both orders)</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp && !resp.error && (
        <>
          <div className="grid cols-2">
            <Panel title="Order A → B">
              <div className="answer-card">{resp.order_ab}</div>
            </Panel>
            <Panel title="Order B → A (swapped)">
              <div className="answer-card">{resp.order_ba}</div>
            </Panel>
          </div>
          <Panel title="Interpretation">
            <Callout tone="warn">{resp.note}</Callout>
          </Panel>
        </>
      )}
    </Page>
  );
}
