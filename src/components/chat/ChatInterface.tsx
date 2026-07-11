"use client";

import { useEffect, useRef, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "@/lib/store";
import { sendChatMessage } from "@/lib/api";
import type { Message } from "@/lib/types";
import ChatSidebar from "./ChatSidebar";
import ChatMessage from "./ChatMessage";
import ChatInput from "./ChatInput";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function ChatInterface() {
  const {
    conversations,
    activeConversationId,
    isStreaming,
    streamingMessageId,
    createConversation,
    addMessage,
    appendToStreamingMessage,
    finishStreaming,
    getActiveModel,
    settings,
  } = useChatStore();

  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      const viewport = scrollRef.current.querySelector(
        "[data-radix-scroll-area-viewport]"
      );
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [activeConversation?.messages, scrollToBottom]);

  // Ensure there's always an active conversation
  useEffect(() => {
    if (!activeConversationId) {
      createConversation();
    }
  }, [activeConversationId, createConversation]);

  const handleSend = useCallback(
    async (text: string) => {
      let convId = activeConversationId;
      if (!convId) {
        convId = createConversation();
      }

      const model = getActiveModel();
      if (!model) return;

      // Add user message
      const userMessage: Message = {
        id: uuidv4(),
        role: "user",
        content: text,
        timestamp: Date.now(),
      };
      addMessage(convId, userMessage);

      // Create assistant placeholder
      const assistantId = uuidv4();
      const assistantMessage: Message = {
        id: assistantId,
        role: "assistant",
        content: "",
        timestamp: Date.now(),
      };
      addMessage(convId, assistantMessage);

      // Set streaming state
      useChatStore.setState({
        isStreaming: true,
        streamingMessageId: assistantId,
      });

      // Build messages array
      const conv = useChatStore
        .getState()
        .conversations.find((c) => c.id === convId);
      const apiMessages: { role: string; content: string }[] = [];

      if (settings.systemPrompt) {
        apiMessages.push({ role: "system", content: settings.systemPrompt });
      }

      if (conv) {
        // Include all messages except the empty assistant placeholder
        for (const msg of conv.messages) {
          if (msg.id === assistantId) continue;
          apiMessages.push({ role: msg.role, content: msg.content });
        }
      }

      // Create abort controller
      abortControllerRef.current = new AbortController();

      await sendChatMessage(
        model.baseURL,
        model.apiKey,
        model.model,
        apiMessages,
        settings.temperature,
        settings.maxTokens,
        (chunk) => {
          appendToStreamingMessage(chunk);
          scrollToBottom();
        },
        () => {
          finishStreaming();
          abortControllerRef.current = null;
        },
        (error) => {
          // Append error to the streaming message
          appendToStreamingMessage(
            `\n\n❌ **Fehler:** ${error.message}`
          );
          finishStreaming();
          abortControllerRef.current = null;
        },
        abortControllerRef.current.signal
      );
    },
    [
      activeConversationId,
      createConversation,
      getActiveModel,
      addMessage,
      appendToStreamingMessage,
      finishStreaming,
      settings,
      scrollToBottom,
    ]
  );

  const handleStop = useCallback(() => {
    abortControllerRef.current?.abort();
    finishStreaming();
  }, [finishStreaming]);

  return (
    <div className="flex h-full">
      <ChatSidebar />

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Messages */}
        <ScrollArea className="flex-1" ref={scrollRef}>
          <div className="max-w-3xl mx-auto w-full">
            {!activeConversation || activeConversation.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full min-h-[60vh] px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center mb-6">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 32 32"
                    fill="none"
                    className="text-blue-400"
                  >
                    <path
                      d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6zm-1 5v4h-4v2h4v4h2v-4h4v-2h-4v-4h-2z"
                      fill="currentColor"
                      opacity="0.8"
                    />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
                  AI-OS Chat
                </h2>
                <p className="text-sm text-[var(--text-secondary)] text-center max-w-md">
                  Deine konfigurierbare Chat-Oberfläche für AI-OS. Verbinde
                  dich mit deinem LLM-Backend und starte eine Konversation.
                </p>
              </div>
            ) : (
              <div className="pb-4">
                {activeConversation.messages.map((msg) => (
                  <ChatMessage
                    key={msg.id}
                    message={msg}
                    isStreaming={msg.id === streamingMessageId}
                  />
                ))}
                {isStreaming &&
                  !activeConversation.messages.find(
                    (m) => m.id === streamingMessageId
                  ) && (
                    <div className="flex items-center gap-2 px-4 py-4">
                      <div className="flex gap-1 px-4 py-3">
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                        <div className="typing-dot" />
                      </div>
                    </div>
                  )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          onStop={handleStop}
          isStreaming={isStreaming}
        />
      </div>
    </div>
  );
}
