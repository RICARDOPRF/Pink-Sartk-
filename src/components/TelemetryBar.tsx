import React from "react";
import { AssistantState, SystemStatus } from "../types";
import { Cpu, Activity, Zap, CheckCircle2, Shield, Radio, Sparkles } from "lucide-react";

interface TelemetryBarProps {
  state: AssistantState;
  systemStatus: SystemStatus;
  activeModulesCount: number;
  lastLatencyMs?: number;
}

export const TelemetryBar: React.FC<TelemetryBarProps> = ({
  state,
  systemStatus,
  activeModulesCount,
  lastLatencyMs = 180,
}) => {
  const nodes = [
    { id: "listen", label: "OUVIR", stateMatch: "listening" },
    { id: "think", label: "PENSAR", stateMatch: "thinking" },
    { id: "speak", label: "FALAR", stateMatch: "speaking" },
    { id: "act", label: "EXECUTAR", stateMatch: "acting" },
  ];

  return (
    <div className="w-full bg-slate-900/80 border-y border-slate-800 backdrop-blur-md px-4 py-2 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
      {/* Live Orchestration Pipeline */}
      <div className="flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[10px] uppercase font-semibold text-slate-400 mr-1 flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-pink-400" />
          PIPELINE:
        </span>

        {nodes.map((node, idx) => {
          const isActive = state === node.stateMatch;
          return (
            <React.Fragment key={node.id}>
              <div
                className={`flex items-center gap-1 px-2 py-0.5 rounded transition-all duration-200 ${
                  isActive
                    ? "bg-pink-500 text-white font-bold shadow-sm shadow-pink-500/40 animate-pulse"
                    : "bg-slate-950/60 text-slate-400 border border-slate-800"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-white" : "bg-slate-600"
                  }`}
                />
                <span className="text-[10px]">{node.label}</span>
              </div>
              {idx < nodes.length - 1 && (
                <span className="text-slate-600 text-[10px]">→</span>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Telemetry Status Items */}
      <div className="flex items-center gap-4 text-slate-400">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-slate-300">Gemini 3.8 Flash</span>
          <span className="text-[10px] text-emerald-400">ONLINE</span>
        </div>

        <div className="hidden sm:flex items-center gap-1.5">
          <Radio className="w-3 h-3 text-sky-400" />
          <span>LPS Routers: Ativos</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <Cpu className="w-3 h-3 text-purple-400" />
          <span>{activeModulesCount} Módulos Injetados</span>
        </div>

        <div className="flex items-center gap-1.5">
          <Zap className="w-3 h-3 text-amber-400" />
          <span>Latência: {lastLatencyMs}ms</span>
        </div>
      </div>
    </div>
  );
};
