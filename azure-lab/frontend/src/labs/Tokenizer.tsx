import { useState } from "react";
import { api, TokenizeResp } from "../api";
import { Page, Panel, Callout, Chip, RunButton } from "../components/ui";

const MODELS = ["gpt-4o", "gpt-4o-mini", "gpt-4", "gpt-3.5-turbo", "text-embedding-3-small"];

export default function Tokenizer() {
  const [text, setText] = useState("Tokenization drives cost: 1,000 tokens ≈ 750 English words.");
  const [modelHint, setModelHint] = useState("gpt-4o");
  const [resp, setResp] = useState<TokenizeResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.tokenize({ text, model_hint: modelHint })); }
    finally { setLoading(false); }
  }

  return (
    <Page
      title="Tokenizer"
      subtitle="Real tiktoken encoding — the exact tokens your deployment bills for. No API key required for this one."
    >
      <Panel title="Encode text">
        <textarea value={text} onChange={(e) => setText(e.target.value)} />
        <div className="row" style={{ marginTop: 12 }}>
          <select style={{ maxWidth: 240 }} value={modelHint} onChange={(e) => setModelHint(e.target.value)}>
            {MODELS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
          <RunButton onClick={run} loading={loading}>Tokenize</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp?.tokens && (
        <>
          <Panel title="Tokens">
            <div className="row" style={{ marginBottom: 12 }}>
              <Chip tone="accent">encoding: {resp.encoding}</Chip>
              <Chip tone="green">{resp.token_count} tokens</Chip>
              <Chip>{resp.word_count} words</Chip>
              <Chip tone="amber">{resp.ratio_tokens_per_word} tokens/word</Chip>
            </div>
            <div>
              {resp.tokens.map((t, i) => (
                <span key={i} className="token subword" title={`id ${t.id}`}>
                  {t.text.replace(/ /g, "·").replace(/\n/g, "⏎")}
                </span>
              ))}
            </div>
          </Panel>
          <Panel title="Token IDs">
            <div className="mono">[{resp.tokens.map((t) => t.id).join(", ")}]</div>
            <Callout>
              These integer IDs are exactly what the model sees. Rare words split into more
              sub-word tokens — that's why unusual text costs more.
            </Callout>
          </Panel>
        </>
      )}
    </Page>
  );
}
