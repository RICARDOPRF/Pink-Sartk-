import React, { useState } from "react";
import { FriendAiFile } from "../types";
import {
  FileCode2,
  Upload,
  Plus,
  CheckCircle2,
  XCircle,
  FileText,
  Sparkles,
  Trash2,
  Copy,
  Download,
  Eye,
  Search,
  Cpu,
  BrainCircuit,
  FileJson,
  Layers,
} from "lucide-react";
import { analyzeAiFile } from "../services/aiService";
import { sfx } from "../services/audioService";

interface FriendFilesManagerProps {
  files: FriendAiFile[];
  onToggleFile: (id: string) => void;
  onAddFile: (file: FriendAiFile) => void;
  onDeleteFile: (id: string) => void;
  onUpdateFile: (file: FriendAiFile) => void;
}

export const FriendFilesManager: React.FC<FriendFilesManagerProps> = ({
  files,
  onToggleFile,
  onAddFile,
  onDeleteFile,
  onUpdateFile,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [viewingFile, setViewingFile] = useState<FriendAiFile | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  // New file form state
  const [newName, setNewName] = useState("");
  const [newAuthor, setNewAuthor] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState<FriendAiFile["category"]>("protocol");
  const [newContent, setNewContent] = useState("");

  const filteredFiles = files.filter((file) => {
    const matchesSearch =
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
      file.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === "all" || file.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const activeCount = files.filter((f) => f.active).length;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = e.target.files;
    if (!uploadedFiles || uploadedFiles.length === 0) return;

    Array.from(uploadedFiles).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = (event.target?.result as string) || "";
        const isJson = file.name.endsWith(".json");
        const category: FriendAiFile["category"] = isJson
          ? "protocol"
          : file.name.includes("prompt")
          ? "prompt"
          : file.name.includes("memoria") || file.name.includes("memory")
          ? "memory"
          : "personality";

        const newFile: FriendAiFile = {
          id: `file-custom-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          name: file.name,
          author: "Arquivo de Amigo",
          description: `Importado de ${file.name} (${(file.size / 1024).toFixed(1)} KB)`,
          category,
          content: text,
          active: true,
          size: file.size,
          updatedAt: "Agora",
          isPreloaded: false,
        };

        onAddFile(newFile);
        sfx.playSuccess();
      };
      reader.readAsText(file);
    });

    e.target.value = "";
  };

  const handleCreateManual = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newContent.trim()) return;

    const file: FriendAiFile = {
      id: `file-manual-${Date.now()}`,
      name: newName.endsWith(".json") || newName.endsWith(".txt") || newName.endsWith(".md")
        ? newName
        : `${newName}.md`,
      author: newAuthor.trim() || "Você & Amigos",
      description: newDesc.trim() || "Protocolo personalizado inserido no estúdio",
      category: newCategory,
      content: newContent,
      active: true,
      size: newContent.length,
      updatedAt: "Agora",
      isPreloaded: false,
    };

    onAddFile(file);
    setIsCreating(false);
    setNewName("");
    setNewAuthor("");
    setNewDesc("");
    setNewContent("");
    sfx.playSuccess();
  };

  const handleAnalyzeWithAI = async (file: FriendAiFile) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    sfx.playScanBeep();
    try {
      const res = await analyzeAiFile(file.name, file.content);
      setAnalysisResult(res.summary);
      sfx.playSuccess();
    } catch {
      setAnalysisResult("Falha ao analisar arquivo via IA.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const exportAllFiles = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(files, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `pink_jarvis_amigos_arquivos_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    sfx.playChirp(900);
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "protocol":
        return <Cpu className="w-4 h-4 text-sky-400" />;
      case "personality":
        return <BrainCircuit className="w-4 h-4 text-pink-400" />;
      case "memory":
        return <Layers className="w-4 h-4 text-amber-400" />;
      case "tool":
        return <Sparkles className="w-4 h-4 text-emerald-400" />;
      default:
        return <FileCode2 className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900/60 rounded-2xl border border-slate-800 backdrop-blur-xl p-5 shadow-2xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <BrainCircuit className="w-5 h-5 text-pink-400" />
              Arquivos de IA dos Amigos & Protocolos
            </h2>
            <span className="px-2 py-0.5 text-xs font-mono rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">
              {activeCount} de {files.length} ativos
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Módulos, prompts de sistema, instruções do JARVIS e arquivos de contexto compartilhados.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* File Upload Input */}
          <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium transition shadow-sm">
            <Upload className="w-3.5 h-3.5" />
            <span>Subir Arquivo de Amigo</span>
            <input
              type="file"
              multiple
              accept=".json,.txt,.md,.js,.py,.yaml,.csv"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>

          {/* New manual file */}
          <button
            onClick={() => {
              setIsCreating(true);
              sfx.playChirp(700);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Criar Módulo</span>
          </button>

          {/* Export button */}
          <button
            onClick={exportAllFiles}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
            title="Exportar pacote de arquivos"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Search & Category Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 my-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar arquivo por nome, autor ou palavra-chave..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-slate-950/70 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-pink-500/60"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto text-xs font-mono">
          {[
            { id: "all", label: "Todos" },
            { id: "protocol", label: "Protocolos JARVIS" },
            { id: "personality", label: "Personalidades" },
            { id: "memory", label: "Memórias" },
            { id: "prompt", label: "Prompts de Código" },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSelectedCategory(cat.id);
                sfx.playChirp(600);
              }}
              className={`px-2.5 py-1 rounded-md transition whitespace-nowrap ${
                selectedCategory === cat.id
                  ? "bg-pink-500/20 text-pink-300 border border-pink-500/40"
                  : "text-slate-400 hover:text-slate-200 bg-slate-950/40"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* File List Grid */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 min-h-[220px]">
        {filteredFiles.length === 0 ? (
          <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-800 rounded-xl p-6 text-center text-slate-400">
            <FileCode2 className="w-8 h-8 text-slate-600 mb-2" />
            <p className="text-sm font-medium">Nenhum arquivo encontrado</p>
            <p className="text-xs text-slate-500 mt-1">
              Suba arquivos enviados por amigos (.json, .txt, .md) ou crie um novo protocolo.
            </p>
          </div>
        ) : (
          filteredFiles.map((file) => (
            <div
              key={file.id}
              className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                file.active
                  ? "bg-slate-950/70 border-pink-500/30 shadow-sm"
                  : "bg-slate-950/30 border-slate-800/80 opacity-70"
              } hover:border-slate-700`}
            >
              <div className="flex items-start gap-3 min-w-0 flex-1">
                <button
                  onClick={() => {
                    onToggleFile(file.id);
                    sfx.playChirp(file.active ? 440 : 880);
                  }}
                  className="mt-1 transition"
                  title={file.active ? "Desativar este arquivo" : "Ativar este arquivo"}
                >
                  {file.active ? (
                    <CheckCircle2 className="w-5 h-5 text-pink-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-slate-600 hover:text-slate-400" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400">{getCategoryIcon(file.category)}</span>
                    <span className="font-mono text-sm font-semibold text-slate-100 truncate">
                      {file.name}
                    </span>
                    {file.isPreloaded && (
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 border border-sky-500/30">
                        Protocolo Integrado
                      </span>
                    )}
                    <span className="text-[11px] text-slate-400 font-mono">
                      por <strong className="text-slate-300">{file.author}</strong>
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-1 line-clamp-1">{file.description}</p>

                  <div className="flex items-center gap-3 mt-1.5 text-[11px] font-mono text-slate-500">
                    <span>Tamanho: {(file.size / 1024).toFixed(1)} KB</span>
                    <span>•</span>
                    <span>Atualizado: {file.updatedAt}</span>
                    <span>•</span>
                    <span className={file.active ? "text-emerald-400" : "text-slate-500"}>
                      {file.active ? "● Injetado no Gemini" : "○ Inativo"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 ml-3">
                <button
                  onClick={() => {
                    setViewingFile(file);
                    setAnalysisResult(null);
                    sfx.playChirp(750);
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-pink-300 hover:bg-slate-800 transition"
                  title="Visualizar e analisar arquivo"
                >
                  <Eye className="w-4 h-4" />
                </button>

                {!file.isPreloaded && (
                  <button
                    onClick={() => {
                      onDeleteFile(file.id);
                      sfx.playChirp(350);
                    }}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-red-400 hover:bg-slate-800 transition"
                    title="Excluir arquivo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Viewing & Editing Modal */}
      {viewingFile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <FileCode2 className="w-4 h-4 text-pink-400" />
                  <h3 className="font-mono text-base font-bold text-white">{viewingFile.name}</h3>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Autor: {viewingFile.author} • {viewingFile.description}
                </p>
              </div>
              <button
                onClick={() => setViewingFile(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* AI Analysis Bar */}
            <div className="p-3 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between gap-3">
              <div className="flex-1 text-xs text-slate-300">
                {isAnalyzing ? (
                  <span className="flex items-center gap-2 text-pink-400 animate-pulse font-mono">
                    <Sparkles className="w-3.5 h-3.5" /> Analisando protocolo com Gemini 3.8...
                  </span>
                ) : analysisResult ? (
                  <div className="text-emerald-300 bg-emerald-950/40 p-2 rounded border border-emerald-800/60">
                    <strong>Resumo da IA:</strong> {analysisResult}
                  </div>
                ) : (
                  <span>Clique ao lado para a IA analisar a finalidade deste arquivo de amigo.</span>
                )}
              </div>
              <button
                onClick={() => handleAnalyzeWithAI(viewingFile)}
                disabled={isAnalyzing}
                className="flex items-center gap-1 px-3 py-1 rounded bg-pink-600 hover:bg-pink-500 disabled:opacity-50 text-white text-xs font-medium font-mono whitespace-nowrap transition shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Analisar c/ IA
              </button>
            </div>

            {/* Content Display/Editor */}
            <div className="flex-1 p-4 overflow-y-auto">
              <label className="block text-xs font-mono text-slate-400 mb-1.5">
                Conteúdo do Arquivo (Prompt / Código / Instrução):
              </label>
              <textarea
                value={viewingFile.content}
                onChange={(e) => {
                  const updated = { ...viewingFile, content: e.target.value, size: e.target.value.length };
                  setViewingFile(updated);
                  onUpdateFile(updated);
                }}
                rows={12}
                className="w-full font-mono text-xs p-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 focus:outline-none focus:border-pink-500/60 leading-relaxed resize-none"
              />
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(viewingFile.content);
                  sfx.playChirp(880);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition"
              >
                <Copy className="w-3.5 h-3.5" />
                Copiar Conteúdo
              </button>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onToggleFile(viewingFile.id);
                    setViewingFile({ ...viewingFile, active: !viewingFile.active });
                    sfx.playChirp(viewingFile.active ? 440 : 880);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition ${
                    viewingFile.active
                      ? "bg-pink-600 text-white hover:bg-pink-500"
                      : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                  }`}
                >
                  {viewingFile.active ? "Ativo no Gemini ✓" : "Ativar no Gemini"}
                </button>
                <button
                  onClick={() => setViewingFile(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Manual File Modal */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form
            onSubmit={handleCreateManual}
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-xl w-full p-5 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-base text-white flex items-center gap-2">
                <Plus className="w-4 h-4 text-pink-400" />
                Novo Módulo / Protocolo de IA
              </h3>
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Nome do Arquivo</label>
                <input
                  type="text"
                  placeholder="ex: jarvis_subrotina_v2.json"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  required
                  className="w-full p-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Autor / Amigo</label>
                <input
                  type="text"
                  placeholder="ex: Lucas ou Discord Stark"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Categoria</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full p-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500 font-mono"
                >
                  <option value="protocol">Protocolo</option>
                  <option value="personality">Personalidade</option>
                  <option value="memory">Memória</option>
                  <option value="prompt">Prompt de Código</option>
                  <option value="tool">Ferramenta</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Breve Descrição</label>
                <input
                  type="text"
                  placeholder="ex: Regras para diagnóstico tático"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full p-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">
                Conteúdo / Prompt / Instruções do Arquivo
              </label>
              <textarea
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={6}
                required
                placeholder="Cole as instruções de sistema, formato JSON ou prompt que seu amigo te enviou..."
                className="w-full p-3 font-mono text-xs rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-pink-500 resize-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-pink-600 hover:bg-pink-500 text-white text-xs font-medium shadow"
              >
                Salvar Módulo e Ativar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
