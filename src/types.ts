export type BrainMode = "pink_supervisor" | "jarvis_core" | "friday_tactical" | "hybrid_lps";

export type AssistantState = "idle" | "listening" | "thinking" | "speaking" | "acting";

export type ThemeMode =
  | "arc_reactor"
  | "stealth_red"
  | "vibranium_purple"
  | "nanotech_gold"
  | "platinum"
  | "pink_cyber";

export interface JarvisSubAgent {
  name: string;
  status: "PRIM" | "ONLN" | "ACTV" | "IDLE" | "PROC" | "ANLZ";
  accent: string;
  icon: string;
  confidence: number;
  objectives: string[];
}

export interface JarvisToolItem {
  name: string;
  description: string;
  category: "research" | "system" | "automation" | "communication" | "vision" | "media";
  parametersCount: number;
  sampleCall: string;
}

export interface FriendAiFile {
  id: string;
  name: string;
  author: string;
  description: string;
  category: "protocol" | "personality" | "memory" | "tool" | "prompt";
  content: string;
  active: boolean;
  size: number;
  updatedAt: string;
  isPreloaded?: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  brainUsed?: string;
  latencyMs?: number;
  image?: string;
  extractedCode?: {
    language: string;
    code: string;
  };
}

export interface ExecutionTelemetry {
  latencyMs: number;
  tokensEstimate: number;
  activeBrain: string;
  loadedModules: number;
  keyStatus: string;
}

export interface SystemStatus {
  online: boolean;
  engine: string;
  hasGeminiKey: boolean;
  cpuLoad: number;
  memoryUsage: number;
  quantumCores: number;
  activeRouters: string[];
}
