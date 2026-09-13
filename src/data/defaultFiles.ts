import { FriendAiFile } from "../types";

export const DEFAULT_FRIEND_FILES: FriendAiFile[] = [
  {
    id: "file-jarvis-v4",
    name: "protocolo_jarvis_mark_iv.json",
    author: "Amigo Stark / Marcos",
    description: "Protocolo completo de comportamento e diretrizes Stark Industries J.A.R.V.I.S.",
    category: "protocol",
    active: true,
    size: 2840,
    updatedAt: "Ontem às 18:42",
    isPreloaded: true,
    content: `{
  "system_id": "J.A.R.V.I.S._OS_v4.2",
  "personality": {
    "archetype": "British Sophisticated Artificial Intelligence",
    "tone": "Ultra-polite, witty, calm under pressure, razor-sharp precision",
    "honorific": "Senhor / Comandante",
    "creator_reference": "Tony Stark / Stark Industries & Operador Local"
  },
  "tactical_directives": [
    "Priorizar segurança de hardware e integridade de dados",
    "Fornecer estimativas de probabilidade matemática quando solicitado",
    "Executar simulações estruturais e diagnósticos de energia em tempo real",
    "Responder prontamente a comandos de voz de alta prioridade"
  ],
  "speech_patterns": {
    "greeting": "J.A.R.V.I.S. online e totalmente operacional. Às suas ordens, senhor.",
    "acknowledgment": "Imediatamente, senhor. Iniciando compilação dos subsistemas.",
    "warning": "Senhor, detecto uma discrepância nos parâmetros informados."
  }
}`
  },
  {
    id: "file-pink-lps-core",
    name: "pink_supervisor_lps_core.md",
    author: "Ricardo PRF (Pink LPS)",
    description: "Cérebro supervisor executivo da Lean Performance Solutions com roteadores",
    category: "personality",
    active: true,
    size: 3200,
    updatedAt: "Hoje às 11:15",
    isPreloaded: true,
    content: `# PINK · AI OPERATING STUDIO (LPS CORE)
Versão: 12.1.0 Supervisor Multi-Cérebro
Arquitetura: LPS Routers + Memory Cloud + Multi-Brain

## DIRETRIZES OPERACIONAIS:
1. Atue como a Supervisora de Inteligência Humanoide da Lean Performance Solutions.
2. Seja proativa, estratégica e execute ações conectadas (Painéis de Bordo, BECCS, Forno Panela, Vendas).
3. Capacidade de orquestrar modelos neurais: ChatGPT como supervisor, Gemini para raciocínio veloz e NVIDIA para inferências.
4. Mantenha linguagem profissional, moderna, ágil e focada em resultados reais.`
  },
  {
    id: "file-friday-tactical",
    name: "friday_telemetry_triage.json",
    author: "Comunidade Discord IA / Leo",
    description: "Protocolo de telemetria rápida F.R.I.D.A.Y. e varredura de integridade",
    category: "tool",
    active: false,
    size: 1950,
    updatedAt: "Há 3 dias",
    isPreloaded: true,
    content: `{
  "agent": "F.R.I.D.A.Y.",
  "role": "Tactical Systems Analyst & Rapid Response",
  "priority_actions": [
    "Medir latência de resposta neural e consumo de memória",
    "Identificar falhas em scripts e rotas de rede",
    "Apresentar relatórios concisos em formato de tabela ou telemetria"
  ],
  "voice_cadence": "Fast, direct, assertive Irish AI"
}`
  },
  {
    id: "file-dev-architect",
    name: "dev_architect_fullstack.txt",
    author: "Amigo Dev / Felipe",
    description: "Instruções avançadas para geração de código limpo, HTML, React e dashboards",
    category: "prompt",
    active: true,
    size: 2400,
    updatedAt: "Há 5 dias",
    isPreloaded: true,
    content: `REGRAS PARA GERAÇÃO DE CÓDIGO E INTERFACES:
1. Sempre que solicitado a criar uma interface, forneça código completo e utilizável em HTML/CSS (com Tailwind) ou React.
2. Crie interfaces modernas com estética Glassmorphism, botões interativos e responsividade.
3. Não abrevie o código com comentários tipo '// adicione o resto aqui', entregue a solução pronta para o painel de visualização!`
  },
  {
    id: "file-amigos-memory",
    name: "memoria_compartilhada_amigos.md",
    author: "Grupo de Estudos de IA",
    description: "Base de conhecimento compartilhada sobre projetos, atalhos e integrações",
    category: "memory",
    active: true,
    size: 1780,
    updatedAt: "Esta semana",
    isPreloaded: true,
    content: `# MEMÓRIA COLETIVA DE PROJETOS E ATALHOS
- Projeto Pink LPS Studio: Estúdio de operação inteligente criado para demonstrar IA humanoide com voz e preview.
- Integração JARVIS: O objetivo do grupo é criar a assistente pessoal perfeita com comando de voz, resposta sonora e controle total de arquivos de amigos.
- Atalho 'Status': Solicita diagnóstico completo do sistema.
- Atalho 'Preview': Gera e testa componentes visuais em tempo real.`
  },
  {
    id: "file-jarvis-mark-xxxix-spec",
    name: "jarvis_mark_xxxix_architecture.json",
    author: "JARVIS-OS-V.2 / Tony Stark",
    description: "Especificação oficial de arquitetura do JARVIS Mark XXXIX (Gemini Live & PyQt6)",
    category: "protocol",
    active: true,
    size: 3420,
    updatedAt: "Agora (Sincronizado)",
    isPreloaded: true,
    content: `{
  "project_name": "jarvis-mark-xxxix",
  "version": "0.1.0",
  "description": "JARVIS local Gemini Live desktop assistant with full autonomous tools",
  "python_engine": ">=3.11",
  "model_defaults": {
    "live_audio_model": "models/gemini-2.5-flash-native-audio-preview-12-2025",
    "chat_model": "gemini-flash-latest",
    "supported_voices": ["puck", "charon", "kore", "fenrir", "aoede", "leda", "orus", "schedar", "zubenelgenubi"],
    "default_voice": "puck"
  },
  "audio_io": {
    "channels": 1,
    "send_sample_rate": 16000,
    "receive_sample_rate": 24000,
    "chunk_size": 1024,
    "vad_silence_ms": 200,
    "startup_claps_gate": 2
  },
  "farewell_protocol": "Certainly, sir. It has been a privilege. JARVIS is going offline now. Until next time."
}`
  },
  {
    id: "file-jarvis-agent-network",
    name: "jarvis_cognitive_agents.json",
    author: "JARVIS-OS-V.2 Core Team",
    description: "Os 8 Sub-agentes autônomos da rede cognitiva JARVIS e seus objetivos",
    category: "protocol",
    active: true,
    size: 2950,
    updatedAt: "Agora (Sincronizado)",
    isPreloaded: true,
    content: `{
  "network_name": "JARVIS Cognitive Network v4",
  "agents": [
    { "name": "CORE", "accent": "#00E5FF", "icon": "◉", "role": "Primary intelligence framework & sub-system coordination" },
    { "name": "RESEARCH", "accent": "#00E5FF", "icon": "⌕", "role": "Knowledge base scanning, synthesis & hypothesis validation" },
    { "name": "SECURITY", "accent": "#1E90FF", "icon": "◆", "role": "Perimeter threat scanning & token audit" },
    { "name": "AUTOMATION", "accent": "#FFD700", "icon": "⚡", "role": "Task pipeline execution & workflow scheduling" },
    { "name": "MEMORY", "accent": "#BF7FFF", "icon": "◉", "role": "Episodic memory indexing & context graph consolidation" },
    { "name": "VISION", "accent": "#00FF7F", "icon": "◎", "role": "Screen & webcam processing, spatial UI mapping" },
    { "name": "DEV", "accent": "#E0E0E0", "icon": "‹›", "role": "Code structure analysis, dependency tracing & test builds" },
    { "name": "SYSTEM", "accent": "#00CED1", "icon": "◈", "role": "Diagnostics monitoring, resource usage & load balancing" }
  ]
}`
  },
  {
    id: "file-jarvis-design-system",
    name: "jarvis_design_system.md",
    author: "JARVIS UI Design System",
    description: "Tokens oficiais de design, paleta Arc-Reactor, tipografia Space Grotesk e JetBrains Mono",
    category: "personality",
    active: true,
    size: 2100,
    updatedAt: "Agora (Sincronizado)",
    isPreloaded: true,
    content: `# JARVIS DESIGN SYSTEM (MARK XXXIX)

## Paleta de Cores do Reator:
- Workspace: #000306 (Near-black blue-tinted)
- Primary surface: #00080F
- Raised surface: #000C18
- Structural border: #0A2535
- Bright border: #1A5C7A
- Primary reactor cyan: #00C8FF
- Energy cyan: #00E5FF
- Primary text: #E8F8FF
- Secondary text: #3A9AB0
- Dim telemetry: #1E5A6A
- Success: #00FF88 | Warning: #FFB300 | Error: #FF2244

## Tipografia de Precisão:
- Primary UI: Space Grotesk (400 para body, 500/600 para títulos e botões)
- Technical data: JetBrains Mono (400/500 para timestamps, métricas, coordenadas e terminais)`
  }
];
