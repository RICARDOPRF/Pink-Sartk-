import React, { useState, useEffect, useRef } from "react";
import {
  AssistantState,
  ChatMessage,
  SystemStatus,
} from "./types";
import { PinkAiPresence } from "./components/PinkAiPresence";
import { PinkMessageBar, AttachedUserFile } from "./components/PinkMessageBar";
import { VisionLinkModal } from "./components/VisionLinkModal";
import { SettingsModal } from "./components/SettingsModal";
import { sendChatMessage, fetchSystemHealth } from "./services/aiService";
import {
  sfx,
  speakText,
  stopSpeaking,
  getSpeechRecognition,
} from "./services/audioService";
import {
  Volume2,
  VolumeX,
  Settings,
  Camera,
  RotateCcw,
} from "lucide-react";

export default function App() {
  const [assistantState, setAssistantState] = useState<AssistantState>("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  
  // Last speech and query for floating subtitles
  const [lastReply, setLastReply] = useState<string | null>(
    "Olá, Ricardo. Estou online e conectada. Você pode conversar comigo por voz ou texto, ligar a câmera ou me enviar arquivos para que eu possa analisá-los."
  );
  const [lastUserPrompt, setLastUserPrompt] = useState<string | null>(null);

  // Conversation history for context
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "msg-welcome",
      role: "assistant",
      content:
        "Olá, Ricardo. Estou online e conectada. Você pode conversar comigo por voz ou texto, ligar a câmera ou me enviar arquivos para que eu possa analisá-los.",
      timestamp: "agora",
      brainUsed: "pink_supervisor",
    },
  ]);

  // Vision & Camera State
  const [isVisionOpen, setIsVisionOpen] = useState(false);
  const [attachedVisionImage, setAttachedVisionImage] = useState<string | null>(null);

  // Settings
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [userName, setUserName] = useState("Ricardo");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [autoSpeak, setAutoSpeak] = useState(true);

  // System status
  const [systemStatus, setSystemStatus] = useState<SystemStatus>({
    online: true,
    engine: "Pink-LPS-v12.5",
    hasGeminiKey: true,
    cpuLoad: 20,
    memoryUsage: 42,
    quantumCores: 8,
    activeRouters: ["Pink Supervisor", "Gemini 3.8", "Vision Link"],
  });

  const recognitionRef = useRef<any>(null);

  // Initial check
  useEffect(() => {
    fetchSystemHealth().then((status) => {
      setSystemStatus(status);
    });
    // Set theme background class on document
    document.body.className = "bg-[#060205] text-slate-100 antialiased selection:bg-pink-500 selection:text-white";
  }, []);

  // Voice speech synthesis
  const handleSpeak = (text: string) => {
    if (!soundEnabled) return;
    setIsSpeaking(true);
    setAssistantState("speaking");
    speakText(text, {
      rate: 1.08,
      pitch: 1.05,
      onEnd: () => {
        setIsSpeaking(false);
        setAssistantState("idle");
      },
      onError: () => {
        setIsSpeaking(false);
        setAssistantState("idle");
      },
    });
  };

  const handleStopSpeaking = () => {
    stopSpeaking();
    setIsSpeaking(false);
    setAssistantState("idle");
  };

  // Speech Recognition handler
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      setAssistantState("idle");
      sfx.playChirp(400);
      return;
    }

    const rec = getSpeechRecognition();
    if (!rec) {
      alert("Reconhecimento de voz não suportado neste navegador. Use o Chrome ou Edge!");
      return;
    }

    recognitionRef.current = rec;
    setIsListening(true);
    setAssistantState("listening");
    sfx.playWakeSound();

    rec.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((r: any) => r[0].transcript)
        .join("");

      if (event.results[0].isFinal) {
        setIsListening(false);
        setAssistantState("thinking");
        handleSendMessage(transcript, []);
      }
    };

    rec.onerror = () => {
      setIsListening(false);
      setAssistantState("idle");
    };

    rec.onend = () => {
      setIsListening(false);
    };

    rec.start();
  };

  // Main message sender with files & vision support
  const handleSendMessage = async (text: string, attachedFiles: AttachedUserFile[] = []) => {
    if (!text.trim() && attachedFiles.length === 0 && !attachedVisionImage) return;

    handleStopSpeaking();

    // Check if an image was attached from files or camera
    const imageFile = attachedFiles.find((f) => f.isImage);
    const imageToSend = imageFile?.content || attachedVisionImage || undefined;

    // Filter text/document files
    const docFiles = attachedFiles.filter((f) => !f.isImage);

    // Build prompt text
    let promptText = text.trim();
    if (!promptText) {
      if (docFiles.length > 0) {
        promptText = `PINK, analise o(s) seguinte(s) arquivo(s) anexado(s): ${docFiles.map((d) => d.name).join(", ")}`;
      } else if (imageToSend) {
        promptText = "PINK, analise o que você está vendo através do sensor óptico da câmera.";
      }
    }

    // Format doc files payload
    const activeFilesPayload = docFiles.map((f) => ({
      id: f.id,
      name: f.name,
      content: f.content,
      description: `Arquivo anexado pelo usuário (${f.type || "documento"})`,
      active: true,
    }));

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: "user",
      content: promptText,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      image: imageToSend,
    };

    setMessages((prev) => [...prev, userMessage]);
    setLastUserPrompt(promptText);
    setIsLoading(true);
    setAssistantState("thinking");
    sfx.playScanBeep();

    try {
      const res = await sendChatMessage(
        promptText,
        messages.map((m) => ({ role: m.role, content: m.content })),
        "pink_supervisor",
        activeFilesPayload,
        userName,
        imageToSend
      );

      const assistantMessage: ChatMessage = {
        id: `msg-res-${Date.now()}`,
        role: "assistant",
        content: res.reply,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        brainUsed: "pink_supervisor",
        latencyMs: res.executionTelemetry?.latencyMs,
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setLastReply(res.reply);
      sfx.playSuccess();
      setAttachedVisionImage(null);

      // Voice response
      if (autoSpeak && soundEnabled) {
        handleSpeak(res.reply);
      } else {
        setAssistantState("idle");
      }
    } catch (err: any) {
      setAssistantState("idle");
      const errMsg = `Desculpe, tive uma oscilação na conexão: ${err.message || "Tente novamente."}`;
      setLastReply(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Direct Vision Analysis trigger from VisionLinkModal
  const handleAnalyzeVisionDirectly = async (dataUrl: string, promptText: string) => {
    setIsVisionOpen(false);
    await handleSendMessage(promptText, [
      {
        id: `vision-${Date.now()}`,
        name: "camera-frame.png",
        size: Math.round(dataUrl.length * 0.75),
        type: "image/png",
        content: dataUrl,
        isImage: true,
      },
    ]);
  };

  const handleResetConversation = () => {
    sfx.playChirp(600);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: "Memória de diálogo reiniciada. Estou pronta, Ricardo. Como posso ajudar agora?",
        timestamp: "agora",
      },
    ]);
    setLastReply("Memória reiniciada. Estou pronta, Ricardo. Como posso ajudar agora?");
    setLastUserPrompt(null);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#070206] text-slate-100 font-sans selection:bg-pink-500 selection:text-white relative overflow-hidden">
      {/* Background cyber grid & ambient aura */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(236,72,153,0.08)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none opacity-40" />

      {/* Top Application Header */}
      <header className="sticky top-0 z-40 w-full px-6 py-3.5 flex items-center justify-between border-b border-pink-500/10 bg-black/40 backdrop-blur-md">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-pink-500" />
          </span>
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-sm tracking-wider text-white font-mono">
              PINK
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
              LPS AI
            </span>
          </div>
        </div>

        {/* Minimal Header Controls */}
        <div className="flex items-center gap-2">
          {/* Vision / Camera Toggle */}
          <button
            onClick={() => {
              setIsVisionOpen((prev) => !prev);
              sfx.playChirp(840);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono transition border ${
              isVisionOpen
                ? "bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/40 shadow-sm"
                : "bg-black/50 border-slate-800/80 hover:border-pink-500/40 text-slate-300 hover:text-pink-300"
            }`}
            title="Câmera // Visão computacional"
          >
            <Camera className="w-3.5 h-3.5 text-pink-400" />
            <span className="hidden sm:inline">Câmera</span>
          </button>

          {/* Sound Audio Voice Toggle */}
          <button
            onClick={() => {
              const next = !soundEnabled;
              setSoundEnabled(next);
              sfx.enabled = next;
              if (next) sfx.playChirp(880);
              else handleStopSpeaking();
            }}
            className="p-2 rounded-full bg-black/50 border border-slate-800/80 hover:border-pink-500/40 text-slate-300 hover:text-pink-300 transition"
            title={soundEnabled ? "Desativar voz da PINK" : "Ativar voz da PINK"}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-pink-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Reset Dialogue History */}
          <button
            onClick={handleResetConversation}
            className="p-2 rounded-full bg-black/50 border border-slate-800/80 hover:border-pink-500/40 text-slate-400 hover:text-white transition"
            title="Reiniciar diálogo"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={() => {
              setIsSettingsOpen(true);
              sfx.playChirp(700);
            }}
            className="p-2 rounded-full bg-black/50 border border-slate-800/80 hover:border-pink-500/40 text-slate-400 hover:text-white transition"
            title="Configurações"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Center Area: Embodied PINK AI */}
      <main className="flex-1 flex flex-col items-center justify-center relative w-full py-4 overflow-y-auto">
        <PinkAiPresence
          state={assistantState}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onToggleMic={toggleSpeechRecognition}
          onStopSpeaking={handleStopSpeaking}
          onReplaySpeech={handleSpeak}
          lastReply={lastReply}
          lastUserPrompt={lastUserPrompt}
          attachedFilesCount={0}
          isVisionActive={isVisionOpen}
          onToggleVision={() => setIsVisionOpen((prev) => !prev)}
        />
      </main>

      {/* Bottom Message Bar for Writing, Files, Camera, and Voice */}
      <footer className="w-full relative z-30">
        <PinkMessageBar
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
          isListening={isListening}
          onToggleMic={toggleSpeechRecognition}
          onOpenVision={() => setIsVisionOpen(true)}
          attachedVisionImage={attachedVisionImage}
          onClearVisionImage={() => setAttachedVisionImage(null)}
        />
      </footer>

      {/* Vision Link Optical Sensor Modal */}
      <VisionLinkModal
        isOpen={isVisionOpen}
        onClose={() => setIsVisionOpen(false)}
        onCaptureSnapshot={(dataUrl) => {
          setAttachedVisionImage(dataUrl);
        }}
        onAnalyzeDirectly={handleAnalyzeVisionDirectly}
        isAnalyzing={isLoading}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        theme={"pink_cyber"}
        onSelectTheme={() => {}}
        userName={userName}
        onChangeUserName={setUserName}
        soundEnabled={soundEnabled}
        onToggleSound={setSoundEnabled}
        autoSpeak={autoSpeak}
        onToggleAutoSpeak={setAutoSpeak}
      />
    </div>
  );
}
