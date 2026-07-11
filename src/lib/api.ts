// API Layer für die Kommunikation mit dem AI-OS Backend

import type { ChatCompletionRequest, Message, StreamChunk } from "./types";

export async function sendChatMessage(
  baseURL: string,
  apiKey: string,
  model: string,
  messages: { role: string; content: string }[],
  temperature: number,
  maxTokens: number,
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (error: Error) => void,
  abortSignal?: AbortSignal
): Promise<void> {
  // Entferne trailing slash von der baseURL
  const cleanBaseURL = baseURL.replace(/\/+$/, "");

  const body: ChatCompletionRequest = {
    model,
    messages,
    stream: true,
    temperature,
    max_tokens: maxTokens,
  };

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
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            onChunk(content);
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

export async function testConnection(
  baseURL: string,
  apiKey: string
): Promise<{ ok: boolean; message: string }> {
  const cleanBaseURL = baseURL.replace(/\/+$/, "");

  try {
    const response = await fetch(`${cleanBaseURL}/v1/models`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      signal: AbortSignal.timeout(5000),
    });

    if (response.ok) {
      const data = await response.json();
      return {
        ok: true,
        message: `Verbunden. ${data.data?.length || "?"} Modelle verfügbar.`,
      };
    }

    return {
      ok: false,
      message: `Status ${response.status}: ${await response.text().then(t => t.slice(0, 100))}`,
    };
  } catch (error) {
    return {
      ok: false,
      message: `Verbindungsfehler: ${(error as Error).message}`,
    };
  }
}
