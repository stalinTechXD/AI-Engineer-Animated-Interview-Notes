// Typed client for the Azure AI Foundry labs backend (proxied at /api).

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`/api${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`/api${path}`);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

// ---- shared shapes ----
export interface ConfigStatus {
  configured: boolean;
  chat_ready: boolean;
  embed_ready: boolean;
  endpoint: string | null;
  api_version: string;
  chat_deployment: string | null;
  embed_deployment: string | null;
}

export interface Usage {
  prompt_tokens: number | null;
  completion_tokens: number | null;
  total_tokens: number | null;
}

/** Every model route may return an error/unconfigured envelope. */
export interface Envelope {
  configured: boolean;
  error?: string;
}

export interface ChatResp extends Envelope {
  choices?: string[];
  usage?: Usage;
  model?: string;
}

export interface Msg { role: string; content: string; }

export interface TokenizeResp extends Envelope {
  encoding?: string;
  token_count?: number;
  word_count?: number;
  ratio_tokens_per_word?: number;
  tokens?: { text: string; id: number }[];
}

export interface EmbedResp extends Envelope {
  query?: string;
  dims?: number;
  results?: { text: string; cosine: number }[];
}

export interface SampleResp extends Envelope {
  choices?: string[];
  usage?: Usage;
  model?: string;
  temperature?: number;
  top_p?: number;
}

export interface PromptLabResp extends Envelope {
  prompt?: string;
  choices?: string[];
  usage?: Usage;
}

export interface RagResp extends Envelope {
  query?: string;
  retrieved?: { doc: string; score: number }[];
  answer?: string;
  usage?: Usage;
}

export interface AgentStep { thought: string; action: string; observation: string; }
export interface AgentResp extends Envelope {
  question?: string;
  steps?: AgentStep[];
  iterations?: number;
  max_iters?: number;
  final_answer?: string;
}

export interface JudgeResp extends Envelope {
  question?: string;
  order_ab?: string;
  order_ba?: string;
  note?: string;
}

export interface StructuredResp extends Envelope {
  raw?: string;
  parsed?: Record<string, unknown> | null;
  valid_json?: boolean;
  usage?: Usage;
}

export interface VisionResp extends Envelope {
  answer?: string;
  usage?: Usage;
}

export interface GuardrailsResp extends Envelope {
  user_input?: string;
  undefended?: string;
  defended?: string;
  note?: string;
}

export interface GroundedCompareResp extends Envelope {
  query?: string;
  retrieved?: { doc: string; score: number }[];
  ungrounded?: string;
  grounded?: string;
}

export interface SelfConsistencyResp extends Envelope {
  runs?: { reasoning: string; answer: string }[];
  tally?: { answer: string; votes: number }[];
  winner?: string;
  votes?: number;
  samples?: number;
  latency_ms?: number;
}

export interface BenchmarkResp extends Envelope {
  model?: string;
  prices_per_1m?: { input: number; output: number };
  runs?: {
    label: string;
    max_tokens: number;
    latency_ms: number;
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
    cost_usd: number;
    ms_per_token: number | null;
  }[];
  total_cost_usd?: number;
  avg_latency_ms?: number;
  projected_cost_1k_calls?: number;
}

export interface ChunkingResp extends Envelope {
  total_tokens?: number;
  chunk_size?: number;
  overlap?: number;
  num_chunks?: number;
  chunks?: { index: number; text: string; token_count: number; start_token: number }[];
  query?: string;
  retrieval?: { index: number; score: number }[] | null;
}

export interface FunctionCallResp extends Envelope {
  tools_offered?: string[];
  called_tool?: boolean;
  direct_answer?: string;
  tool_name?: string;
  raw_arguments?: string;
  parsed_arguments?: Record<string, unknown>;
  observation?: string;
  final_answer?: string;
  note?: string;
}

export const api = {
  config: () => get<ConfigStatus>("/config"),
  chat: (body: { messages: Msg[]; temperature: number; top_p: number; max_tokens: number }) =>
    post<ChatResp>("/chat", body),
  tokenize: (body: { text: string; model_hint: string }) => post<TokenizeResp>("/tokenize", body),
  embed: (body: { query: string; items: string[] }) => post<EmbedResp>("/embed", body),
  sample: (body: { prompt: string; temperature: number; top_p: number; n: number }) =>
    post<SampleResp>("/sample", body),
  promptLab: (body: { technique: string; task: string }) => post<PromptLabResp>("/prompt-lab", body),
  rag: (body: { query: string }) => post<RagResp>("/rag", body),
  agent: (body: { question: string }) => post<AgentResp>("/agent", body),
  judge: (body: { question: string; answer_a: string; answer_b: string }) =>
    post<JudgeResp>("/judge", body),
  structured: (body: { task: string }) => post<StructuredResp>("/structured", body),
  vision: (body: { question: string; image_url: string }) => post<VisionResp>("/vision", body),
  guardrails: (body: { user_input: string }) => post<GuardrailsResp>("/guardrails", body),
  groundedCompare: (body: { query: string }) => post<GroundedCompareResp>("/grounded-compare", body),
  selfConsistency: (body: { question: string; samples: number }) =>
    post<SelfConsistencyResp>("/self-consistency", body),
  benchmark: (body: { prompt: string; sizes: number[] }) => post<BenchmarkResp>("/benchmark", body),
  chunking: (body: { text: string; chunk_size: number; overlap: number; query: string }) =>
    post<ChunkingResp>("/chunking", body),
  functionCall: (body: { user_message: string; enabled: string[] }) =>
    post<FunctionCallResp>("/function-call", body),
  /** Stream tokens from /api/chat-stream, invoking onToken for each chunk. */
  chatStream: async (
    body: { prompt: string; temperature: number; max_tokens: number },
    onToken: (t: string) => void,
  ) => {
    const res = await fetch("/api/chat-stream", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!res.ok || !res.body) throw new Error(`${res.status} ${res.statusText}`);
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      onToken(decoder.decode(value, { stream: true }));
    }
  },
};

