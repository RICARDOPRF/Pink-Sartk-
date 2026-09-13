import React, { useState, useEffect } from "react";
import { JARVIS_AGENTS_LIST, JARVIS_TOOLS_LIST } from "../data/jarvisData";
import { JarvisSubAgent, JarvisToolItem } from "../types";
import {
  Cpu,
  Shield,
  Search,
  Zap,
  HardDrive,
  Eye,
  Code2,
  Activity,
  Terminal,
  Play,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
  ChevronRight,
} from "lucide-react";
import { sfx } from "../services/audioService";

interface JarvisAgentNetworkProps {
  onExecuteToolPrompt?: (prompt: string) => void;
}

export const JarvisAgentNetwork: React.FC<JarvisAgentNetworkProps> = ({
  onExecuteToolPrompt,
}) => {
  const [selectedAgent, setSelectedAgent] = useState<JarvisSubAgent>(JARVIS_AGENTS_LIST[0]);
  const [activeObjectiveIndex, setActiveObjectiveIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeLog, setActiveLog] = useState<string[]>([
    "16:04  Core cycle completed // systems nominal",
    "16:03  Episodic memory synchronized to context graph",
    "16:02  Perimeter threat vectors scanned: 0 vulnerabilities",
    "16:01  Neural pathway calibrated with Gemini Flash",
    "16:00  Autonomous tools catalog registered [28 tools]",
  ]);

  // Rotate objectives every few seconds like in ui.py
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveObjectiveIndex((prev) => (prev + 1) % selectedAgent.objectives.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [selectedAgent]);

  // Periodic simulated telemetry log like _push_log() in ui.py
  useEffect(() => {
    const logInterval = setInterval(() => {
      const logs = [
        "Memory synchronized: cluster 4 ready",
        "Threat scan complete: zero anomalies",
        "Vision alignment verified: 60 FPS",
        "Task pipeline flushed & ready",
        "Dev agent AST parser initialized",
        "Knowledge base embeddings updated",
      ];
      const now = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const randomLog = logs[Math.floor(Math.random() * logs.length)];
      setActiveLog((prev) => [`${now}  ${randomLog}`, ...prev.slice(0, 7)]);
    }, 6000);
    return () => clearInterval(logInterval);
  }, []);

  const filteredTools = JARVIS_TOOLS_LIST.filter((tool) => {
    const matchesCat = selectedCategory === "all" || tool.category === selectedCategory;
    const matchesSearch =
      tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const getAgentIcon = (name: string) => {
    switch (name) {
      case "CORE":
        return <Cpu className="w-4 h-4 text-cyan-400" />;
      case "RESEARCH":
        return <Search className="w-4 h-4 text-cyan-400" />;
      case "SECURITY":
        return <Shield className="w-4 h-4 text-blue-400" />;
      case "AUTOMATION":
        return <Zap className="w-4 h-4 text-amber-400" />;
      case "MEMORY":
        return <HardDrive className="w-4 h-4 text-purple-400" />;
      case "VISION":
        return <Eye className="w-4 h-4 text-emerald-400" />;
      case "DEV":
        return <Code2 className="w-4 h-4 text-slate-300" />;
      case "SYSTEM":
        return <Activity className="w-4 h-4 text-teal-400" />;
      default:
        return <Terminal className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-4 animate-in fade-in duration-300 font-mono">
      {/* Top Banner: Cognitive Network Overview */}
      <div className="p-4 rounded-2xl bg-[#00080F] border border-[#0A2535] shadow-xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#0A2535] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00E5FF] animate-pulse" />
            <div>
              <span className="text-[10px] text-[#3A9AB0] tracking-widest block uppercase">
                Cognitive Network // Mark XXXIX
              </span>
              <h2 className="text-sm font-bold text-[#E8F8FF] tracking-wider">
                REDE DE 8 SUB-AGENTES & 28 FERRAMENTAS OFICIAIS
              </h2>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="px-2.5 py-1 rounded-full bg-[#000C18] border border-[#1A5C7A] text-[#00E5FF]">
              8/8 AGENTES ATIVOS
            </span>
            <span className="px-2.5 py-1 rounded-full bg-[#000C18] border border-[#1A5C7A] text-[#00FF88]">
              28 TOOLS REGISTRADAS
            </span>
          </div>
        </div>

        {/* 8 Autonomous Sub-Agents Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 mt-3">
          {JARVIS_AGENTS_LIST.map((agent) => {
            const isSelected = selectedAgent.name === agent.name;
            return (
              <button
                key={agent.name}
                onClick={() => {
                  setSelectedAgent(agent);
                  setActiveObjectiveIndex(0);
                  sfx.playChirp(820);
                }}
                className={`p-2.5 rounded-xl border text-left transition relative flex flex-col justify-between ${
                  isSelected
                    ? "bg-[#001520] border-[#00E5FF] shadow-md shadow-[#00C8FF]/20"
                    : "bg-[#000408] border-[#0A2535] hover:border-[#1A5C7A] text-slate-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {getAgentIcon(agent.name)}
                    <span
                      className="font-bold text-xs"
                      style={{ color: isSelected ? agent.accent : "#8ab8cc" }}
                    >
                      {agent.name}
                    </span>
                  </div>
                  <span
                    className="text-[9px] px-1 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: `${agent.accent}22`,
                      color: agent.accent,
                    }}
                  >
                    {agent.status}
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 truncate">
                  Confiança: {(agent.confidence * 100).toFixed(0)}%
                </div>
                {isSelected && (
                  <div className="w-full h-0.5 bg-[#00E5FF] mt-1.5 rounded-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Focus Agent Objective Card */}
        <div className="mt-3 p-3 rounded-xl bg-[#000408] border border-[#0A2535] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-[#00E5FF] font-bold text-sm">
              [{selectedAgent.name}]
            </span>
            <span className="text-[#3A9AB0]">Objetivo Atual:</span>
            <span className="text-[#E8F8FF] font-medium bg-[#000C18] px-2 py-0.5 rounded border border-[#1A5C7A]">
              {selectedAgent.objectives[activeObjectiveIndex]}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-[#3A9AB0]">
            <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span>Ciclo Neural: 16ms (60 FPS)</span>
          </div>
        </div>
      </div>

      {/* Main Bottom Section: 2 Columns (Live Event Telemetry + 28 Tools Catalog) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left: Live Telemetry Event Log (4 cols) */}
        <div className="lg:col-span-4 p-4 rounded-2xl bg-[#00080F] border border-[#0A2535] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#0A2535] pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#00C8FF]" />
                <h3 className="text-xs font-bold text-[#E8F8FF] tracking-wider uppercase">
                  Live Event Stream
                </h3>
              </div>
              <span className="text-[10px] text-[#00FF88] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-ping" />
                STREAMING
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {activeLog.map((log, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-lg bg-[#000408] border border-[#0A2535]/80 text-[#8ab8cc] text-[11px] flex items-start gap-2"
                >
                  <ChevronRight className="w-3 h-3 text-[#00C8FF] shrink-0 mt-0.5" />
                  <span className="font-mono leading-relaxed">{log}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#0A2535] text-[11px] text-[#3A9AB0] flex items-center justify-between">
            <span>Orquestrador:</span>
            <span className="text-[#00E5FF] font-bold">JARVIS Mark XXXIX</span>
          </div>
        </div>

        {/* Right: 28 Tools Catalog with Execution and Filters (8 cols) */}
        <div className="lg:col-span-8 p-4 rounded-2xl bg-[#00080F] border border-[#0A2535] flex flex-col">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#0A2535] pb-3 mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#00C8FF]" />
              <h3 className="text-xs font-bold text-[#E8F8FF] tracking-wider uppercase">
                Catálogo de Ferramentas ({filteredTools.length})
              </h3>
            </div>

            {/* Filter buttons */}
            <div className="flex flex-wrap gap-1 text-[11px]">
              {["all", "research", "automation", "system", "communication", "vision"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    setSelectedCategory(cat);
                    sfx.playChirp(700);
                  }}
                  className={`px-2 py-0.5 rounded-md uppercase transition text-[10px] ${
                    selectedCategory === cat
                      ? "bg-[#00C8FF] text-black font-bold"
                      : "bg-[#000408] text-slate-400 hover:text-white border border-[#0A2535]"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Search bar */}
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar por nome ou funcionalidade..."
            className="w-full mb-3 px-3 py-1.5 rounded-lg bg-[#000408] border border-[#0A2535] text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-[#00C8FF]"
          />

          {/* Tools Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-[360px] overflow-y-auto pr-1">
            {filteredTools.map((tool) => (
              <div
                key={tool.name}
                className="p-3 rounded-xl bg-[#000408] border border-[#0A2535] hover:border-[#1A5C7A] transition flex flex-col justify-between gap-2"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-bold text-[#00E5FF]">
                      {tool.name}()
                    </span>
                    <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-[#000C18] text-[#3A9AB0] border border-[#0A2535]">
                      {tool.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    {tool.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#0A2535] flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-500 truncate max-w-[170px]" title={tool.sampleCall}>
                    {tool.sampleCall}
                  </span>
                  {onExecuteToolPrompt && (
                    <button
                      onClick={() => {
                        onExecuteToolPrompt(
                          `J.A.R.V.I.S., por favor execute o protocolo da ferramenta '${tool.name}' com os parâmetros recomendados: ${tool.sampleCall}`
                        );
                        sfx.playChirp(850);
                      }}
                      className="px-2 py-1 rounded bg-[#001520] hover:bg-[#002535] text-[#00E5FF] border border-[#00C8FF]/40 text-[10px] font-bold flex items-center gap-1 transition"
                    >
                      <Play className="w-2.5 h-2.5" />
                      Testar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
