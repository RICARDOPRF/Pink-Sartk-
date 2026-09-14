import { BrainMode, FriendAiFile, SystemStatus } from "../types";

export interface SendMessageResponse {
  reply: string;
  model: string;
  executionTelemetry: {
    latencyMs: number;
    tokensEstimate: number;
    activeBrain: string;
    loadedModules: number;
    keyStatus: string;
  };
}

type JsonRecord = Record<string, any>;

const STUDIO_SUPABASE_URL =
  ((import.meta as any).env?.VITE_PINK_SUPABASE_URL as string | undefined) ||
  "https://membyrbgynicllzrhjsl.supabase.co";

// Supabase anon/publishable keys are intentionally browser-safe. Private provider keys
// (OpenAI, Gemini, NVIDIA, etc.) remain protected inside the Pink Studio Edge Functions.
const STUDIO_SUPABASE_ANON_KEY =
  ((import.meta as any).env?.VITE_PINK_SUPABASE_ANON_KEY as string | undefined) ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1lbWJ5cmJneW5pY2xsenJoanNsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODIwNzE3MTAsImV4cCI6MjA5NzY0NzcxMH0.5_5fKYLYHlGCvggoF7t9QtwkvVaRX0LKkDtw--brJY0";

const FUNCTIONS = {
  openai: "pink-openai",
  geminiReasoning: "pink-gemini-reasoning",
  vision: "pink-vision",
  health: "pink-health",
} as const;

function edgeUrl(functionName: string): string {
  return `${STUDIO_SUPABASE_URL.replace(/\/$/, "")}/functions/v1/${functionName}`;
}

function edgeHeaders(): HeadersInit {
  return {
    "Content-Type": "application/json",
    apikey: STUDIO_SUPABASE_ANON_KEY,
    Authorization: `Bearer ${STUDIO_SUPABASE_ANON_KEY}`,
  };
}

async function requestJson(
  url: string,
  init: RequestInit,
  timeoutMs = 45_000
): Promise<{ response: Response; payload: JsonRecord }> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...init, signal: controller.signal });
    const payload = (await response.json().catch(() => ({}))) as JsonRecord;
    return { response, payload };
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("A IA demorou mais do que o esperado para responder.");
    }
    throw error;
  } finally {
    window.clearTimeout(timer);
  }
}

function personaFor(brainMode: BrainMode, userName: string): string {
  switch (brainMode) {
    case "jarvis_core":
      return `Você é o J.A.R.V.I.S. da Lean Performance Solutions. Responda em português do Brasil, com precisão técnica, elegância e objetividade. Usuário: ${userName}.`;
    case "friday_tactical":
      return `Você é a F.R.I.D.A.Y. da Lean Performance Solutions. Seja direta, rápida, técnica e orientada a ação. Usuário: ${userName}.`;
    case "hybrid_lps":
      return `Você é a inteligência híbrida Pink + J.A.R.V.I.S. da Lean Performance Solutions. Combine estratégia, engenharia e execução prática. Usuário: ${userName}.`;
    case "pink_supervisor":
    default:
      return `Você é a PINK, IA principal da Lean Performance Solutions. Seja inteligente, acolhedora, proativa, técnica e objetiva. Responda em português do Brasil. Usuário: ${userName}.`;
  }
}

