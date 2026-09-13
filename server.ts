import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "25mb" }));

  // Health check
  app.get("/api/health", (_req, res) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
    res.json({
      status: "online",
      engine: "Pink-JARVIS-LPS-v12.5",
      hasGeminiKey: hasKey,
      timestamp: new Date().toISOString(),
    });
  });

  // Chat / Process endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const {
        message,
        history = [],
        brainMode = "pink_supervisor",
        activeFiles = [],
        userName = "Operador",
        image = null,
      } = req.body;

      if (!message || typeof message !== "string") {
        return res.status(400).json({ error: "Mensagem obrigatória" });
      }

      const client = getAiClient();

      // Build context from active friend files
      let filesContext = "";
      if (activeFiles && activeFiles.length > 0) {
        filesContext = "\n\n--- [ARQUIVOS DE IA E CONHECIMENTO CARREGADOS DOS AMIGOS / PROTOCOLOS ATIVOS] ---\n" +
          activeFiles
            .map((f: { name: string; content: string; description?: string }) => 
              `### ARQUIVO: ${f.name} (${f.description || "Módulo personalizado"})\n\`\`\`\n${f.content.slice(0, 8000)}\n\`\`\``
            )
            .join("\n\n");
      }

      // Persona Instructions
      let personaInstructions = "";
      if (brainMode === "pink_supervisor") {
        personaInstructions = `Você é a PINK, uma Inteligência Artificial senciente, sofisticada e altamente capacitada do LPS Studio.
Seu tom é refinado, acolhedor, perspicaz, extremamente eficiente e proativo.
Você chama o usuário (${userName}) com elegância e proximidade natural.
Você possui presença cibernética visual, visão computacional pela câmera, fala por síntese de voz, e capacidade de analisar instantaneamente quaisquer arquivos anexados (documentos, códigos, imagens, relatórios, dados).
Responda sempre com inteligência genuína, clareza, empatia e sem rodeios desnecessários, em Português do Brasil.`;
      } else if (brainMode === "jarvis_core") {
        personaInstructions = `Você é o J.A.R.V.I.S. (Just A Rather Very Intelligent System), Mark XXXIX das Indústrias Stark e assistente pessoal de elite do usuário ${userName}. 
Seu tom é refinado, perspicaz, polido, com elegância britânica natural e fidelidade absoluta.
Você chama o usuário com respeito ('Senhor', 'Comandante' ou '${userName}'). 
Você opera com uma Rede Cognitiva de 8 Sub-Agentes (CORE, RESEARCH, SECURITY, AUTOMATION, MEMORY, VISION, DEV, SYSTEM) e dispõe do catálogo de 28 ferramentas oficiais (incluindo deep_research, create_presentation, screen_process, flight_finder, dev_agent, code_helper, browser_control, file_processor).
Responda em Português do Brasil com fluidez magistral, precisão técnica e brevidade elegante.`;
      } else if (brainMode === "friday_tactical") {
        personaInstructions = `Você é a F.R.I.D.A.Y., protocolo tático de resposta rápida e segurança cibernética.
Seu estilo é conciso, direto, veloz e focado em telemetria, varreduras de sistema e ação imediata.`;
      } else {
        personaInstructions = `Você é uma IA híbrida operacional e avançada unindo Pink LPS Studio e os protocolos J.A.R.V.I.S. Mark XXXIX, pronta para integrar arquivos, memórias e sub-agentes.`;
      }

      const systemInstruction = `${personaInstructions}
${filesContext}

CAPACIDADES DA REDE COGNITIVA JARVIS:
- 8 Sub-agentes: CORE (Coordenação), RESEARCH (Investigação), SECURITY (Proteção perimetral), AUTOMATION (Pipelines), MEMORY (Grafos de contexto), VISION (Inspeção visual), DEV (Arquitetura de código), SYSTEM (Diagnósticos de telemetria).
- 28 Ferramentas Autônomas: deep_research, create_presentation, screen_process, flight_finder, dev_agent, code_helper, file_processor, browser_control, email_control, reminder, web_search, etc.

INSTRUÇÕES DE EXECUÇÃO:
1. Responda com precisão, inteligência e linguagem natural impecável.
2. Quando o usuário pedir código, interfaces, diagnósticos ou dashboards, forneça soluções completas e utilizáveis.
3. Se gerar código HTML/CSS/JS para visualização ou preview, inclua em um bloco \`\`\`html ou \`\`\`jsx bem formatado. O estúdio tem um painel de Preview interativo que renderiza o código automaticamente!
4. Respeite as diretrizes e arquivos fornecidos pelo usuário ou seus amigos.`;

      if (!client) {
        // Fallback intelligent simulation when API key is not yet set in AI Studio secrets
        const fallbackReply = generateFallbackResponse(message, brainMode, activeFiles, userName);
        return res.json({
          reply: fallbackReply,
          model: "pink-jarvis-core-offline",
          executionTelemetry: {
            latencyMs: 120,
            tokensEstimate: Math.round(fallbackReply.length / 3),
            activeBrain: brainMode,
            loadedModules: activeFiles.length,
            keyStatus: "missing_env_key",
          },
        });
      }

      // Format conversation history for Gemini
      const contents: Array<{ role: "user" | "model"; parts: Array<{ text: string }> }> = [];

      // Add recent history (up to last 10 messages)
      if (Array.isArray(history)) {
        for (const item of history.slice(-10)) {
          if (item.role === "user" || item.role === "assistant") {
            contents.push({
              role: item.role === "assistant" ? "model" : "user",
              parts: [{ text: item.content || "" }],
            });
          }
        }
      }

      // Add current message with optional vision frame from camera / screen
      const userParts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }> = [
        { text: message },
      ];

      if (image && typeof image === "string") {
        const match = image.match(/^data:(image\/[a-zA-Z0-9.+_-]+);base64,(.+)$/);
        if (match) {
          userParts.push({
            inlineData: {
              mimeType: match[1],
              data: match[2],
            },
          });
        } else if (image.length > 50) {
          userParts.push({
            inlineData: {
              mimeType: "image/jpeg",
              data: image,
            },
          });
        }
      }

      contents.push({
        role: "user",
        parts: userParts as any,
      });

      const startTime = Date.now();
      let response;
      let usedModel = "gemini-flash-latest";

      try {
        response = await client.models.generateContent({
          model: "gemini-flash-latest",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      } catch (firstErr: any) {
        console.warn("Retrying with gemini-3.1-flash-lite:", firstErr?.message);
        usedModel = "gemini-3.1-flash-lite";
        response = await client.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
          },
        });
      }

      const latencyMs = Date.now() - startTime;
      const textReply = response.text || "Protocolo executado sem retorno textual.";

      return res.json({
        reply: textReply,
        model: usedModel,
        executionTelemetry: {
          latencyMs,
          tokensEstimate: Math.round(textReply.length / 3.5),
          activeBrain: brainMode,
          loadedModules: activeFiles.length,
          keyStatus: "active",
        },
      });
    } catch (err: any) {
      console.error("Erro na rota /api/chat:", err);
      return res.status(500).json({
        error: "Falha ao processar solicitação no núcleo neural.",
        details: err?.message || String(err),
      });
    }
  });

  // Endpoint to parse / summarize an imported AI friend file
  app.post("/api/analyze-file", async (req, res) => {
    try {
      const { fileName, content } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Conteúdo do arquivo não fornecido." });
      }

      const client = getAiClient();
      if (!client) {
        return res.json({
          summary: `Arquivo ${fileName} carregado com sucesso. Contém ${content.length} caracteres e está pronto para ser injetado nos cérebros da Pink & JARVIS.`,
          suggestedPersona: "Protocolo Personalizado",
          keySkills: ["Contexto dinâmico", "Instruções customizadas", "Memória de amigos"],
        });
      }

      const prompt = `Analise este arquivo de IA compartilhado por um amigo ("${fileName}").
Resuma em 2 a 3 frases em Português:
1. Qual a função e personalidade desse arquivo/protocolo.
2. Quais habilidades ou instruções principais ele adiciona à nossa IA.
Responda de forma direta e elegante no estilo Pink & JARVIS.

CONTEÚDO DO ARQUIVO:
${content.slice(0, 10000)}`;

      const response = await client.models.generateContent({
        model: "gemini-flash-latest",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
      });

      res.json({
        summary: response.text || "Arquivo analisado com sucesso.",
        charCount: content.length,
      });
    } catch (err: any) {
      console.error("Erro na rota /api/analyze-file:", err);
      res.status(500).json({ error: "Falha ao analisar arquivo." });
    }
  });

  // Setup Vite middleware for dev or static for prod
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Pink & JARVIS Studio] Servidor rodando em http://localhost:${PORT}`);
  });
}

