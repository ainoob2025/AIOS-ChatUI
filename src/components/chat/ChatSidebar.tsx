"use client";

import {
  Plus,
  MessageSquare,
  Trash2,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { useChatStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import SettingsDialog from "./SettingsDialog";

export default function ChatSidebar() {
  const {
    conversations,
    activeConversationId,
    sidebarOpen,
    createConversation,
    deleteConversation,
    setActiveConversation,
    toggleSidebar,
    setSidebarOpen,
  } = useChatStore();

  if (!sidebarOpen) {
    return (
      <div className="flex flex-col items-center gap-3 p-3 border-r border-[var(--border)]">
        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-9 w-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            >
              <PanelLeftOpen className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Sidebar öffnen</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger>
            <Button
              variant="ghost"
              size="icon"
              onClick={createConversation}
              className="h-9 w-9 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
            >
              <Plus className="h-5 w-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">Neuer Chat</TooltipContent>
        </Tooltip>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 h-full border-r border-[var(--border)] bg-[var(--surface)] backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)]">
        <h1 className="text-sm font-semibold text-[var(--text-primary)] tracking-tight">
          AI-OS Chat
        </h1>
        <div className="flex items-center gap-1">
          <SettingsDialog />
          <Tooltip>
            <TooltipTrigger>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">Sidebar schließen</TooltipContent>
          </Tooltip>
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-2">
        <Button
          variant="outline"
          onClick={createConversation}
          className="w-full justify-start gap-2 text-[var(--text-secondary)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] h-9 text-sm"
        >
          <Plus className="h-4 w-4" />
          Neuer Chat
        </Button>
      </div>

      {/* Conversation List */}
      <ScrollArea className="flex-1 min-h-0 px-2">
        <div className="space-y-0.5">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              onClick={() => setActiveConversation(conv.id)}
              className={cn(
                "group flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-150 text-sm",
                conv.id === activeConversationId
                  ? "bg-[var(--surface-elevated)] text-[var(--text-primary)] border border-[var(--border-strong)]"
                  : "text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)] border border-transparent"
              )}
            >
              <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
              <span className="truncate flex-1">{conv.title}</span>
              <Tooltip>
                <TooltipTrigger>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(conv.id);
                    }}
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-transparent"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Löschen</TooltipContent>
              </Tooltip>
            </div>
          ))}

          {conversations.length === 0 && (
            <div className="px-3 py-8 text-center text-xs text-[var(--text-muted)]">
              Noch keine Chats.
              <br />
              Starte eine neue Konversation!
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Footer */}
      <div className="p-3 border-t border-[var(--border)]">
        <div className="text-xs text-[var(--text-muted)] text-center">
          AI-OS ChatUI v0.1
        </div>
      </div>
    </div>
  );
}
