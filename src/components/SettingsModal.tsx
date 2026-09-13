import React, { useEffect, useState } from "react";
import { ThemeMode } from "../types";
import { Settings, Volume2, Mic, Palette, Bell, Check, Sparkles, Radio } from "lucide-react";
import { sfx } from "../services/audioService";
import { JARVIS_VOICES_LIST } from "../data/jarvisData";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  theme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
  userName: string;
  onChangeUserName: (name: string) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  autoSpeak: boolean;
  onToggleAutoSpeak: (auto: boolean) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  theme,
  onSelectTheme,
  userName,
  onChangeUserName,
  soundEnabled,
  onToggleSound,
  autoSpeak,
  onToggleAutoSpeak,
}) => {
  const [selectedVoice, setSelectedVoice] = useState<string>("puck");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-[#00080F] border border-[#0A2535] rounded-2xl max-w-xl w-full p-6 shadow-2xl flex flex-col gap-5 animate-in fade-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#0A2535] pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#00C8FF]" />
            <h3 className="font-bold text-sm text-[#E8F8FF] font-mono tracking-wider">
              CONFIGURAÇÕES · PINK & JARVIS MARK XXXIX
            </h3>
          </div>
          <button
            onClick={() => {
              onClose();
              sfx.playChirp(600);
            }}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-[#000C18]"
          >
            ✕
          </button>
        </div>

        {/* User Name / Callsign */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-1">
            Como a IA deve te chamar (Callsign / Nome de Operador):
          </label>
          <input
            type="text"
            value={userName}
            onChange={(e) => onChangeUserName(e.target.value)}
            placeholder="ex: Ricardo, Chefe, Senhor, Comandante"
            className="w-full p-2.5 text-xs rounded-xl bg-[#000306] border border-[#0A2535] text-white focus:outline-none focus:border-[#00C8FF] font-mono"
          />
        </div>

        {/* Theme Picker (From Jarvis ThemeManager) */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-2 flex items-center gap-1.5">
            <Palette className="w-4 h-4 text-[#00C8FF]" />
            Tema Visual do Reator Holográfico:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs font-mono">
            {[
              { id: "arc_reactor", label: "Arc Reactor Blue", color: "bg-[#00c8ff]" },
              { id: "stealth_red", label: "Stealth Red", color: "bg-[#ff2244]" },
              { id: "vibranium_purple", label: "Vibranium Purple", color: "bg-[#a855f7]" },
              { id: "nanotech_gold", label: "Nanotech Gold", color: "bg-[#fbbf24]" },
              { id: "platinum", label: "Platinum White", color: "bg-[#006f94]" },
              { id: "pink_cyber", label: "Pink Cyber LPS", color: "bg-[#ec4899]" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => {
                  onSelectTheme(t.id as ThemeMode);
                  sfx.playChirp(880);
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-2 transition ${
                  theme === t.id
                    ? "bg-[#001520] border-[#00C8FF] text-white shadow-md shadow-[#00C8FF]/20 font-bold"
                    : "bg-[#000408] border-[#0A2535] text-slate-400 hover:text-slate-200"
                }`}
              >
                <span className={`w-3 h-3 rounded-full shrink-0 ${t.color}`} />
                <span className="text-[11px] truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Voice Profile Picker (Gemini Live Voices) */}
        <div>
          <label className="block text-xs font-mono text-slate-300 mb-2 flex items-center gap-1.5">
            <Radio className="w-4 h-4 text-[#00E5FF]" />
            Voz do Gemini Live (Perfis Suportados):
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-xs font-mono">
            {JARVIS_VOICES_LIST.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVoice(v.id);
                  sfx.playChirp(750);
                }}
                className={`p-2 rounded-xl border text-left transition ${
                  selectedVoice === v.id
                    ? "bg-[#001520] border-[#00E5FF] text-[#00E5FF] font-bold"
                    : "bg-[#000408] border-[#0A2535] text-slate-400 hover:text-slate-200"
                }`}
              >
                <div className="text-xs">{v.name}</div>
                <div className="text-[9px] text-slate-500 truncate">{v.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Audio & Voice Toggles */}
        <div className="space-y-3 pt-2 border-t border-[#0A2535]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-amber-400" />
              <div>
                <p className="text-xs font-medium text-slate-200">Efeitos Sonoros Sci-Fi (Web Audio)</p>
                <p className="text-[11px] text-slate-500">Chirps, bips e sons de telemetria futurista</p>
              </div>
            </div>
            <button
              onClick={() => {
                const next = !soundEnabled;
                sfx.enabled = next;
                onToggleSound(next);
                if (next) sfx.playWakeSound();
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                soundEnabled ? "bg-[#00C8FF]" : "bg-slate-800"
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  soundEnabled ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-sky-400" />
              <div>
                <p className="text-xs font-medium text-slate-200">Falar Respostas Automaticamente</p>
                <p className="text-[11px] text-slate-500">Sintetiza voz após cada resposta da IA</p>
              </div>
            </div>
            <button
              onClick={() => {
                onToggleAutoSpeak(!autoSpeak);
                sfx.playChirp(700);
              }}
              className={`w-11 h-6 rounded-full transition-colors relative ${
                autoSpeak ? "bg-[#00C8FF]" : "bg-slate-800"
              }`}
            >
              <span
                className={`block w-4 h-4 rounded-full bg-white transition-transform ${
                  autoSpeak ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-[#0A2535]">
          <button
            onClick={() => {
              onClose();
              sfx.playSuccess();
            }}
            className="px-5 py-2 rounded-xl bg-[#00C8FF] hover:bg-[#00b5e8] text-black text-xs font-bold font-mono transition shadow-md"
          >
            Concluir Configurações
          </button>
        </div>
      </div>
    </div>
  );
};
