# AI-OS ChatUI

Moderne, Grok-inspirierte Chat-Oberfläche für AI-OS — mit konfigurierbaren Endpoints, API-Keys und Model-Providern.

![AI-OS ChatUI](public/og-image.png)

## Features

- **Grok-inspiriertes Design** — Dark Mode, Glassmorphism, subtle Glow-Effekte
- **Multi-Model-Support** — Mehrere LLM-Backends konfigurierbar
- **Chat-Verlauf** — Conversations persistieren im localStorage
- **Streaming** — Echtzeit-Streaming der LLM-Antworten
- **Markdown-Rendering** — Code-Highlighting, Tabellen, Blockquotes
- **Vollständig konfigurierbar** — baseURL, API-Key, Model-Name, Temperature, Max Tokens
- **OpenAI-kompatibles API-Format** — Funktioniert mit llama.cpp, Ollama, vLLM, LiteLLM, etc.

## Tech Stack

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui v4** (base-ui)
- **Zustand** (State Management)
- **react-markdown** + rehype-highlight (Markdown)

## Quick Start

```bash
# Installation
npm install

# Entwicklung
npm run dev

# Produktion
npm run build
npm start
```

## Konfiguration

Alle Einstellungen werden im Browser gespeichert (localStorage). Öffne die Einstellungen über das Zahnrad-Icon in der Sidebar.

### Standard-Modell

Standardmäßig ist ein lokales Modell vorkonfiguriert:

| Feld | Wert |
|------|------|
| Base URL | `http://localhost:9001` |
| API Key | `not-needed` |
| Model | `gemma-4-12b` |

### Neue Modelle hinzufügen

1. Klick auf das Zahnrad-Icon (Settings)
2. "Neues Modell hinzufügen"
3. Base URL, API Key und Model-Name eintragen
4. Verbindung testen mit "Verbindung testen"

## API-Kompatibilität

Die ChatUI nutzt das OpenAI-kompatible `/v1/chat/completions` Endpoint-Format mit SSE-Streaming.

Unterstützte Backends:
- **llama.cpp** (server mode)
- **Ollama**
- **vLLM**
- **LiteLLM**
- **OpenAI**
- **OpenRouter**
- Jeder OpenAI-kompatible Server

## Projektstruktur

```
src/
├── app/
│   ├── globals.css        # Design System (Grok-Style)
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Main Page
├── components/
│   ├── chat/
│   │   ├── ChatInterface.tsx   # Hauptkomponente
│   │   ├── ChatSidebar.tsx     # Sidebar + History
│   │   ├── ChatMessage.tsx     # Message-Bubble
│   │   ├── ChatInput.tsx       # Eingabefeld
│   │   ├── MessageContent.tsx  # Markdown-Renderer
│   │   └── SettingsDialog.tsx  # Einstellungen
│   └── ui/                     # shadcn/ui Komponenten
└── lib/
    ├── api.ts              # API-Kommunikation
    ├── store.ts            # Zustand Store
    ├── types.ts            # TypeScript Types
    └── utils.ts            # Utilities
```

## License

MIT
