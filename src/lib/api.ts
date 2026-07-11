// API Layer für die Kommunikation mit dem AI-OS Backend

import type {
  ChatCompletionRequest,
  ModelListResponse,
  StreamChunk,
} from "./types";

export interface SendMessageParams {
  baseURL: string;
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  maxTokens: number;
  reasoningEffort?: string;
  onChunk: (text: string) => void;
  onReasoningChunk?: (text: string) => void;
  onDone: () => void;
  onError: (error: Error) => void;
  abortSignal?: AbortSignal;
}

export async function sendChatMessage(
  params: SendMessageParams
): Promise<void> {
  const {
    baseURL,
    apiKey,
    model,
    messages,
    temperature,
    maxTokens,
    reasoningEffort,
    onChunk,
    onReasoningChunk,
    onDone,
    onError,
    abortSignal,
  } = params;

  const cleanBaseURL = baseURL.replace(/\/+$/, "");

  const body: Record<string, unknown> = {
    model,
    messages,
    stream: true,
    temperature,
  };

  // Nur senden wenn der User explizit ein Limit gesetzt hat
  if (maxTokens > 0) {
    body.max_tokens = maxTokens;
  }

  // Reasoning effort nur wenn Provider Reasoning enabled hat
  if (reasoningEffort) {
    body.reasoning_effort = reasoningEffort;
  }

  try {
    const response = await fetch(`${cleanBaseURL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: abortSignal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `API Error ${response.status}: ${errorText.slice(0, 200)}`
      );
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error("No response body (streaming not supported?)");
    }

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || !trimmed.startsWith("data: ")) continue;

        const data = trimmed.slice(6);
        if (data === "[DONE]") {
          onDone();
          return;
        }

        try {
          const parsed: StreamChunk = JSON.parse(data);
          const delta = parsed.choices?.[0]?.delta;

          // Reasoning content (für DeepSeek-R1, o1, etc.)
          if (delta?.reasoning_content && onReasoningChunk) {
            onReasoningChunk(delta.reasoning_content);
          }

          // Normal content
          if (delta?.content) {
            onChunk(delta.content);
          }

          if (parsed.choices?.[0]?.finish_reason) {
            onDone();
            return;
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }
    }
    onDone();
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return; // User cancelled
    }
    onError(error as Error);
  }
}

export async function fetchModels(
  baseURL: string,
  apiKey: string
): Promise<{ ok: boolean; models: string[]; message: string }> {
  const cleanBaseURL = baseURL.replace(/\/+$/, "");

  try {
    const response = await fetch(`${cleanBaseURL}/v1/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data: ModelListResponse = await response.json();
      const models = (data.data || [])
        .map((m) => m.id)
        .filter((id) => !id.startsWith("_")); // Internals rausfiltern
      return {
        ok: true,
        models,
        message: `${models.length} Modelle gefunden`,
      };
    }

    return {
      ok: false,
      models: [],
      message: `Status ${response.status}`,
    };
  } catch (error) {
    return {
      ok: false,
      models: [],
      message: `Fehler: ${(error as Error).message}`,
    };
  }
}

export async function testConnection(
  baseURL: string,
  apiKey: string
): Promise<{ ok: boolean; message: string }> {
  const result = await fetchModels(baseURL, apiKey);
  return { ok: result.ok, message: result.message };
}
