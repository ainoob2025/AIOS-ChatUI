"use client";

import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Message } from "@/lib/types";
import MessageContent from "./MessageContent";

interface ChatMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export default function ChatMessage({
  message,
  isStreaming,
}: ChatMessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 px-4 py-4 animate-fade-in",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-white/[0.08] flex items-center justify-center">
          <Bot className="h-4 w-4 text-blue-400" />
        </div>
      )}

      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-3",
          isUser
            ? "bg-[var(--user-bubble)] border border-[var(--user-bubble-border)] rounded-br-md"
            : "bg-[var(--assistant-bubble)] border border-[var(--assistant-bubble-border)] rounded-bl-md"
        )}
      >
        <MessageContent
          content={message.content}
          isStreaming={isStreaming}
        />
      </div>

      {isUser && (
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/[0.08] flex items-center justify-center">
          <User className="h-4 w-4 text-blue-400" />
        </div>
      )}
    </div>
  );
}
