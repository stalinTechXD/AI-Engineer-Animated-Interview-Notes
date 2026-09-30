import { useState } from "react";
import { api, VisionResp } from "../api";
import { Page, Panel, Callout, RunButton } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

const SAMPLES = [
  "https://picsum.photos/id/237/512/384",
  "https://picsum.photos/id/1080/512/384",
  "https://picsum.photos/id/431/512/384",
];

export default function VisionLab() {
  const [question, setQuestion] = useState("Describe this image in detail. What stands out?");
  const [imageUrl, setImageUrl] = useState(SAMPLES[0]);
  const [resp, setResp] = useState<VisionResp | null>(null);
  const [loading, setLoading] = useState(false);

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setImageUrl(String(reader.result));
    reader.readAsDataURL(f);
  }

  async function run() {
    setLoading(true);
    try { setResp(await api.vision({ question, image_url: imageUrl })); }
    finally { setLoading(false); }
  }

  return (
    <Page
      title="Vision (Multimodal)"
      subtitle="gpt-4o accepts images. Paste an image URL or upload a file, ask a question, and the model reasons over pixels + text together."
    >
      <NeedsConfig />
      <div className="grid cols-2">
        <Panel title="Image">
          <label className="field">Image URL or upload</label>
          <input type="text" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} />
          <div className="row" style={{ marginTop: 10 }}>
            <input type="file" accept="image/*" onChange={onFile} />
            {SAMPLES.map((s, i) => (
              <button key={i} className="btn ghost" style={{ fontSize: 12 }} onClick={() => setImageUrl(s)}>
                sample {i + 1}
              </button>
            ))}
          </div>
          {imageUrl && (
            <div style={{ marginTop: 12 }}>
              <img src={imageUrl} alt="input" style={{ maxWidth: "100%", borderRadius: 12, border: "1px solid var(--border)" }} />
            </div>
          )}
        </Panel>
        <Panel title="Ask about it">
          <label className="field">Question</label>
          <textarea value={question} onChange={(e) => setQuestion(e.target.value)} />
          <div style={{ marginTop: 12 }}>
            <RunButton onClick={run} loading={loading}>Analyze image</RunButton>
          </div>
          {resp?.error && <Callout tone="warn">{resp.error}</Callout>}
          {resp?.answer && (
            <>
              <div className="answer-card" style={{ marginTop: 12 }}>{resp.answer}</div>
              {resp.usage && (
                <div className="usage-row">
                  <span>prompt <b>{resp.usage.prompt_tokens}</b></span>
                  <span>completion <b>{resp.usage.completion_tokens}</b></span>
                  <span>total <b>{resp.usage.total_tokens}</b></span>
                </div>
              )}
            </>
          )}
          <Callout>
            Images cost tokens too — larger/detailed images use more. Great for OCR, chart reading,
            UI screenshots, and describing photos. Tip: the backend downloads URL images and inlines
            them as base64, so hosts that block hotlinking (e.g. Wikipedia) may fail — upload a file
            instead for guaranteed results.
          </Callout>
        </Panel>
      </div>
    </Page>
  );
}
