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

export async function sendChatMessage(
  message: string,
  history: Array<{ role: string; content: string }>,
  brainMode: BrainMode,
  activeFiles: Array<Partial<FriendAiFile> & { name: string; content: string }>,
  userName: string = "Operador",
  image?: string
): Promise<SendMessageResponse> {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message,
      history,
      brainMode,
      activeFiles,
      userName,
      image,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Erro HTTP ${res.status}`);
  }

  return await res.json();
}

export async function analyzeAiFile(fileName: string, content: string): Promise<{ summary: string; charCount?: number }> {
  const res = await fetch("/api/analyze-file", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fileName, content }),
  });

  if (!res.ok) {
    throw new Error("Erro ao analisar arquivo");
  }

  return await res.json();
}

export async function fetchSystemHealth(): Promise<SystemStatus> {
  try {
    const res = await fetch("/api/health");
    if (!res.ok) throw new Error("Health check failed");
    const data = await res.json();
    return {
      online: true,
      engine: data.engine || "Pink-JARVIS-LPS-v12.5",
      hasGeminiKey: Boolean(data.hasGeminiKey),
      cpuLoad: Math.floor(18 + Math.random() * 12),
      memoryUsage: Math.floor(42 + Math.random() * 8),
      quantumCores: 8,
      activeRouters: ["LPS Context Core", "ChatGPT Bridge", "Gemini 3.8", "Memory Supabase"],
    };
  } catch {
    return {
      online: false,
      engine: "Pink-JARVIS-Offline",
      hasGeminiKey: false,
      cpuLoad: 25,
      memoryUsage: 35,
      quantumCores: 8,
      activeRouters: ["Local Core Router"],
    };
  }
}
