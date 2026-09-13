import React, { useRef, useEffect, useState } from "react";
import { ChatMessage, BrainMode } from "../types";
import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Sparkles,
  Cpu,
  Bot,
  User,
  Play,
  Copy,
  Check,
  Code2,
  Zap,
  Camera,
  X,
  Eye,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sfx, speakText, stopSpeaking } from "../services/audioService";

interface ChatTimelineProps {
  messages: ChatMessage[];
  onSendMessage: (text: string, image?: string) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleMic: () => void;
  brainMode: BrainMode;
  onChangeBrainMode: (mode: BrainMode) => void;
  onSelectCodeForPreview: (code: string) => void;
  onOpenVision?: () => void;
  attachedImage?: string | null;
  onClearAttachedImage?: () => void;
}

export const ChatTimeline: React.FC<ChatTimelineProps> = ({
  messages,
  onSendMessage,
  isLoading,
  isListening,
  onToggleMic,
  brainMode,
  onChangeBrainMode,
  onSelectCodeForPreview,
  onOpenVision,
  attachedImage,
  onClearAttachedImage,
}) => {
  const [inputText, setInputText] = useState("");
  const [speakingMessageId, setSpeakingMessageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewZoomImage, setPreviewZoomImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if ((!inputText.trim() && !attachedImage) || isLoading) return;
    const text = inputText.trim() || (attachedImage ? "J.A.R.V.I.S., por favor analise esta captura da câmera." : "");
    const imgToSend = attachedImage || undefined;
    setInputText("");
    if (onClearAttachedImage) onClearAttachedImage();
    sfx.playChirp(800);
    onSendMessage(text, imgToSend);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSpeak = (msg: ChatMessage) => {
    if (speakingMessageId === msg.id) {
      stopSpeaking();
      setSpeakingMessageId(null);
      sfx.playChirp(400);
    } else {
      setSpeakingMessageId(msg.id);
      sfx.playChirp(880);
      speakText(msg.content, {
        rate: brainMode === "jarvis_core" ? 1.0 : 1.1,
        pitch: brainMode === "jarvis_core" ? 0.95 : 1.1,
        onEnd: () => setSpeakingMessageId(null),
        onError: () => setSpeakingMessageId(null),
      });
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    sfx.playChirp(700);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickCommands = [
    { label: "👁️ Olhar para mim (Câmera)", prompt: "J.A.R.V.I.S., ative a câmera, olhe para mim e descreva o que você está vendo agora." },
    { label: "⚡ Status dos 8 Agentes", prompt: "J.A.R.V.I.S., reporte o status dos 8 sub-agentes da nossa rede cognitiva e confirme suas principais ferramentas autônomas." },
    { label: "📁 Analisar Arquivos de Amigos", prompt: "Resuma os arquivos de IA que meus amigos me enviaram e como você os está usando." },
    { label: "📊 Painel de Bordo LPS", prompt: "Crie um código HTML moderno de painel de bordo industrial para o Preview com métricas e gráficos." },
    { label: "🛡️ Protocolo Stark", prompt: "Ativar Protocolo Stark J.A.R.V.I.S. e executar diagnóstico de blindagem e telemetria." },
  ];

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl p-4 shadow-2xl overflow-hidden">
      {/* Top Session Bar */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse" />
          <span className="font-bold text-white tracking-wider">CONVERSA DA SESSÃO</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-400">Memory Cloud → Gemini 3.8 Flash</span>
        </div>

        {/* Brain Selector Dropdown */}
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400 text-[11px]">Cérebro:</span>
          <select
            value={brainMode}
            onChange={(e) => {
              onChangeBrainMode(e.target.value as BrainMode);
              sfx.playChirp(600);
            }}
            className="bg-slate-950 border border-slate-700 text-slate-200 text-xs rounded-lg px-2 py-1 font-mono focus:outline-none focus:border-pink-500"
          >
            <option value="pink_supervisor">Pink Supervisor (LPS)</option>
            <option value="jarvis_core">J.A.R.V.I.S. Core (Stark)</option>
            <option value="friday_tactical">F.R.I.D.A.Y. Tático</option>
            <option value="hybrid_lps">Híbrido LPS & Amigos</option>
          </select>
        </div>
      </div>

      {/* Messages Timeline List */}
      <div className="flex-1 overflow-y-auto pr-1 py-3 space-y-4 min-h-[220px]">
        {messages.map((msg) => {
          const isUser = msg.role === "user";
          const isSpeaking = speakingMessageId === msg.id;

          // Extract code if present
          const codeMatch = msg.content.match(/```(?:html|jsx|tsx|css|javascript|js)?([\s\S]*?)```/);
          const hasCode = Boolean(codeMatch && codeMatch[1]);

          return (
            <div
              key={msg.id}
              className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
            >
              {/* Speaker Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 shadow ${
                  isUser
                    ? "bg-slate-800 text-slate-200 border border-slate-700"
                    : brainMode === "jarvis_core"
                    ? "bg-sky-600 text-white shadow-sky-500/20"
                    : "bg-pink-600 text-white shadow-pink-500/20"
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble Container */}
              <div className={`max-w-[85%] space-y-1.5 ${isUser ? "items-end" : "items-start"}`}>
                {/* Name and time */}
                <div
                  className={`flex items-center gap-2 text-[11px] font-mono text-slate-400 ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  <span className="font-semibold text-slate-300">
                    {isUser
                      ? "Operador"
                      : brainMode === "jarvis_core"
                      ? "J.A.R.V.I.S."
                      : "Pink Supervisor"}
                  </span>
                  <span>{msg.timestamp}</span>
                  {msg.latencyMs && (
                    <span className="text-[10px] text-emerald-400">({msg.latencyMs}ms)</span>
                  )}
                </div>

                {/* Bubble content */}
                <div
                  className={`p-3.5 rounded-2xl text-sm leading-relaxed border transition-all ${
                    isUser
                      ? "bg-slate-800/90 text-slate-100 border-slate-700 rounded-tr-sm"
                      : "bg-slate-950/80 text-slate-100 border-slate-800 rounded-tl-sm shadow-md"
                  }`}
                >
                  {/* If user sent an image with this message */}
                  {msg.image && (
                    <div className="mb-2.5">
                      <div className="relative inline-block group rounded-xl overflow-hidden border border-[#00C8FF]/40 shadow-md">
                        <img
                          src={msg.image}
                          alt="Captura da Câmera"
                          className="max-h-48 max-w-full rounded-lg object-cover cursor-pointer hover:opacity-90 transition"
                          onClick={() => setPreviewZoomImage(msg.image || null)}
                        />
                        <div className="absolute top-1 left-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] font-mono text-[#00E5FF] flex items-center gap-1">
                          <Eye className="w-2.5 h-2.5" />
                          <span>FRAME ÓPTICO</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="prose prose-invert prose-sm max-w-none prose-p:my-1 prose-pre:bg-slate-900 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>

                  {/* Code action pill */}
                  {hasCode && !isUser && (
                    <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-pink-400 flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5" />
                        Código detectado
                      </span>
                      <button
                        onClick={() => {
                          if (codeMatch && codeMatch[1]) {
                            onSelectCodeForPreview(codeMatch[1].trim());
                            sfx.playSuccess();
                          }
                        }}
                        className="px-2.5 py-1 rounded bg-pink-500/20 hover:bg-pink-500/30 text-pink-300 border border-pink-500/40 text-xs font-mono font-medium flex items-center gap-1 transition shadow-sm"
                      >
                        <Play className="w-3 h-3" />
                        Executar no Preview
                      </button>
                    </div>
                  )}
                </div>

                {/* Assistant Message Actions (Speak / Copy) */}
                {!isUser && (
                  <div className="flex items-center gap-2 pt-0.5">
                    <button
                      onClick={() => handleSpeak(msg)}
                      className={`flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded transition ${
                        isSpeaking
                          ? "bg-pink-500/20 text-pink-300 border border-pink-500/40 animate-pulse"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      {isSpeaking ? (
                        <>
                          <VolumeX className="w-3 h-3" /> Parar Voz
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3 h-3" /> Ouvir Resposta
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleCopy(msg.id, msg.content)}
                      className="text-[11px] font-mono text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded flex items-center gap-1 transition"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" /> Copiado
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" /> Copiar
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Loading / Thinking Indicator */}
        {isLoading && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-pink-600/30 border border-pink-500/40 flex items-center justify-center text-pink-300 text-xs font-bold animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-pink-300 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-pink-500 animate-ping" />
              <span>
                {brainMode === "jarvis_core"
                  ? "J.A.R.V.I.S. processando matriz neural..."
                  : "Pink Supervisor orquestrando cérebros..."}
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Commands */}
      <div className="py-2 flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono no-scrollbar">
        {quickCommands.map((cmd, idx) => (
          <button
            key={idx}
            onClick={() => {
              sfx.playChirp(700);
              onSendMessage(cmd.prompt);
            }}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-full bg-slate-950/90 border border-slate-800 text-slate-300 hover:text-pink-300 hover:border-pink-500/40 transition whitespace-nowrap disabled:opacity-50"
          >
            {cmd.label}
          </button>
        ))}
      </div>

      {/* Input Form with Speech Recognition & Vision Link */}
      <form onSubmit={handleSend} className="relative mt-2">
        {/* Attached image preview bar if any */}
        {attachedImage && (
          <div className="mb-2 p-2 rounded-xl bg-[#00101C] border border-[#00C8FF]/50 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden border border-[#00C8FF]">
                <img
                  src={attachedImage}
                  alt="Snapshot"
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setPreviewZoomImage(attachedImage)}
                />
              </div>
              <div className="text-xs font-mono">
                <span className="text-[#00E5FF] font-bold flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5" /> FRAME DA CÂMERA ANEXADO
                </span>
                <p className="text-[11px] text-slate-400">
                  O JARVIS analisará esta imagem com visão computacional multimodal.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClearAttachedImage}
              className="p-1.5 rounded-lg bg-slate-900 text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Remover imagem"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="flex items-end gap-2 p-2 rounded-2xl bg-slate-950/90 border border-slate-800 focus-within:border-cyan-500/60 transition shadow-inner">
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isListening
                ? "Ouvindo sua voz... pode falar agora!"
                : attachedImage
                ? "Faça uma pergunta sobre o que o JARVIS está vendo (ou aperte Enter)..."
                : "Digite uma mensagem ou comando (ou clique no microfone/câmera)..."
            }
            rows={2}
            className="flex-1 bg-transparent border-0 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none px-2 py-1 leading-relaxed"
          />

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Camera / Vision Link button */}
            {onOpenVision && (
              <button
                type="button"
                onClick={() => {
                  sfx.playChirp(720);
                  onOpenVision();
                }}
                className={`p-2.5 rounded-xl transition-all ${
                  attachedImage
                    ? "bg-[#00C8FF]/20 text-[#00E5FF] border border-[#00C8FF]/50 shadow-md shadow-[#00C8FF]/20"
                    : "bg-slate-800 text-slate-300 hover:text-[#00E5FF] hover:bg-slate-700"
                }`}
                title="Ativar Câmera // Vision Link para o JARVIS me ver"
              >
                <Camera className="w-4 h-4" />
              </button>
            )}

            {/* Mic button */}
            <button
              type="button"
              onClick={onToggleMic}
              className={`p-2.5 rounded-xl transition-all ${
                isListening
                  ? "bg-amber-500 text-amber-950 animate-bounce shadow-lg shadow-amber-500/30"
                  : "bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700"
              }`}
              title={isListening ? "Parar escuta de voz" : "Falar por microfone"}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Send button */}
            <button
              type="submit"
              disabled={(!inputText.trim() && !attachedImage) || isLoading}
              className="p-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-white transition shadow-md shadow-cyan-600/30"
              title="Enviar mensagem ou análise"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>

      {/* Lightbox for zooming captured image */}
      {previewZoomImage && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setPreviewZoomImage(null)}
        >
          <div
            className="relative max-w-2xl max-h-[85vh] rounded-2xl overflow-hidden border border-[#00C8FF]/60 shadow-2xl bg-black"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={previewZoomImage} alt="Visão Óptica" className="w-full h-auto object-contain" />
            <button
              onClick={() => setPreviewZoomImage(null)}
              className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/70 rounded-lg text-xs font-mono text-[#00E5FF]">
              FRAME DE VISÃO ÓPTICA // JARVIS SENSOR
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
