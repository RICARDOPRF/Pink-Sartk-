import React, { useEffect, useState } from "react";
import { AssistantState, BrainMode, ThemeMode } from "../types";
import { Mic, Volume2, Cpu, Zap, Shield, Sparkles, Camera, Eye } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface HologramReactorProps {
  state: AssistantState;
  brainMode: BrainMode;
  theme: ThemeMode;
  onActivateMic: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  onOpenVision?: () => void;
  isVisionActive?: boolean;
}

export const HologramReactor: React.FC<HologramReactorProps> = ({
  state,
  brainMode,
  theme,
  onActivateMic,
  isListening,
  isSpeaking,
  onOpenVision,
  isVisionActive,
}) => {
  const [avatarStyle, setAvatarStyle] = useState<"reactor" | "hologram" | "quantum">("reactor");
  const [pulseRings, setPulseRings] = useState<number[]>([1, 2, 3]);

  // Color mappings based on theme and brain
  const getColors = () => {
    if (theme === "arc_reactor") {
      return {
        primary: "#00c8ff", // Arc Reactor Cyan
        secondary: "#00e5ff", // Energy Cyan
        glow: "rgba(0, 200, 255, 0.5)",
        text: "text-[#00c8ff]",
        border: "border-[#00c8ff]/40",
      };
    }
    if (theme === "stealth_red") {
      return {
        primary: "#ff2244", // Stealth Red
        secondary: "#ff4466",
        glow: "rgba(255, 34, 68, 0.5)",
        text: "text-[#ff2244]",
        border: "border-[#ff2244]/40",
      };
    }
    if (theme === "vibranium_purple") {
      return {
        primary: "#a855f7", // Vibranium Purple
        secondary: "#c084fc",
        glow: "rgba(168, 85, 247, 0.5)",
        text: "text-[#a855f7]",
        border: "border-[#a855f7]/40",
      };
    }
    if (theme === "nanotech_gold") {
      return {
        primary: "#fbbf24", // Nanotech Gold
        secondary: "#fcd34d",
        glow: "rgba(251, 191, 36, 0.5)",
        text: "text-[#fbbf24]",
        border: "border-[#fbbf24]/40",
      };
    }
    if (theme === "platinum") {
      return {
        primary: "#006f94", // Platinum White
        secondary: "#0082a8",
        glow: "rgba(0, 111, 148, 0.5)",
        text: "text-[#006f94]",
        border: "border-[#006f94]/40",
      };
    }
    // Default: pink_cyber
    return {
      primary: "#ec4899", // pink-500
      secondary: "#06b6d4", // cyan-500
      glow: "rgba(236, 72, 153, 0.45)",
      text: "text-pink-400",
      border: "border-pink-500/40",
    };
  };

  const colors = getColors();

  const getStateText = () => {
    switch (state) {
      case "listening":
        return "Ouvindo voz...";
      case "thinking":
        return "Processando núcleos...";
      case "speaking":
        return "Transmitindo resposta...";
      case "acting":
        return "Executando protocolo...";
      default:
        return brainMode === "jarvis_core" ? "JARVIS Online · Pronto" : "Pink Supervisor · Pronta";
    }
  };

  const getStateColorClass = () => {
    switch (state) {
      case "listening":
        return "bg-amber-500 text-amber-950 animate-pulse";
      case "thinking":
        return "bg-purple-500 text-white animate-pulse";
      case "speaking":
        return "bg-pink-500 text-white animate-bounce";
      case "acting":
        return "bg-emerald-500 text-emerald-950";
      default:
        return "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40";
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center p-5 rounded-2xl bg-slate-900/70 border border-slate-800 backdrop-blur-xl shadow-2xl overflow-hidden group">
      {/* Background ambient light */}
      <div
        className="absolute -top-12 -left-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: colors.primary }}
      />
      <div
        className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full blur-3xl opacity-30 pointer-events-none transition-all duration-700"
        style={{ backgroundColor: colors.secondary }}
      />

      {/* Top Header Bar inside stage */}
      <div className="w-full flex items-center justify-between mb-4 z-10">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span
              className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
              style={{ backgroundColor: colors.primary }}
            />
            <span
              className="relative inline-flex rounded-full h-2.5 w-2.5"
              style={{ backgroundColor: colors.primary }}
            />
          </span>
          <span className="text-xs font-mono tracking-wider uppercase text-slate-300">
            {brainMode === "jarvis_core" ? "STARK ARC REACTOR MK-IV" : "PINK STAGE LPS V12.5"}
          </span>
        </div>

        {/* Avatar visual mode toggle */}
        <div className="flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
          <button
            onClick={() => setAvatarStyle("reactor")}
            className={`px-2 py-0.5 rounded transition ${
              avatarStyle === "reactor" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Reator
          </button>
          <button
            onClick={() => setAvatarStyle("hologram")}
            className={`px-2 py-0.5 rounded transition ${
              avatarStyle === "hologram" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Holograma
          </button>
          <button
            onClick={() => setAvatarStyle("quantum")}
            className={`px-2 py-0.5 rounded transition ${
              avatarStyle === "quantum" ? "bg-pink-500/20 text-pink-300 border border-pink-500/40" : "text-slate-400 hover:text-slate-200"
            }`}
          >
            Orbe
          </button>
        </div>
      </div>

      {/* Center Stage & Animated Reactor / Hologram */}
      <div className="relative w-64 h-64 flex items-center justify-center my-2 select-none">
        {/* Four HUD Corner Brackets (from HudCanvas LAYER 13) */}
        <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 pointer-events-none opacity-60" style={{ borderColor: colors.primary }}>
          <span className="absolute -top-3.5 left-0 text-[8px] font-mono text-slate-500">X:0374</span>
        </div>
        <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 pointer-events-none opacity-60" style={{ borderColor: colors.primary }}>
          <span className="absolute -top-3.5 right-0 text-[8px] font-mono text-slate-500">Y:2178</span>
        </div>
        <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 pointer-events-none opacity-60" style={{ borderColor: colors.primary }}>
          <span className="absolute -bottom-3.5 left-0 text-[8px] font-mono text-slate-500">PWR:98%</span>
        </div>
        <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 pointer-events-none opacity-60" style={{ borderColor: colors.primary }}>
          <span className="absolute -bottom-3.5 right-0 text-[8px] font-mono text-slate-500">LAT:16ms</span>
        </div>

        {/* Degree Markers (000°, 090°, 180°, 270°) */}
        <span className="absolute top-1 text-[8px] font-mono text-slate-600 font-bold">000°</span>
        <span className="absolute bottom-1 text-[8px] font-mono text-slate-600 font-bold">180°</span>
        <span className="absolute right-1 text-[8px] font-mono text-slate-600 font-bold">090°</span>
        <span className="absolute left-1 text-[8px] font-mono text-slate-600 font-bold">270°</span>

        {/* Outer Rotating Cybernetic Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: state === "thinking" ? 6 : 24, ease: "linear" }}
          className="absolute inset-2 rounded-full border border-dashed border-slate-700/80 pointer-events-none"
        />

        {/* Hexagonal Telemetry Segment */}
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: state === "thinking" ? 8 : 28, ease: "linear" }}
          className="absolute inset-5 rounded-full border pointer-events-none opacity-50"
          style={{ borderTopColor: colors.primary, borderBottomColor: colors.secondary }}
        />

        {/* Inner concentric ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: state === "thinking" ? 10 : 35, ease: "linear" }}
          className="absolute inset-3 rounded-full border border-slate-800 pointer-events-none"
          style={{ borderTopColor: colors.primary, borderBottomColor: colors.secondary }}
        />

        {/* Active Audio / Thinking Pulse Rings */}
        <AnimatePresence>
          {(isListening || isSpeaking || state === "thinking") &&
            pulseRings.map((ring) => (
              <motion.div
                key={ring}
                initial={{ scale: 0.8, opacity: 0.8 }}
                animate={{ scale: 1.4, opacity: 0 }}
                transition={{
                  repeat: Infinity,
                  duration: 1.8,
                  delay: ring * 0.4,
                  ease: "easeOut",
                }}
                className="absolute inset-4 rounded-full border-2 pointer-events-none"
                style={{ borderColor: colors.primary }}
              />
            ))}
        </AnimatePresence>

        {/* Central Core Display */}
        {avatarStyle === "reactor" && (
          <div className="relative w-40 h-40 rounded-full bg-slate-950/90 border-2 border-slate-800 flex items-center justify-center shadow-inner overflow-hidden">
            {/* Geometric Arc Reactor blades */}
            <div className="absolute inset-2 rounded-full border border-slate-800/80" />
            <div className="absolute w-full h-[1px] bg-slate-800" />
            <div className="absolute h-full w-[1px] bg-slate-800" />
            <div className="absolute w-full h-[1px] bg-slate-800 rotate-45" />
            <div className="absolute w-full h-[1px] bg-slate-800 -rotate-45" />

            {/* Inner Core Glowing Orb */}
            <motion.div
              animate={{
                scale: isSpeaking ? [1, 1.15, 0.95, 1.1, 1] : isListening ? [1, 1.2, 1] : [1, 1.05, 1],
                boxShadow: [
                  `0 0 20px ${colors.glow}`,
                  `0 0 35px ${colors.glow}`,
                  `0 0 20px ${colors.glow}`,
                ],
              }}
              transition={{ repeat: Infinity, duration: isListening ? 1 : 2.5 }}
              className="relative w-20 h-20 rounded-full flex flex-col items-center justify-center text-white cursor-pointer z-10 transition-colors"
              style={{
                background: `radial-gradient(circle, ${colors.primary} 0%, rgba(15,23,42,0.9) 80%)`,
              }}
              onClick={onActivateMic}
              title="Clique para falar com a IA"
            >
              <motion.div animate={{ rotate: isListening ? [0, -10, 10, 0] : 0 }}>
                {isListening ? (
                  <Mic className="w-8 h-8 text-white drop-shadow-md animate-pulse" />
                ) : isSpeaking ? (
                  <Volume2 className="w-8 h-8 text-white drop-shadow-md animate-bounce" />
                ) : (
                  <Sparkles className="w-8 h-8 text-white drop-shadow-md" />
                )}
              </motion.div>
              <span className="text-[9px] font-mono tracking-tighter uppercase font-bold mt-1 text-slate-100">
                {isListening ? "ESCUTANDO" : "ATIVAR"}
              </span>
            </motion.div>
          </div>
        )}

        {avatarStyle === "hologram" && (
          <div className="relative w-40 h-40 rounded-full bg-slate-950/90 border border-slate-800 flex items-center justify-center overflow-hidden">
            {/* Hologram scanline effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pink-500/10 to-transparent bg-[length:100%_4px] pointer-events-none animate-pulse" />
            <motion.div
              animate={{
                opacity: [0.85, 1, 0.9],
                y: [0, -2, 0],
              }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="relative flex flex-col items-center justify-center"
            >
              <div
                className="w-24 h-24 rounded-full border-2 p-1 flex items-center justify-center shadow-lg"
                style={{ borderColor: colors.primary, boxShadow: `0 0 20px ${colors.glow}` }}
              >
                <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-600/30 to-purple-800/30 flex items-center justify-center">
                  <span className="text-3xl font-extrabold tracking-wider font-mono text-pink-300">
                    {brainMode === "jarvis_core" ? "J" : "P"}
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-pink-300 font-semibold mt-2">
                HOLOGRAPHIC AI
              </span>
            </motion.div>
          </div>
        )}

        {avatarStyle === "quantum" && (
          <div className="relative w-40 h-40 rounded-full bg-slate-950/90 border border-slate-800 flex items-center justify-center overflow-hidden">
            <motion.div
              animate={{ rotate: 360, scale: [0.95, 1.05, 0.95] }}
              transition={{ repeat: Infinity, duration: 8, ease: "linear" }}
              className="w-28 h-28 rounded-full border-2 border-dashed"
              style={{ borderColor: colors.secondary }}
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              className="absolute w-20 h-20 rounded-full border border-pink-500/60"
            />
            <div
              className="absolute w-12 h-12 rounded-full blur-sm"
              style={{ backgroundColor: colors.primary }}
            />
            <div className="absolute w-6 h-6 rounded-full bg-white shadow-xl" />
          </div>
        )}
      </div>

      {/* State Status Pill */}
      <div className="mt-2 flex items-center gap-2">
        <span
          className={`px-3 py-1 rounded-full text-xs font-mono font-medium shadow-sm transition-all duration-300 ${getStateColorClass()}`}
        >
          {getStateText()}
        </span>
      </div>

      {/* Frequency spectrum audio visualizer bars */}
      <div className="w-full flex items-end justify-center gap-1 h-8 mt-4 px-6">
        {Array.from({ length: 24 }).map((_, i) => {
          const isActive = isSpeaking || isListening || state === "thinking";
          const heightPercent = isActive
            ? Math.max(15, Math.floor(Math.sin((i + Date.now() / 200) * 0.8) * 45 + 50))
            : Math.max(10, (i % 4) * 6 + 10);

          return (
            <motion.div
              key={i}
              className="w-1.5 rounded-t transition-all duration-150"
              style={{
                height: `${heightPercent}%`,
                backgroundColor: i % 2 === 0 ? colors.primary : colors.secondary,
                opacity: isActive ? 0.9 : 0.25,
              }}
            />
          );
        })}
      </div>

      {/* Bottom Sub-panel with Voice & Vision Signatures */}
      <div className="w-full mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>VOZ: {brainMode === "jarvis_core" ? "JARVIS Neural" : "Pink Supervisor"}</span>
        </div>

        <div className="flex items-center gap-2.5">
          {onOpenVision && (
            <button
              onClick={onOpenVision}
              className={`transition flex items-center gap-1 text-[11px] ${
                isVisionActive
                  ? "text-[#00FF88] font-bold animate-pulse"
                  : "text-[#00C8FF] hover:text-white"
              }`}
              title="Ativar Câmera // Vision Link para o JARVIS me ver"
            >
              <Camera className="w-3 h-3" />
              {isVisionActive ? "Câmera ON" : "Olhar"}
            </button>
          )}

          <button
            onClick={onActivateMic}
            className="text-pink-400 hover:text-pink-300 transition flex items-center gap-1 underline underline-offset-2 text-[11px]"
          >
            <Mic className="w-3 h-3" />
            {isListening ? "Parar" : "Falar"}
          </button>
        </div>
      </div>
    </div>
  );
};
