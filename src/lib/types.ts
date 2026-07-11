// Types für die AIOS ChatUI

export interface Message {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: number;
}

export interface Conversation {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface ModelConfig {
  id: string;
  name: string;
  baseURL: string;
  apiKey: string;
  model: string;
  reasoningEnabled: boolean;
  reasoningEffort: "low" | "medium" | "high";
  /** Fetched from /v1/models — cached model list for this provider */
  availableModels: string[];
}

export interface AppSettings {
  models: ModelConfig[];
  activeModelId: string;
  systemPrompt: string;
  temperature: number;
  /** 0 = kein Limit (Server-Default). Nur senden wenn > 0. */
  maxTokens: number;
}

export interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
  reasoning_effort?: string;
}

export interface StreamChunk {
  choices: {
    delta: {
      content?: string;
      reasoning_content?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
}

export interface ModelListEntry {
  id: string;
  object: string;
  owned_by?: string;
}

export interface ModelListResponse {
  object: string;
  data: ModelListEntry[];
}
