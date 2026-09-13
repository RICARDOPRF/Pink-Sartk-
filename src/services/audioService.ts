// Web Audio API Sound Effects & Speech Synthesis / Recognition Engine

class SoundEffectsEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private getContext(): AudioContext | null {
    if (!this.enabled) return null;
    try {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Futuristic UI chirp / click
  playChirp(pitch: number = 880, duration: number = 0.06) {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(pitch, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(pitch * 1.5, ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {}
  }

  // Sci-fi JARVIS / Pink activation chime
  playWakeSound() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
      freqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.07);

        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.07);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.07 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.07);
        osc.stop(ctx.currentTime + idx * 0.07 + 0.25);
      });
    } catch {}
  }

  // Futuristic processing hum / scan
  playScanBeep() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(1200, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.12);

      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } catch {}
  }

  // Completion chime
  playSuccess() {
    const ctx = this.getContext();
    if (!ctx) return;
    try {
      [659.25, 987.77].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.09);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.09 + 0.2);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.09);
        osc.stop(ctx.currentTime + idx * 0.09 + 0.2);
      });
    } catch {}
  }
}

export const sfx = new SoundEffectsEngine();

// Speech Synthesis Helper
export interface SpeechOptions {
  voice?: SpeechSynthesisVoice | null;
  rate?: number;
  pitch?: number;
  onStart?: () => void;
  onEnd?: () => void;
  onError?: () => void;
}

export function speakText(text: string, options: SpeechOptions = {}) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    return;
  }

  // Cancel ongoing speech
  window.speechSynthesis.cancel();

  // Strip code blocks and markdown symbols for natural vocalization
  const cleanedText = text
    .replace(/```[\s\S]*?```/g, " Código gerado exibido no painel de visualização. ")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/[#*_~>]/g, "")
    .slice(0, 800); // speak first paragraphs concisely

  const utterance = new SpeechSynthesisUtterance(cleanedText);
  utterance.lang = "pt-BR";
  utterance.rate = options.rate ?? 1.05;
  utterance.pitch = options.pitch ?? 1.0;

  if (options.voice) {
    utterance.voice = options.voice;
  } else {
    // Pick best PT-BR voice available
    const voices = window.speechSynthesis.getVoices();
    const ptVoice = voices.find(v => v.lang.includes("pt-BR") || v.lang.includes("pt"));
    if (ptVoice) utterance.voice = ptVoice;
  }

  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
}

export function stopSpeaking() {
  if (typeof window !== "undefined" && "speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
}

// Speech Recognition Helper
export function getSpeechRecognition(): any {
  if (typeof window === "undefined") return null;
  const SpeechRec =
    (window as any).SpeechRecognition ||
    (window as any).webkitSpeechRecognition;
  if (!SpeechRec) return null;
  
  const rec = new SpeechRec();
  rec.continuous = false;
  rec.interimResults = true;
  rec.lang = "pt-BR";
  return rec;
}
