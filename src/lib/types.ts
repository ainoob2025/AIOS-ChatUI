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
}

export interface AppSettings {
  models: ModelConfig[];
  activeModelId: string;
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
}

export interface ChatCompletionRequest {
  model: string;
  messages: { role: string; content: string }[];
  stream: boolean;
  temperature?: number;
  max_tokens?: number;
}

export interface StreamChunk {
  choices: {
    delta: {
      content?: string;
    };
    index: number;
    finish_reason: string | null;
  }[];
}
