import { createContext, useContext, useEffect, useState } from "react";
import { NavLink, Route, Routes } from "react-router-dom";
import { api, ConfigStatus } from "./api";
import Setup from "./labs/Setup";
import Chat from "./labs/Chat";
import Tokenizer from "./labs/Tokenizer";
import Embeddings from "./labs/Embeddings";
import Sampling from "./labs/Sampling";
import PromptLab from "./labs/PromptLab";
import RagLab from "./labs/RagLab";
import AgentLab from "./labs/AgentLab";
import JudgeLab from "./labs/JudgeLab";
import Streaming from "./labs/Streaming";
import StructuredLab from "./labs/StructuredLab";
import VisionLab from "./labs/VisionLab";
import GuardrailsLab from "./labs/GuardrailsLab";
import GroundedLab from "./labs/GroundedLab";
import SelfConsistencyLab from "./labs/SelfConsistencyLab";
import CostLab from "./labs/CostLab";
import ChunkingLab from "./labs/ChunkingLab";
import FunctionCallLab from "./labs/FunctionCallLab";

interface ConfigCtx { cfg: ConfigStatus | null; refresh: () => void; }
const Ctx = createContext<ConfigCtx>({ cfg: null, refresh: () => {} });
export const useConfig = () => useContext(Ctx);

const NAV = [
  {
    group: "Start here",
    items: [{ to: "/", label: "Setup & Status", icon: "⚙️" }],
  },
  {
    group: "Core model calls",
    items: [
      { to: "/chat", label: "Chat Playground", icon: "💬" },
      { to: "/streaming", label: "Streaming", icon: "🌊" },
      { to: "/tokenizer", label: "Tokenizer", icon: "🔤" },
      { to: "/embeddings", label: "Embeddings", icon: "🧭" },
      { to: "/sampling", label: "Sampling & Temp", icon: "🎲" },
    ],
  },
  {
    group: "Applied patterns",
    items: [
      { to: "/prompt-lab", label: "Prompt Techniques", icon: "🧪" },
      { to: "/structured", label: "Structured Output", icon: "🧱" },
      { to: "/vision", label: "Vision (Multimodal)", icon: "👁️" },
      { to: "/chunking", label: "Chunking Playground", icon: "✂️" },
      { to: "/rag", label: "RAG (grounded)", icon: "📚" },
      { to: "/grounded", label: "Grounded vs Not", icon: "🎯" },
      { to: "/function-call", label: "Function Calling", icon: "🔧" },
      { to: "/agent", label: "Tool-calling Agent", icon: "🤖" },
    ],
  },
  {
    group: "Reliability & eval",
    items: [
      { to: "/self-consistency", label: "Self-Consistency", icon: "🗳️" },
      { to: "/guardrails", label: "Guardrails & Injection", icon: "🛡️" },
      { to: "/judge", label: "LLM-as-Judge", icon: "⚖️" },
      { to: "/cost", label: "Cost & Latency", icon: "💰" },
    ],
  },
];

export default function App() {
  const [cfg, setCfg] = useState<ConfigStatus | null>(null);

  const refresh = () => {
    api.config().then(setCfg).catch(() => setCfg(null));
  };
  useEffect(refresh, []);

  return (
    <Ctx.Provider value={{ cfg, refresh }}>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <div className="dot" />
            <div>
              <h1>Azure AI Foundry Labs</h1>
              <span>real models · hands-on</span>
            </div>
          </div>

          <div className="status-pill">
            <span className={`led ${cfg ? (cfg.chat_ready ? "on" : "off") : ""}`} />
            {cfg ? (cfg.chat_ready ? "Chat connected" : "Chat not configured") : "checking…"}
          </div>
          <div className="status-pill">
            <span className={`led ${cfg ? (cfg.embed_ready ? "on" : "off") : ""}`} />
            {cfg ? (cfg.embed_ready ? "Embeddings connected" : "Embeddings not configured") : "checking…"}
          </div>

          {NAV.map((g) => (
            <div key={g.group}>
              <div className="nav-group-label">{g.group}</div>
              {g.items.map((it) => (
                <NavLink
                  key={it.to}
                  to={it.to}
                  end={it.to === "/"}
                  className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}
                >
                  <span className="ico">{it.icon}</span>
                  {it.label}
                </NavLink>
              ))}
            </div>
          ))}
        </aside>

        <main className="content">
          <Routes>
            <Route path="/" element={<Setup />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/streaming" element={<Streaming />} />
            <Route path="/tokenizer" element={<Tokenizer />} />
            <Route path="/embeddings" element={<Embeddings />} />
            <Route path="/sampling" element={<Sampling />} />
            <Route path="/prompt-lab" element={<PromptLab />} />
            <Route path="/structured" element={<StructuredLab />} />
            <Route path="/vision" element={<VisionLab />} />
            <Route path="/chunking" element={<ChunkingLab />} />
            <Route path="/rag" element={<RagLab />} />
            <Route path="/grounded" element={<GroundedLab />} />
            <Route path="/function-call" element={<FunctionCallLab />} />
            <Route path="/agent" element={<AgentLab />} />
            <Route path="/self-consistency" element={<SelfConsistencyLab />} />
            <Route path="/guardrails" element={<GuardrailsLab />} />
            <Route path="/judge" element={<JudgeLab />} />
            <Route path="/cost" element={<CostLab />} />
          </Routes>
        </main>
      </div>
    </Ctx.Provider>
  );
}
