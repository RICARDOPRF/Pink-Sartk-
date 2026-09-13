import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  CameraOff,
  Maximize2,
  Minimize2,
  X,
  Eye,
  RefreshCw,
  Monitor,
  Sparkles,
  Zap,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { sfx } from "../services/audioService";

interface VisionLinkModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCaptureSnapshot: (dataUrl: string) => void;
  onAnalyzeDirectly: (dataUrl: string, promptText: string) => void;
  isAnalyzing?: boolean;
}

export const VisionLinkModal: React.FC<VisionLinkModalProps> = ({
  isOpen,
  onClose,
  onCaptureSnapshot,
  onAnalyzeDirectly,
  isAnalyzing = false,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [feedSource, setFeedSource] = useState<"camera" | "screen">("camera");
  const [permissionError, setPermissionError] = useState<string | null>(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [fps, setFps] = useState(30);
  const [lastCapturedPreview, setLastCapturedPreview] = useState<string | null>(null);
  const [scanEffectActive, setScanEffectActive] = useState(true);

  // Start media stream
  const startStream = useCallback(async (source: "camera" | "screen") => {
    setPermissionError(null);
    try {
      // Stop previous stream if any
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      let newStream: MediaStream;
      if (source === "camera") {
        newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: false,
        });
      } else {
        newStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        });
      }

      setStream(newStream);
      setFeedSource(source);
      sfx.playChirp(880);

      if (videoRef.current) {
        videoRef.current.srcObject = newStream;
        videoRef.current.play().catch(console.error);
      }
    } catch (err: any) {
      console.error("Erro ao acessar sensor de visão:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        setPermissionError("Permissão de câmera negada no navegador. Permita o acesso nas configurações do site para que o JARVIS possa vê-lo.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        setPermissionError("Nenhuma câmera física detectada no dispositivo.");
      } else {
        setPermissionError(`Falha ao inicializar o sensor óptico: ${err.message || "Erro desconhecido"}`);
      }
    }
  }, [stream]);

  // Stop media stream
  const stopStream = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  // Initialize on modal open
  useEffect(() => {
    if (isOpen) {
      startStream("camera");
    } else {
      stopStream();
    }
    return () => {
      stopStream();
    };
  }, [isOpen]);

  // Ensure video element plays when stream updates
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(console.error);
    }
  }, [stream]);

  // Capture frame as Base64 JPEG
  const captureCurrentFrame = (): string | null => {
    if (!videoRef.current || !canvasRef.current) return null;
    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.85);
    setLastCapturedPreview(dataUrl);
    return dataUrl;
  };

  const handleInspectWithJarvis = () => {
    const frame = captureCurrentFrame();
    if (!frame) return;
    sfx.playChirp(950);
    onAnalyzeDirectly(
      frame,
      "J.A.R.V.I.S., ative o sensor óptico. Olhe para mim através da câmera e descreva detalhadamente o que você vê agora: quem está na frente da câmera, expressão facial, ambiente ao redor e quaisquer detalhes perceptíveis."
    );
  };

  const handleCaptureAndAttach = () => {
    const frame = captureCurrentFrame();
    if (!frame) return;
    sfx.playChirp(800);
    onCaptureSnapshot(frame);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed z-50 transition-all font-mono select-none ${
        isMinimized
          ? "bottom-4 right-4 w-72 h-44 shadow-2xl rounded-2xl"
          : "inset-0 md:inset-auto md:bottom-6 md:right-6 md:w-[440px] md:h-[530px] shadow-2xl rounded-2xl"
      }`}
    >
      {/* Hidden processing canvas for frame grabbing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Main Glass HUD Container */}
      <div className="w-full h-full bg-[#00080F]/95 border border-[#1A5C7A] rounded-2xl shadow-2xl shadow-[#00C8FF]/20 flex flex-col overflow-hidden backdrop-blur-md">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#000C18] border-b border-[#0A2535]">
          <div className="flex items-center gap-2">
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                stream ? "bg-[#00FF88] animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-xs font-bold text-[#E8F8FF] tracking-wider flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-[#00C8FF]" />
              VISION LINK // {feedSource === "camera" ? "CAMERA FEED" : "SCREEN FEED"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition"
              title={isMinimized ? "Maximizar HUD" : "Minimizar"}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={() => {
                stopStream();
                onClose();
                sfx.playChirp(500);
              }}
              className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
              title="Fechar câmera"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Video Viewport with HUD Overlay */}
        <div className="relative flex-1 bg-black flex items-center justify-center overflow-hidden">
          {permissionError ? (
            <div className="p-4 text-center flex flex-col items-center gap-2 text-xs">
              <AlertTriangle className="w-8 h-8 text-amber-400" />
              <p className="text-amber-200 font-sans leading-relaxed">{permissionError}</p>
              <button
                onClick={() => startStream("camera")}
                className="mt-2 px-3 py-1.5 rounded-lg bg-[#001520] hover:bg-[#002535] text-[#00E5FF] border border-[#00E5FF]/40 text-xs font-bold transition"
              >
                Tentar Novamente
              </button>
            </div>
          ) : (
            <>
              {/* Video Element */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover ${
                  feedSource === "camera" ? "scale-x-[-1]" : ""
                }`}
              />

              {/* HUD Sci-Fi Brackets and Crosshairs */}
              <div className="absolute inset-3 pointer-events-none border border-[#00E5FF]/20 rounded-xl">
                {/* 4 Corner Tech Marks */}
                <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#00C8FF]" />
                <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#00C8FF]" />
                <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#00C8FF]" />
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#00C8FF]" />

                {/* Target Scanning Center Reticle */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-24 h-24 border border-dashed border-[#00E5FF]/40 rounded-full animate-spin-slow flex items-center justify-center">
                    <div className="w-16 h-16 border border-[#00FF88]/40 rounded-lg flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-ping" />
                    </div>
                  </div>
                </div>

                {/* Telemetry Labels inside viewport */}
                <div className="absolute top-2 left-2 text-[9px] text-[#00E5FF] font-mono tracking-tight bg-black/50 px-1.5 py-0.5 rounded">
                  OPTICAL SENSOR: 640x480
                </div>
                <div className="absolute top-2 right-2 text-[9px] text-[#00FF88] font-mono tracking-tight bg-black/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00FF88] animate-pulse" />
                  LIVE // {fps} FPS
                </div>
                <div className="absolute bottom-2 left-2 text-[9px] text-[#3A9AB0] font-mono tracking-tight bg-black/50 px-1.5 py-0.5 rounded">
                  TARGET: OPERADOR [LOCK]
                </div>
                <div className="absolute bottom-2 right-2 text-[9px] text-slate-400 font-mono tracking-tight bg-black/50 px-1.5 py-0.5 rounded">
                  LAT: 14ms
                </div>
              </div>

              {/* Scanline Sweep animation */}
              {scanEffectActive && (
                <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(0,229,255,0.06)_1px,transparent_1px)] bg-[size:100%_4px] animate-pulse" />
              )}
            </>
          )}
        </div>

          {/* Controls Footer */}
        {!isMinimized && (
          <div className="p-3 bg-[#000C18] border-t border-[#0A2535] flex flex-col gap-2.5">
            {/* Primary Analysis Button */}
            <button
              onClick={handleInspectWithJarvis}
              disabled={!stream || isAnalyzing}
              className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-[#00C8FF] to-[#00E5FF] text-black font-bold text-xs flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition shadow-lg shadow-[#00C8FF]/25 disabled:opacity-50"
            >
              <Eye className="w-4 h-4" />
              <span>
                {isAnalyzing ? "JARVIS ANALISANDO VISÃO..." : "JARVIS, O QUE VOCÊ ESTÁ VENDO?"}
              </span>
            </button>

            {/* Sub-actions */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={handleCaptureAndAttach}
                disabled={!stream}
                className="py-1.5 px-2.5 rounded-lg bg-[#001520] hover:bg-[#002535] border border-[#0A2535] text-[#E8F8FF] font-medium flex items-center justify-center gap-1.5 transition text-[11px] disabled:opacity-40"
              >
                <Camera className="w-3.5 h-3.5 text-[#00C8FF]" />
                <span>Anexar ao Chat</span>
              </button>

              <button
                onClick={() => {
                  startStream(feedSource === "camera" ? "screen" : "camera");
                }}
                className="py-1.5 px-2.5 rounded-lg bg-[#001520] hover:bg-[#002535] border border-[#0A2535] text-[#3A9AB0] hover:text-[#00E5FF] font-medium flex items-center justify-center gap-1.5 transition text-[11px]"
              >
                {feedSource === "camera" ? (
                  <>
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Mudar para Tela</span>
                  </>
                ) : (
                  <>
                    <Camera className="w-3.5 h-3.5" />
                    <span>Mudar p/ Câmera</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
