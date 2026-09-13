import React, { useState } from "react";
import { AssistantState } from "../types";
import { motion, AnimatePresence } from "motion/react";
import {
  Mic,
  Volume2,
  VolumeX,
  Sparkles,
  Copy,
  Check,
  X,
  FileText,
  Eye,
  RefreshCw,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { sfx } from "../services/audioService";

interface PinkAiPresenceProps {
  state: AssistantState;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleMic: () => void;
  onStopSpeaking: () => void;
  onReplaySpeech: (text: string) => void;
  lastReply: string | null;
  lastUserPrompt: string | null;
  attachedFilesCount: number;
  isVisionActive: boolean;
  onToggleVision: () => void;
}

export const PinkAiPresence: React.FC<PinkAiPresenceProps> = ({
  state,
  isListening,
  isSpeaking,
  onToggleMic,
  onStopSpeaking,
  onReplaySpeech,
  lastReply,
  lastUserPrompt,
  attachedFilesCount,
  isVisionActive,
  onToggleVision,
}) => {
  const [copied, setCopied] = useState(false);
  const [isSubtitleDismissed, setIsSubtitleDismissed] = useState(false);

  const handleCopy = () => {
    if (!lastReply) return;
    navigator.clipboard.writeText(lastReply);
    setCopied(true);
    sfx.playChirp(800);
    setTimeout(() => setCopied(false), 2000);
  };

  // Status badge text & color
  const getStatusInfo = () => {
    if (isListening) {
      return {
        text: "ESCUTANDO SUA VOZ...",
        dot: "bg-amber-400 animate-ping",
        glow: "rgba(251, 191, 36, 0.4)",
      };
    }
    if (state === "thinking") {
      return {
        text: "PROCESSANDO COGNIÇÃO...",
        dot: "bg-fuchsia-400 animate-ping",
        glow: "rgba(217, 70, 239, 0.5)",
      };
    }
    if (isSpeaking) {
      return {
        text: "TRANSMITINDO ÁUDIO...",
        dot: "bg-[#00FF88] animate-pulse",
        glow: "rgba(0, 255, 136, 0.5)",
      };
    }
    return {
      text: "PINK // AI ONLINE",
      dot: "bg-[#ec4899] animate-pulse",
      glow: "rgba(236, 72, 153, 0.4)",
    };
  };

  const status = getStatusInfo();

  return (
    <div className="relative flex flex-col items-center justify-center w-full max-w-4xl mx-auto flex-1 px-4 select-none">
      {/* Ambient background glow */}
      <div
        className="absolute w-72 sm:w-96 h-72 sm:h-96 rounded-full blur-3xl opacity-25 pointer-events-none transition-all duration-1000"
        style={{
          background: isListening
            ? "radial-gradient(circle, #f59e0b 0%, #ec4899 70%)"
            : isSpeaking
            ? "radial-gradient(circle, #ec4899 0%, #06b6d4 70%)"
            : "radial-gradient(circle, #ec4899 0%, #3b0764 70%)",
        }}
      />

      {/* Top Status Pill */}
      <div className="mb-6 z-10 flex items-center gap-3">
        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-950/80 border border-pink-500/30 backdrop-blur-md shadow-lg shadow-pink-500/10">
          <span className={`w-2 h-2 rounded-full ${status.dot}`} />
          <span className="text-[11px] font-mono tracking-widest text-pink-300 font-bold uppercase">
            {status.text}
          </span>
        </div>

        {/* Quick Optical Vision Indicator */}
        <button
          onClick={onToggleVision}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-mono transition-all backdrop-blur-md border ${
            isVisionActive
              ? "bg-[#00FF88]/20 text-[#00FF88] border-[#00FF88]/40 shadow-md shadow-[#00FF88]/20"
              : "bg-slate-950/80 text-slate-400 hover:text-pink-300 border-slate-800 hover:border-pink-500/30"
          }`}
          title={isVisionActive ? "Câmera ativa (PINK está te vendo)" : "Ativar câmera para PINK te ver"}
        >
          <Eye className="w-3.5 h-3.5 text-pink-400" />
          <span>{isVisionActive ? "VISÃO ATIVA" : "CÂMERA"}</span>
        </button>
      </div>

      {/* Central Living AI Entity */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 flex items-center justify-center my-2">
        {/* Concentric Rotating Cyber Rings */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: state === "thinking" ? 6 : isListening ? 8 : 28,
            ease: "linear",
          }}
          className="absolute inset-0 rounded-full border border-pink-500/20 border-dashed pointer-events-none"
        />

        <motion.div
          animate={{ rotate: -360 }}
          transition={{
            repeat: Infinity,
            duration: state === "thinking" ? 8 : 22,
            ease: "linear",
          }}
          className="absolute inset-4 rounded-full border pointer-events-none opacity-40 border-t-pink-500 border-b-cyan-400 border-l-transparent border-r-transparent"
        />

        <motion.div
          animate={{ rotate: 360 }}
          transition={{
            repeat: Infinity,
            duration: state === "thinking" ? 10 : 34,
            ease: "linear",
          }}
          className="absolute inset-8 rounded-full border border-slate-800/80 pointer-events-none"
        />

        {/* Audio Waveform Ripple Waves when Speaking / Listening */}
        <AnimatePresence>
          {(isListening || isSpeaking || state === "thinking") && (
            <>
              {[1, 2, 3].map((ring) => (
                <motion.div
                  key={ring}
                  initial={{ scale: 0.8, opacity: 0.7 }}
                  animate={{ scale: 1.35, opacity: 0 }}
                  transition={{
                    repeat: Infinity,
                    duration: 1.8,
                    delay: ring * 0.45,
                    ease: "easeOut",
                  }}
                  className="absolute inset-6 rounded-full border-2 border-pink-500/60 pointer-events-none"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Core Organic AI Orb */}
        <motion.div
          animate={{
            scale: isSpeaking
              ? [1, 1.1, 0.95, 1.08, 1]
              : isListening
              ? [1, 1.15, 1]
              : state === "thinking"
              ? [1, 1.06, 0.96, 1.04, 1]
              : [1, 1.03, 1],
            boxShadow: isListening
              ? [
                  "0 0 25px rgba(245, 158, 11, 0.5)",
                  "0 0 45px rgba(245, 158, 11, 0.7)",
                  "0 0 25px rgba(245, 158, 11, 0.5)",
                ]
              : isSpeaking
              ? [
                  "0 0 30px rgba(236, 72, 153, 0.6)",
                  "0 0 60px rgba(236, 72, 153, 0.8)",
                  "0 0 30px rgba(236, 72, 153, 0.6)",
                ]
              : [
                  "0 0 25px rgba(236, 72, 153, 0.4)",
                  "0 0 45px rgba(236, 72, 153, 0.55)",
                  "0 0 25px rgba(236, 72, 153, 0.4)",
                ],
          }}
          transition={{
            repeat: Infinity,
            duration: isListening ? 1.2 : isSpeaking ? 1.5 : 3.5,
            ease: "easeInOut",
          }}
          onClick={onToggleMic}
          className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full flex flex-col items-center justify-center cursor-pointer z-10 transition-transform active:scale-95 group overflow-hidden"
          style={{
            background:
              "radial-gradient(circle, #f43f5e 0%, #ec4899 45%, #831843 80%, #0f172a 100%)",
          }}
          title={isListening ? "Clique para pausar voz" : "Clique para falar com a PINK"}
        >
          {/* Subtle Scanline / Sheen */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-black/30 pointer-events-none" />

          {/* Soundwave Bars in Center */}
          <div className="relative flex items-center justify-center gap-1.5 h-10 z-10">
            {[40, 75, 100, 60, 90, 45].map((height, i) => (
              <motion.span
                key={i}
                animate={{
                  height: isSpeaking
                    ? [`${height * 0.3}%`, `${height}%`, `${height * 0.2}%`]
                    : isListening
                    ? [`${height * 0.5}%`, `${height}%`, `${height * 0.4}%`]
                    : [`${height * 0.2}%`, `${height * 0.4}%`, `${height * 0.2}%`],
                }}
                transition={{
                  repeat: Infinity,
                  duration: isSpeaking ? 0.6 : isListening ? 0.8 : 2.2,
                  delay: i * 0.08,
                  ease: "easeInOut",
                }}
                className="w-1.5 rounded-full bg-white shadow-sm shadow-white"
              />
            ))}
          </div>

          <span className="text-[10px] font-mono tracking-wider uppercase font-bold text-white/90 mt-2 z-10">
            {isListening ? "OUVINDO" : isSpeaking ? "FALANDO" : "PINK AI"}
          </span>
        </motion.div>
      </div>

      {/* Floating Subtitle / Speech Dialogue Output from PINK */}
      <AnimatePresence>
        {lastReply && !isSubtitleDismissed && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-2xl mt-4 p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-pink-500/40 backdrop-blur-xl shadow-2xl shadow-pink-950/50 z-20"
          >
            {/* Dialogue Header */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-pink-500/20 text-xs font-mono">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                <span className="text-pink-300 font-bold tracking-wider">
                  RESPOSTA DA PINK
                </span>
                {lastUserPrompt && (
                  <span className="hidden sm:inline text-slate-400 truncate max-w-[200px]">
                    · "{lastUserPrompt}"
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1">
                {/* Audio voice replay / mute */}
                {isSpeaking ? (
                  <button
                    onClick={onStopSpeaking}
                    className="p-1.5 rounded-lg text-pink-400 hover:text-white hover:bg-slate-800 transition"
                    title="Parar voz"
                  >
                    <VolumeX className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => onReplaySpeech(lastReply)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-pink-300 hover:bg-slate-800 transition"
                    title="Ouvir resposta novamente"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                )}

                {/* Copy Text */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
                  title="Copiar texto"
                >
                  {copied ? (
                    <Check className="w-3.5 h-3.5 text-green-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>

                {/* Close Subtitle */}
                <button
                  onClick={() => setIsSubtitleDismissed(true)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                  title="Fechar resposta"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Markdown Text Body */}
            <div className="text-sm text-slate-100 max-h-60 overflow-y-auto pr-1 leading-relaxed prose prose-invert prose-sm max-w-none prose-p:my-1.5 prose-pre:bg-slate-900/90 prose-pre:border prose-pre:border-slate-800 prose-pre:rounded-xl select-text">
              <ReactMarkdown>{lastReply}</ReactMarkdown>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
