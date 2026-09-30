import { Link } from "react-router-dom";
import { useConfig } from "../App";

/**
 * Renders a warning banner when the required deployment isn't configured.
 * Returns null when ready, so labs can do: `<NeedsConfig embed /> ` at the top.
 */
export default function NeedsConfig({ embed = false }: { embed?: boolean }) {
  const { cfg } = useConfig();
  if (!cfg) return null;
  const ready = embed ? cfg.embed_ready : cfg.chat_ready;
  if (ready) return null;
  return (
    <div className="setup-banner">
      <b>Not configured.</b> This lab needs a live {embed ? "embeddings" : "chat"} deployment.{" "}
      Add your Azure AI Foundry credentials on the{" "}
      <Link to="/" style={{ color: "var(--accent)" }}>Setup &amp; Status</Link> page, then restart the backend.
    </div>
  );
}
