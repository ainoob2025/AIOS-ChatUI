// Zustand Store für die AIOS ChatUI

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { v4 as uuidv4 } from "uuid";
import type { Conversation, Message, AppSettings, ModelConfig } from "./types";

const DEFAULT_MODEL: ModelConfig = {
  id: "default",
  name: "AI-OS Local",
  baseURL: "http://localhost:9001",
  apiKey: "not-needed",
  model: "gemma-4-12b",
};

const DEFAULT_SETTINGS: AppSettings = {
  models: [DEFAULT_MODEL],
  activeModelId: "default",
  systemPrompt: "",
  temperature: 0.7,
  maxTokens: 4096,
};

interface ChatStore {
  // Conversations
  conversations: Conversation[];
  activeConversationId: string | null;
  streamingMessageId: string | null;
  isStreaming: boolean;

  // Settings
  settings: AppSettings;

  // Sidebar
  sidebarOpen: boolean;

  // Actions - Conversations
  createConversation: () => string;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string) => void;
  updateConversationTitle: (id: string, title: string) => void;

  // Actions - Messages
  addMessage: (conversationId: string, message: Message) => void;
  appendToStreamingMessage: (text: string) => void;
  finishStreaming: () => void;

  // Actions - Settings
  updateSettings: (settings: Partial<AppSettings>) => void;
  addModel: (model: ModelConfig) => void;
  removeModel: (id: string) => void;
  updateModel: (id: string, updates: Partial<ModelConfig>) => void;
  setActiveModel: (id: string) => void;
  getActiveModel: () => ModelConfig;

  // Actions - UI
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

export const useChatStore = create<ChatStore>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeConversationId: null,
      streamingMessageId: null,
      isStreaming: false,
      settings: DEFAULT_SETTINGS,
      sidebarOpen: true,

      createConversation: () => {
        const id = uuidv4();
        const now = Date.now();
        const conversation: Conversation = {
          id,
          title: "Neuer Chat",
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },

      deleteConversation: (id) => {
        set((state) => {
          const filtered = state.conversations.filter((c) => c.id !== id);
          let nextActive = state.activeConversationId;
          if (state.activeConversationId === id) {
            nextActive = filtered[0]?.id || null;
          }
          return {
            conversations: filtered,
            activeConversationId: nextActive,
          };
        });
      },

      setActiveConversation: (id) => {
        set({ activeConversationId: id });
      },

      updateConversationTitle: (id, title) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, title, updatedAt: Date.now() } : c
          ),
        }));
      },

      addMessage: (conversationId, message) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  messages: [...c.messages, message],
                  updatedAt: Date.now(),
                  // Auto-title: use first user message
                  title:
                    c.title === "Neuer Chat" && message.role === "user"
                      ? message.content.slice(0, 50) +
                        (message.content.length > 50 ? "…" : "")
                      : c.title,
                }
              : c
          ),
        }));
      },

      appendToStreamingMessage: (text) => {
        const { streamingMessageId } = get();
        if (!streamingMessageId) return;

        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === state.activeConversationId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === streamingMessageId
                      ? { ...m, content: m.content + text }
                      : m
                  ),
                }
              : c
          ),
        }));
      },

      finishStreaming: () => {
        set({ isStreaming: false, streamingMessageId: null });
      },

      updateSettings: (partial) => {
        set((state) => ({
          settings: { ...state.settings, ...partial },
        }));
      },

      addModel: (model) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: [...state.settings.models, model],
          },
        }));
      },

      removeModel: (id) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: state.settings.models.filter((m) => m.id !== id),
            activeModelId:
              state.settings.activeModelId === id
                ? state.settings.models[0]?.id || "default"
                : state.settings.activeModelId,
          },
        }));
      },

      updateModel: (id, updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            models: state.settings.models.map((m) =>
              m.id === id ? { ...m, ...updates } : m
            ),
          },
        }));
      },

      setActiveModel: (id) => {
        set((state) => ({
          settings: { ...state.settings, activeModelId: id },
        }));
      },

      getActiveModel: () => {
        const { settings } = get();
        return (
          settings.models.find((m) => m.id === settings.activeModelId) ||
          settings.models[0]
        );
      },

      toggleSidebar: () => {
        set((state) => ({ sidebarOpen: !state.sidebarOpen }));
      },

      setSidebarOpen: (open) => {
        set({ sidebarOpen: open });
      },
    }),
    {
      name: "aios-chatui-storage",
      partialize: (state) => ({
        conversations: state.conversations,
        settings: state.settings,
      }),
    }
  )
);
