import React, { useState, useEffect } from "react";
import {
  ExternalLink,
  RefreshCw,
  Code2,
  Play,
  Monitor,
  Maximize2,
  Copy,
  Check,
  Zap,
  Activity,
  Gauge,
  Flame,
  Factory,
  Database,
} from "lucide-react";
import { sfx } from "../services/audioService";

interface LivePreviewSandboxProps {
  customHtml?: string | null;
  activeBrain: string;
}

export const LivePreviewSandbox: React.FC<LivePreviewSandboxProps> = ({
  customHtml,
  activeBrain,
}) => {
  const [viewMode, setViewMode] = useState<"preview" | "code">("preview");
  const [copied, setCopied] = useState(false);
  const [activeDemo, setActiveDemo] = useState<"beccs" | "forno" | "vendas" | "jarvis">("beccs");
  const [key, setKey] = useState(0);

  // Pre-configured operational interfaces based on user's Pink LPS Studio & JARVIS
  const getDemoHtml = (demo: "beccs" | "forno" | "vendas" | "jarvis") => {
    if (demo === "beccs") {
      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #020617; color: #f8fafc; font-family: ui-sans-serif, system-ui; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div class="flex items-center gap-3">
        <span class="w-3 h-3 rounded-full bg-emerald-400 animate-ping"></span>
        <div>
          <h1 class="text-xl font-bold text-white tracking-wide">PAINEL DE BORDO BECCS · LPS</h1>
          <p class="text-xs text-slate-400">Bioenergy with Carbon Capture and Storage · Unidade 01</p>
        </div>
      </div>
      <span class="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-mono">
        STATUS: OPERAÇÃO NOMINAL
      </span>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Captura de CO2</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">1.482 <span class="text-xs text-slate-400 font-normal">ton/dia</span></p>
        <p class="text-[11px] text-emerald-500 mt-2 font-mono">↑ 4.2% vs meta</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Geração Líquida</p>
        <p class="text-2xl font-bold text-sky-400 mt-1">28.4 <span class="text-xs text-slate-400 font-normal">MW/h</span></p>
        <p class="text-[11px] text-sky-400 mt-2 font-mono">Rede sincronizada</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Eficiência Térmica</p>
        <p class="text-2xl font-bold text-amber-400 mt-1">94.7%</p>
        <p class="text-[11px] text-slate-400 mt-2 font-mono">Caldeira Biomassa B3</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900/90 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">IA Pink Supervisor</p>
        <p class="text-2xl font-bold text-pink-400 mt-1">Ativa</p>
        <p class="text-[11px] text-pink-300 mt-2 font-mono">Otimização em tempo real</p>
      </div>
    </div>

    <div class="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
      <h3 class="text-sm font-semibold text-slate-200">Fluxo de Reação de Pirólise & Absorção Química</h3>
      <div class="w-full bg-slate-950 h-3 rounded-full overflow-hidden flex">
        <div class="bg-emerald-500 h-full" style="width: 65%"></div>
        <div class="bg-sky-500 h-full" style="width: 25%"></div>
        <div class="bg-amber-500 h-full" style="width: 10%"></div>
      </div>
      <div class="flex justify-between text-xs font-mono text-slate-400">
        <span>Filtro Amina: 65%</span>
        <span>Compressão Criogênica: 25%</span>
        <span>Injeção Geológica: 10%</span>
      </div>
    </div>
  </div>
</body>
</html>`;
    }

    if (demo === "forno") {
      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #0b0f19; color: #f8fafc; font-family: ui-sans-serif, system-ui; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div>
        <h1 class="text-xl font-bold text-white tracking-wide">PAINEL DE BORDO · FORNO PANELA LPS</h1>
        <p class="text-xs text-slate-400">Metalurgia Secundária & Controle Térmico</p>
      </div>
      <span class="px-3 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 rounded-full text-xs font-mono">
        CORRIDA #4829 · EM AQUECIMENTO
      </span>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Temperatura do Banho</p>
        <p class="text-3xl font-extrabold text-amber-500 mt-1">1.614 °C</p>
        <p class="text-xs text-slate-400 mt-1">Alvo: 1.620 °C (+6 °C)</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Potência de Arco</p>
        <p class="text-3xl font-extrabold text-sky-400 mt-1">18.2 MW</p>
        <p class="text-xs text-slate-400 mt-1">Três eletrodos simétricos</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Consumo Específico</p>
        <p class="text-3xl font-extrabold text-pink-400 mt-1">42 kWh/t</p>
        <p class="text-xs text-emerald-400 mt-1">Eficiência de classe mundial</p>
      </div>
    </div>
  </div>
</body>
</html>`;
    }

    if (demo === "vendas") {
      return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #030712; color: #f8fafc; font-family: ui-sans-serif, system-ui; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-slate-800">
      <div>
        <h1 class="text-xl font-bold text-white tracking-wide">PRAIA & MOVIMENTO · VENDAS DIÁRIAS</h1>
        <p class="text-xs text-slate-400">Monitor de Operações de Varejo em Tempo Real</p>
      </div>
      <span class="px-3 py-1 bg-pink-500/20 text-pink-300 border border-pink-500/30 rounded-full text-xs font-mono">
        LOJA ONLINE & PDV INTEGRADOS
      </span>
    </div>

    <div class="grid grid-cols-3 gap-4">
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Faturamento Hoje</p>
        <p class="text-3xl font-bold text-pink-400 mt-1">R$ 14.890</p>
        <p class="text-xs text-emerald-400 mt-1">↑ 18% vs média semanal</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Ticket Médio</p>
        <p class="text-3xl font-bold text-sky-400 mt-1">R$ 186,00</p>
        <p class="text-xs text-slate-400 mt-1">80 pedidos processados</p>
      </div>
      <div class="p-4 rounded-xl bg-slate-900 border border-slate-800">
        <p class="text-xs text-slate-400 font-mono">Conversão Web</p>
        <p class="text-3xl font-bold text-emerald-400 mt-1">4.6%</p>
        <p class="text-xs text-slate-400 mt-1">Pico de tráfego às 14h</p>
      </div>
    </div>
  </div>
</body>
</html>`;
    }

    // JARVIS Stark Telemetry
    return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    body { background-color: #020617; color: #38bdf8; font-family: ui-monospace, monospace; }
  </style>
</head>
<body class="p-6">
  <div class="max-w-4xl mx-auto space-y-6">
    <div class="flex items-center justify-between pb-4 border-b border-sky-900/60">
      <div>
        <h1 class="text-xl font-bold text-sky-300 tracking-wider">J.A.R.V.I.S. // STARK TELEMETRY HUD</h1>
        <p class="text-xs text-sky-500">DIRETRIZ DE DEFESA & SISTEMAS PROPULSORES</p>
      </div>
      <span class="px-3 py-1 bg-sky-950 text-sky-300 border border-sky-500/50 rounded text-xs font-mono">
        REATOR ARC: 100% NOMINAL
      </span>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="p-4 rounded bg-slate-950 border border-sky-900">
        <p class="text-xs text-sky-500">FLUXO DE PLASMA</p>
        <p class="text-2xl font-bold text-sky-300 mt-1">3.84 GJ</p>
      </div>
      <div class="p-4 rounded bg-slate-950 border border-sky-900">
        <p class="text-xs text-sky-500">BLINDAGEM OURO-TITÂNIO</p>
        <p class="text-2xl font-bold text-amber-400 mt-1">99.8%</p>
      </div>
      <div class="p-4 rounded bg-slate-950 border border-sky-900">
        <p class="text-xs text-sky-500">IA SUB-ROTINAS</p>
        <p class="text-2xl font-bold text-emerald-400 mt-1">8/8 OK</p>
      </div>
      <div class="p-4 rounded bg-slate-950 border border-sky-900">
        <p class="text-xs text-sky-500">LINK SATELITAL</p>
        <p class="text-2xl font-bold text-sky-400 mt-1">0.12 ms</p>
      </div>
    </div>
  </div>
</body>
</html>`;
  };

  const currentContent = customHtml || getDemoHtml(activeDemo);

  const handleCopy = () => {
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    sfx.playChirp(880);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl p-4 shadow-2xl overflow-hidden">
      {/* Top Browser / Sandbox Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        {/* Traffic lights & URL address bar */}
        <div className="flex items-center gap-3 flex-1 min-w-[240px]">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
          </div>

          <div className="flex-1 max-w-sm px-3 py-1 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between truncate">
            <span className="truncate text-pink-400 font-medium">
              preview.pink.local
              <span className="text-slate-500">
                {customHtml ? "/ai-generated-runtime" : `/${activeDemo}-dashboard`}
              </span>
            </span>
            <span className="text-[10px] text-emerald-400 ml-2">● LIVE</span>
          </div>
        </div>

        {/* Action controls */}
        <div className="flex items-center gap-2">
          {/* Quick presets (if no custom html is running) */}
          {!customHtml && (
            <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => {
                  setActiveDemo("beccs");
                  sfx.playChirp(600);
                }}
                className={`px-2 py-0.5 rounded transition ${
                  activeDemo === "beccs"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                BECCS
              </button>
              <button
                onClick={() => {
                  setActiveDemo("forno");
                  sfx.playChirp(650);
                }}
                className={`px-2 py-0.5 rounded transition ${
                  activeDemo === "forno"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Forno Panela
              </button>
              <button
                onClick={() => {
                  setActiveDemo("vendas");
                  sfx.playChirp(700);
                }}
                className={`px-2 py-0.5 rounded transition ${
                  activeDemo === "vendas"
                    ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                Vendas
              </button>
              <button
                onClick={() => {
                  setActiveDemo("jarvis");
                  sfx.playChirp(750);
                }}
                className={`px-2 py-0.5 rounded transition ${
                  activeDemo === "jarvis"
                    ? "bg-sky-500/20 text-sky-300 border border-sky-500/40"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                JARVIS HUD
              </button>
            </div>
          )}

          {/* Toggle View Mode */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => {
                setViewMode("preview");
                sfx.playChirp(650);
              }}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                viewMode === "preview"
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              Preview
            </button>
            <button
              onClick={() => {
                setViewMode("code");
                sfx.playChirp(650);
              }}
              className={`px-2.5 py-1 rounded flex items-center gap-1 transition ${
                viewMode === "code"
                  ? "bg-pink-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              Código
            </button>
          </div>

          <button
            onClick={() => {
              setKey((prev) => prev + 1);
              sfx.playScanBeep();
            }}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Recarregar preview"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Copiar código"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Main Sandbox Window */}
      <div className="flex-1 mt-3 rounded-xl border border-slate-800/80 bg-slate-950 overflow-hidden relative min-h-[350px]">
        {viewMode === "preview" ? (
          <iframe
            key={key}
            title="Pink LPS Live Sandbox"
            srcDoc={currentContent}
            sandbox="allow-scripts"
            className="w-full h-full border-0 bg-slate-950"
          />
        ) : (
          <div className="w-full h-full p-4 overflow-auto font-mono text-xs text-slate-300 bg-slate-950 leading-relaxed selection:bg-pink-500 selection:text-white">
            <pre>{currentContent}</pre>
          </div>
        )}
      </div>

      {/* Footnote */}
      <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-2 px-1">
        <span>Ambiente isolado · Renderização em tempo real</span>
        <span>Peça para a IA gerar qualquer painel ou código para visualizar aqui</span>
      </div>
    </div>
  );
};