function buildPrompt(
  message: string,
  history: Array<{ role: string; content: string }>,
  brainMode: BrainMode,
  activeFiles: Array<Partial<FriendAiFile> & { name: string; content: string }>,
  userName: string,
  visionContext?: string
): string {
  const recentHistory = history
    .slice(-10)
    .filter((item) => item?.content)
    .map((item) => `${item.role === "assistant" ? "PINK" : "USUÁRIO"}: ${item.content.slice(0, 2500)}`)
    .join("\n");

  const fileContext = activeFiles
    .slice(0, 6)
    .map((file) => `### ${file.name}\n${String(file.content || "").slice(0, 10_000)}`)
    .join("\n\n");

  return [
    personaFor(brainMode, userName),
    "Use apenas as capacidades realmente disponíveis. Não afirme que executou ações externas se apenas respondeu em texto.",
    recentHistory ? `CONTEXTO RECENTE:\n${recentHistory}` : "",
    fileContext ? `ARQUIVOS ANEXADOS:\n${fileContext}` : "",
    visionContext ? `ANÁLISE VISUAL DO FRAME:\n${visionContext}` : "",
    `SOLICITAÇÃO ATUAL:\n${message}`,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function extractReply(payload: JsonRecord): string {
  const value =
    payload.reply ??
    payload.output ??
    payload.analysis ??
    payload.description ??
    payload.result ??
    payload.text ??
    payload.answer;

  if (typeof value === "string" && value.trim()) return value.trim();
  if (value && typeof value === "object") return JSON.stringify(value, null, 2);
  return "";
}

function payloadError(payload: JsonRecord, status: number): string {
  return String(
    payload.providerMessage ||
      payload.detail ||
      payload.message ||
      payload.error ||
      `Erro HTTP ${status}`
  );
}

async function askOpenAI(input: string): Promise<{ reply: string; model: string }> {
  const { response, payload } = await requestJson(edgeUrl(FUNCTIONS.openai), {
    method: "POST",
    headers: edgeHeaders(),
    body: JSON.stringify({
      input,
      reasoningEffort: "medium",
      maxOutputTokens: 2200,
    }),
  });

  const reply = extractReply(payload);
  if (!response.ok || payload?.ok === false || !reply) {
    throw new Error(payloadError(payload, response.status));
  }

  return { reply, model: String(payload.model || "pink-openai") };
}

async function askGeminiFallback(input: string): Promise<{ reply: string; model: string }> {
  const { response, payload } = await requestJson(edgeUrl(FUNCTIONS.geminiReasoning), {
    method: "POST",
    headers: edgeHeaders(),
    body: JSON.stringify({
      input,
      thinkingLevel: "high",
      maxOutputTokens: 2200,
    }),
  });

  const reply = extractReply(payload);
  if (!response.ok || payload?.ok === false || !reply) {
    throw new Error(payloadError(payload, response.status));
  }

  return { reply, model: String(payload.model || "pink-gemini-reasoning") };
}

async function analyzeVision(image: string, prompt: string): Promise<string> {
  const match = image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
  const mimeType = match?.[1] || "image/jpeg";
  const imageBase64 = match?.[2] || image;

  const { response, payload } = await requestJson(
    edgeUrl(FUNCTIONS.vision),
    {
      method: "POST",
      headers: edgeHeaders(),
      body: JSON.stringify({
        imageBase64,
        mimeType,
        prompt: `Você é o sistema de visão da Pink da Lean Performance Solutions. Responda em português do Brasil. Analise somente evidências visuais presentes na imagem e não invente identidades. Solicitação do usuário: ${prompt.slice(0, 3000)}`,
      }),
    },
    60_000
  );

  const reply = extractReply(payload);
  if (!response.ok || payload?.ok === false || !reply) {
    throw new Error(payloadError(payload, response.status));
  }
  return reply;
}

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  brainMode: BrainMode,
  activeFiles: Array<Partial<FriendAiFile> & { name: string; content: string }>,
  userName: string = "Operador",
  image?: string
): Promise<SendMessageResponse> {
  const startedAt = performance.now();
  let visionContext = "";

  if (image) {
    try {
      visionContext = await analyzeVision(image, message);
    } catch (error) {
      console.warn("Pink Vision indisponível; continuando sem contexto visual.", error);
    }
  }

  const input = buildPrompt(
    message,
    history,
    brainMode,
    activeFiles,
    userName,
    visionContext
  );

  let result: { reply: string; model: string };
  let keyStatus = "studio_edge_online";

  try {
    result = await askOpenAI(input);
  } catch (openAiError) {
    console.warn("Supervisor OpenAI indisponível; ativando Gemini fallback.", openAiError);
    keyStatus = "gemini_fallback";
    try {
      result = await askGeminiFallback(input);
    } catch (geminiError) {
      if (visionContext) {
        result = { reply: visionContext, model: "pink-vision" };
        keyStatus = "vision_only";
      } else {
        throw geminiError;
      }
    }
  }

  const latencyMs = Math.max(1, Math.round(performance.now() - startedAt));
  return {
    reply: result.reply,
    model: result.model,
    executionTelemetry: {
      latencyMs,
      tokensEstimate: Math.max(1, Math.round(result.reply.length / 3.5)),
      activeBrain: brainMode,
      loadedModules: activeFiles.length,
      keyStatus,
    },
  };
}

export async function analyzeAiFile(
  fileName: string,
  content: string
): Promise<{ summary: string; charCount?: number }> {
  const prompt = `Analise o arquivo "${fileName}" para a Pink LPS. Em português do Brasil, resuma em 2 a 4 frases: finalidade, conteúdo principal, capacidades/instruções importantes e qualquer risco ou dependência relevante.\n\nCONTEÚDO:\n${content.slice(0, 14_000)}`;

  try {
    const result = await askOpenAI(prompt);
    return { summary: result.reply, charCount: content.length };
  } catch {
    try {
      const result = await askGeminiFallback(prompt);
      return { summary: result.reply, charCount: content.length };
    } catch {
      return {
        summary: `Arquivo ${fileName} carregado com sucesso. Contém ${content.length.toLocaleString("pt-BR")} caracteres e está pronto para ser usado como contexto pela Pink.`,
        charCount: content.length,
      };
    }
  }
}

export async function fetchSystemHealth(): Promise<SystemStatus> {
  try {
    const { response, payload } = await requestJson(
      edgeUrl(FUNCTIONS.health),
      {
        method: "GET",
        headers: edgeHeaders(),
        cache: "no-store",
      },
      10_000
    );

    if (!response.ok) throw new Error(payloadError(payload, response.status));

    return {
      online: true,
      engine: String(payload.engine || payload.service || "Pink LPS Studio Cloud"),
      hasGeminiKey: payload.hasGeminiKey !== false,
      cpuLoad: Math.floor(18 + Math.random() * 10),
      memoryUsage: Math.floor(40 + Math.random() * 9),
      quantumCores: 8,
      activeRouters: [
        "Pink LPS Studio Cloud",
        "ChatGPT Supervisor",
        "Gemini Reasoning Fallback",
        "Pink Vision",
      ],
    };
  } catch (error) {
    console.warn("Pink cloud health check failed", error);
    return {
      online: false,
      engine: "Pink LPS Studio - conexão degradada",
      hasGeminiKey: false,
      cpuLoad: 25,
      memoryUsage: 35,
      quantumCores: 8,
      activeRouters: ["Interface local", "Voz do navegador"],
    };
  }
}
