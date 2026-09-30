import { useState } from "react";
import { api, ChunkingResp } from "../api";
import { Page, Panel, Callout, Bar, RunButton, Chip } from "../components/ui";
import NeedsConfig from "../components/NeedsConfig";

const DEFAULT_TEXT =
  "Retrieval-augmented generation grounds a language model in external documents. " +
  "The corpus is split into chunks, each chunk is embedded into a vector, and the " +
  "vectors are stored in an index. At query time the question is embedded and the " +
  "nearest chunks are retrieved by cosine similarity. Chunk size matters: chunks that " +
  "are too large dilute the signal and waste tokens, while chunks that are too small " +
  "lose surrounding context. Overlap between adjacent chunks preserves sentences that " +
  "would otherwise be cut at a boundary, improving recall at the cost of some redundancy.";

export default function ChunkingLab() {
  const [text, setText] = useState(DEFAULT_TEXT);
  const [chunkSize, setChunkSize] = useState(40);
  const [overlap, setOverlap] = useState(10);
  const [query, setQuery] = useState("why does chunk size matter?");
  const [resp, setResp] = useState<ChunkingResp | null>(null);
  const [loading, setLoading] = useState(false);

  async function run() {
    setLoading(true);
    try { setResp(await api.chunking({ text, chunk_size: chunkSize, overlap, query })); }
    finally { setLoading(false); }
  }

  const scoreOf = (i: number) => resp?.retrieval?.find((r) => r.index === i)?.score;
  const topIndex = resp?.retrieval?.[0]?.index;
  const bestScore = resp?.retrieval?.[0]?.score ?? 1;

  return (
    <Page
      title="Chunking Playground"
      subtitle="How you split documents decides what RAG can retrieve. Adjust chunk size and overlap (in tokens) and watch the boundaries — and the best-matching chunk for your query — change."
    >
      <NeedsConfig embed />
      <Panel title="Document & query">
        <textarea rows={5} value={text} onChange={(e) => setText(e.target.value)} />
        <div style={{ marginTop: 12 }}>
          <label style={{ fontSize: 13, color: "var(--muted)" }}>Query</label>
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="grid cols-2" style={{ marginTop: 12 }}>
          <div>
            <label style={{ fontSize: 13, color: "var(--muted)" }}>
              Chunk size: <b>{chunkSize}</b> tokens
            </label>
            <input type="range" min={8} max={120} value={chunkSize}
              onChange={(e) => setChunkSize(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
          <div>
            <label style={{ fontSize: 13, color: "var(--muted)" }}>
              Overlap: <b>{overlap}</b> tokens
            </label>
            <input type="range" min={0} max={Math.max(0, chunkSize - 1)} value={overlap}
              onChange={(e) => setOverlap(Number(e.target.value))} style={{ width: "100%" }} />
          </div>
        </div>
        <div style={{ marginTop: 12 }}>
          <RunButton onClick={run} loading={loading}>Chunk &amp; retrieve</RunButton>
        </div>
      </Panel>

      {resp?.error && <Callout tone="warn">{resp.error}</Callout>}

      {resp?.chunks && (
        <>
          <Panel title="Summary">
            <div className="usage-row">
              <span>total <b>{resp.total_tokens}</b> tokens</span>
              <span>chunk size <b>{resp.chunk_size}</b></span>
              <span>overlap <b>{resp.overlap}</b></span>
              <span>produced <b>{resp.num_chunks}</b> chunks</span>
            </div>
            {!resp.retrieval && (
              <Callout tone="warn">
                Embeddings not configured — chunks are shown without retrieval scores. Add an
                embeddings deployment to rank them against the query.
              </Callout>
            )}
          </Panel>

          <div className="grid cols-2">
            <Panel title="Chunks (in document order)">
              {resp.chunks.map((c) => {
                const s = scoreOf(c.index);
                return (
                  <div key={c.index} className={`chunk-card ${c.index === topIndex ? "top" : ""}`}>
                    <div className="chunk-head">
                      <span>
                        chunk #{c.index} {c.index === topIndex && <Chip tone="green">best match</Chip>}
                      </span>
                      <span>{c.token_count} tok · @{c.start_token}
                        {s !== undefined ? ` · score ${s.toFixed(3)}` : ""}</span>
                    </div>
                    {c.text}
                  </div>
                );
              })}
            </Panel>
            <Panel title="Retrieval ranking">
              {resp.retrieval ? (
                resp.retrieval.map((r) => (
                  <Bar key={r.index} value={r.score} max={bestScore} label={`chunk #${r.index}`}
                    color={r.index === topIndex ? "var(--green)" : "var(--accent)"} />
                ))
              ) : (
                <p className="hint">Configure embeddings to see similarity ranking.</p>
              )}
              <Callout>
                Bigger chunks = fewer, broader vectors (cheaper, less precise). Smaller chunks =
                more, sharper vectors (precise, but may lose context). Overlap rescues sentences cut
                at a boundary. Typical production values: 200–500 tokens with 10–20% overlap.
              </Callout>
            </Panel>
          </div>
        </>
      )}
    </Page>
  );
}
