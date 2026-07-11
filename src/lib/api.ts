// API Layer für die Kommunikation mit Backends

import type { ModelListResponse, StreamChunk } from "./types";

export interface SendMessageParams {
  baseURL: string;
  endpoint: string;
  apiKey: string;
  model: string;
  messages: { role: string; content: string }[];
  temperature: number;
  maxTokens: number;
  reasoningEffort?: string;
  streamingEnabled: boolean;
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
    endpoint,
    apiKey,
    model,
    messages,
    temperature,
    maxTokens,
    reasoningEffort,
    streamingEnabled,
    onChunk,
    onReasoningChunk,
    onDone,
    onError,
    abortSignal,
  } = params;

  const cleanBaseURL = baseURL.replace(/\/+$/, "");
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = `${cleanBaseURL}${cleanEndpoint}`;

  const body: Record<string, unknown> = {
    model,
    messages,
    stream: streamingEnabled,
    temperature,
  };

  if (maxTokens > 0) {
    body.max_tokens = maxTokens;
  }

  if (reasoningEffort) {
    body.reasoning_effort = reasoningEffort;
  }

  try {
    const response = await fetch(url, {
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

    // Check if streaming (SSE) or JSON response
    const contentType = response.headers.get("content-type") || "";

    if (contentType.includes("text/event-stream")) {
      // SSE Streaming
      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response body");

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

            if (delta?.reasoning_content && onReasoningChunk) {
              onReasoningChunk(delta.reasoning_content);
            }

            if (delta?.content) {
              onChunk(delta.content);
            }

            if (parsed.choices?.[0]?.finish_reason) {
              onDone();
              return;
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } else {
      // Non-streaming JSON response (fallback)
      const json = await response.json();

      // OpenAI style
      if (json.choices?.[0]?.message?.content) {
        onChunk(json.choices[0].message.content);
      }
      // Anthropic style
      else if (json.content?.[0]?.text) {
        onChunk(json.content[0].text);
      }
      // Generic
      else if (typeof json === "string") {
        onChunk(json);
      }
    }

    onDone();
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      return;
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
        .filter((id) => !id.startsWith("_"));
      return { ok: true, models, message: `${models.length} Modelle gefunden` };
    }

    return { ok: false, models: [], message: `Status ${response.status}` };
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
