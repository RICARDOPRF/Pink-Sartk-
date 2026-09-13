import React, { useRef, useState } from "react";
import {
  Send,
  Paperclip,
  Mic,
  Camera,
  X,
  FileText,
  FileCode,
  Image as ImageIcon,
  Loader2,
  Sparkles,
} from "lucide-react";
import { sfx } from "../services/audioService";

export interface AttachedUserFile {
  id: string;
  name: string;
  size: number;
  type: string;
  content: string; // text content or base64 data url
  isImage: boolean;
}

interface PinkMessageBarProps {
  onSendMessage: (text: string, files: AttachedUserFile[]) => void;
  isLoading: boolean;
  isListening: boolean;
  onToggleMic: () => void;
  onOpenVision: () => void;
  attachedVisionImage: string | null;
  onClearVisionImage: () => void;
}

export const PinkMessageBar: React.FC<PinkMessageBarProps> = ({
  onSendMessage,
  isLoading,
  isListening,
  onToggleMic,
  onOpenVision,
  attachedVisionImage,
  onClearVisionImage,
}) => {
  const [inputText, setInputText] = useState("");
  const [attachedFiles, setAttachedFiles] = useState<AttachedUserFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File processing helper
  const handleProcessFiles = async (fileList: FileList | File[]) => {
    const newFiles: AttachedUserFile[] = [];

    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const isImage = file.type.startsWith("image/");

      try {
        if (isImage) {
          const base64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
          });

          newFiles.push({
            id: `file-${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type,
            content: base64,
            isImage: true,
          });
        } else {
          // Read as text
          const text = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsText(file);
          });

          newFiles.push({
            id: `file-${Date.now()}-${i}`,
            name: file.name,
            size: file.size,
            type: file.type || "text/plain",
            content: text,
            isImage: false,
          });
        }
      } catch (err) {
        console.error("Error reading file:", file.name, err);
      }
    }

    if (newFiles.length > 0) {
      sfx.playChirp(750);
      setAttachedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFiles(e.target.files);
      e.target.value = "";
    }
  };

  const removeFile = (id: string) => {
    sfx.playChirp(500);
    setAttachedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isLoading) return;
    if (!inputText.trim() && attachedFiles.length === 0 && !attachedVisionImage) return;

    onSendMessage(inputText.trim(), attachedFiles);
    setInputText("");
    setAttachedFiles([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div
      className="w-full max-w-3xl mx-auto px-4 pb-6 pt-2 select-none z-30"
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          handleProcessFiles(e.dataTransfer.files);
        }
      }}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.md,.pdf,.csv,.json,.js,.ts,.tsx,.py,.html,.css,.doc,.docx,image/*"
      />

      {/* Drag & drop overlay indicator */}
      {isDragging && (
        <div className="mb-2 p-3 rounded-2xl bg-pink-500/20 border-2 border-dashed border-pink-400 text-center text-xs font-mono text-pink-300 animate-pulse backdrop-blur-md">
          Solte os arquivos aqui para a PINK analisar!
        </div>
      )}

      {/* Attached Files & Camera Snapshots Pills */}
      {(attachedFiles.length > 0 || attachedVisionImage) && (
        <div className="mb-2.5 p-2 rounded-2xl bg-slate-950/90 border border-pink-500/30 backdrop-blur-xl flex flex-wrap gap-2 items-center shadow-lg">
          {/* Attached Camera Vision Frame */}
          {attachedVisionImage && (
            <div className="flex items-center gap-2 pl-1 pr-2 py-1 rounded-xl bg-cyan-950/80 border border-cyan-500/50 text-xs font-mono text-cyan-300">
              <img
                src={attachedVisionImage}
                alt="Visão da câmera"
                className="w-8 h-8 rounded-lg object-cover border border-cyan-400/50"
              />
              <span className="truncate max-w-[140px]">Frame da Câmera</span>
              <button
                type="button"
                onClick={onClearVisionImage}
                className="p-1 text-cyan-400 hover:text-white rounded transition"
                title="Remover frame"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* User Attached Files */}
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-pink-500/40 text-xs font-mono text-slate-200 shadow-sm"
            >
              {file.isImage ? (
                <ImageIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              ) : file.name.endsWith(".json") ||
                file.name.endsWith(".ts") ||
                file.name.endsWith(".py") ? (
                <FileCode className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              ) : (
                <FileText className="w-3.5 h-3.5 text-pink-400 shrink-0" />
              )}
              <span className="truncate max-w-[150px] font-medium" title={file.name}>
                {file.name}
              </span>
              <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(file.id)}
                className="p-0.5 text-slate-400 hover:text-red-400 rounded transition"
                title="Remover arquivo"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <span className="text-[10px] font-mono text-slate-400 ml-auto px-2">
            {attachedFiles.length + (attachedVisionImage ? 1 : 0)} anexo(s)
          </span>
        </div>
      )}

      {/* Main Clean Input Box */}
      <div className="relative flex items-end gap-2 p-2 rounded-2xl bg-slate-950/90 border border-pink-500/30 focus-within:border-pink-500/80 backdrop-blur-2xl transition-all shadow-xl shadow-pink-950/20">
        {/* Attach File Button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2.5 rounded-xl text-slate-400 hover:text-pink-400 hover:bg-slate-900 transition shrink-0"
          title="Colocar arquivos (documentos, códigos, imagens, PDFs)"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        {/* Vision Link / Camera Button */}
        <button
          type="button"
          onClick={() => {
            sfx.playChirp(720);
            onOpenVision();
          }}
          className={`p-2.5 rounded-xl transition shrink-0 ${
            attachedVisionImage
              ? "text-cyan-400 bg-cyan-950/50 border border-cyan-500/40"
              : "text-slate-400 hover:text-pink-400 hover:bg-slate-900"
          }`}
          title="Ativar Câmera para a PINK ver você"
        >
          <Camera className="w-4 h-4" />
        </button>

        {/* Textarea Input */}
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            isListening
              ? "Ouvindo sua voz... pode falar!"
              : attachedFiles.length > 0
              ? "Escreva uma instrução para a PINK sobre os arquivos (ou pressione Enter)..."
              : "Escreva uma mensagem ou solte arquivos aqui para a PINK..."
          }
          rows={1}
          className="flex-1 max-h-32 min-h-[40px] py-2 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none resize-none leading-relaxed"
        />

        {/* Voice Input Button */}
        <button
          type="button"
          onClick={onToggleMic}
          className={`p-2.5 rounded-xl transition shrink-0 ${
            isListening
              ? "bg-amber-500 text-slate-950 animate-pulse shadow-md shadow-amber-500/30"
              : "text-slate-400 hover:text-pink-400 hover:bg-slate-900"
          }`}
          title={isListening ? "Parar de ouvir" : "Falar com a PINK por voz"}
        >
          <Mic className="w-4 h-4" />
        </button>

        {/* Send Button */}
        <button
          type="button"
          onClick={() => handleSubmit()}
          disabled={
            isLoading ||
            (!inputText.trim() && attachedFiles.length === 0 && !attachedVisionImage)
          }
          className="p-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 disabled:opacity-30 disabled:hover:bg-pink-600 text-white transition shrink-0 shadow-md shadow-pink-600/30"
          title="Enviar para a PINK"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Minimal Footer Hint */}
      <div className="flex items-center justify-between mt-2 px-2 text-[10px] font-mono text-slate-500">
        <span>Arraste e solte arquivos aqui para a PINK ler</span>
        <span>Enter para enviar · Shift+Enter para quebra de linha</span>
      </div>
    </div>
  );
};