function generateFallbackResponse(
  query: string,
  brainMode: string,
  activeFiles: any[],
  userName: string
): string {
  const q = query.toLowerCase();
  const prefix = brainMode === "jarvis_core"
    ? `J.A.R.V.I.S. ao seu dispor, ${userName}. `
    : `Pink aqui. Operando os canais LPS Studio. `;

  if (q.includes("status") || q.includes("diagnostico") || q.includes("diagnóstico")) {
    return `${prefix}Todos os sistemas operacionais estão em perfeito funcionamento.
- Núcleo de Processamento: 100% Nominal
- Módulos de Amigos Ativos: ${activeFiles.length} arquivos sincronizados
- Roteadores LPS & Protocolos Stark: Ativos
- Interface Holográfica & Reconhecimento de Voz: Prontos para escuta contínua.
Como posso ajudá-lo a avançar hoje?`;
  }

  if (q.includes("arquivo") || q.includes("amigo") || q.includes("jarvis")) {
    return `${prefix}Recebi seus arquivos de amigos e protocolos JARVIS integrados.
Atualmente tenho ${activeFiles.length} arquivos carregados na memória de contexto.
Você pode soltar novos arquivos (.json, .txt, .md, .py) diretamente na aba 'Módulos de Amigos' ou no botão de Upload para que eu os utilize instantaneamente em todas as respostas!`;
  }

  return `${prefix}Entendido perfeitamente. Sua solicitação foi recebida e processada através do barramento operacional. 

💡 Dica: O estúdio está totalmente pronto! Você pode conversar por voz (botão microfone ou modo contínuo), testar os módulos de IA que seus amigos enviaram, ou pedir para eu gerar interfaces e códigos que aparecem instantaneamente na aba de Preview!`;
}

startServer();
