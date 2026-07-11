"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Send, Square, Paperclip } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  disabled,
}: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setInput("");
    // Reset height
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isStreaming, disabled, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Enter to send (without Shift), Shift+Enter for newline
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 py-3">
        <div
          className={cn(
            "flex items-end gap-2 rounded-2xl border px-3 py-2 transition-all duration-200",
            "bg-[var(--surface-elevated)]",
            isStreaming
              ? "border-[var(--border-strong)]"
              : "border-[var(--border)] focus-within:border-[var(--accent)]/40 focus-within:shadow-[0_0_12px_var(--accent-glow)]"
          )}
        >
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Schreib eine Nachricht..."
            disabled={isStreaming || disabled}
            rows={1}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] min-h-[24px] max-h-[200px] py-1.5 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
          />

          <div className="flex items-center gap-1 shrink-0">
            {isStreaming ? (
              <Button
                variant="ghost"
                size="icon"
                onClick={onStop}
                className="h-8 w-8 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
              >
                <Square className="h-4 w-4" fill="currentColor" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSend}
                disabled={!input.trim() || disabled}
                className={cn(
                  "h-8 w-8 transition-all",
                  input.trim()
                    ? "text-[var(--accent-light)] hover:bg-[var(--accent-glow)]"
                    : "text-[var(--text-muted)]"
                )}
              >
                <Send className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <div className="text-[10px] text-[var(--text-muted)] text-center mt-2">
          AI-OS ChatUI — Drück Enter zum Senden, Shift+Enter für neue Zeile
        </div>
      </div>
    </div>
  );
}
