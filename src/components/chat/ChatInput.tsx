"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  Send,
  Square,
  ChevronDown,
  Brain,
  Zap,
  RefreshCw,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useChatStore } from "@/lib/store";
import { cn } from "@/lib/utils";

interface ChatInputProps {
  onSend: (message: string) => void;
  onStop: () => void;
  isStreaming: boolean;
  focusTrigger: number;
  reasoningEffort: "low" | "medium" | "high";
  onReasoningEffortChange: (v: "low" | "medium" | "high") => void;
}

export default function ChatInput({
  onSend,
  onStop,
  isStreaming,
  focusTrigger,
  reasoningEffort,
  onReasoningEffortChange,
}: ChatInputProps) {
  const {
    settings,
    setActiveModel,
    updateModel,
    getActiveModel,
    discoverModels,
  } = useChatStore();

  const activeModel = getActiveModel();
  const activeModelId = settings.activeModelId;

  const [input, setInput] = useState("");
  const [modelOpen, setModelOpen] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const modelRef = useRef<HTMLDivElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = Math.min(textarea.scrollHeight, 200) + "px";
    }
  }, [input]);

  // Focus triggers
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  useEffect(() => {
    if (focusTrigger > 0 && !isStreaming) {
      setTimeout(() => textareaRef.current?.focus(), 50);
    }
  }, [focusTrigger, isStreaming]);

  // Close popovers on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (modelRef.current && !modelRef.current.contains(e.target as Node)) {
        setModelOpen(false);
      }
      if (
        reasoningRef.current &&
        !reasoningRef.current.contains(e.target as Node)
      ) {
        setReasoningOpen(false);
      }
    }
    if (modelOpen || reasoningOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [modelOpen, reasoningOpen]);

  const handleSend = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  }, [input, isStreaming, onSend]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSelectModel = (modelId: string, specificModel?: string) => {
    setActiveModel(modelId);
    if (specificModel) updateModel(modelId, { model: specificModel });
    setModelOpen(false);
  };

  const handleDiscover = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    discoverModels(modelId).catch(() => {});
  };

  if (!activeModel) return null;

  const labels: Record<string, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
  };

  return (
    <div className="border-t border-[var(--border)] bg-[var(--surface)]/80 backdrop-blur-xl">
      <div className="max-w-3xl mx-auto px-4 py-3">
        {/* Toolbar Row */}
        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
          {/* Model Dropdown */}
          <div ref={modelRef} className="relative">
            <Button
              variant="ghost"
              size="xs"
              onClick={() => setModelOpen(!modelOpen)}
              className="h-7 gap-1 px-2 text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-md"
            >
              <span className="max-w-[80px] truncate font-medium text-[var(--text-primary)]">
                {activeModel.name}
              </span>
              <span className="text-[var(--text-muted)] truncate max-w-[60px]">
                / {activeModel.model}
              </span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 ml-0.5 transition-transform",
                  modelOpen && "rotate-180"
                )}
              />
            </Button>

            {modelOpen && (
              <div className="absolute bottom-full left-0 mb-1 z-50 w-64 rounded-lg bg-[#0d0d10] border border-[var(--border-strong)] shadow-xl overflow-hidden">
                <div className="text-[10px] text-[var(--text-muted)] px-3 py-1.5 border-b border-[var(--border)]">
                  Provider & Modell
                </div>
                <div className="max-h-48 overflow-y-auto py-1">
                  {settings.models.map((m) => (
                    <div key={m.id}>
                      <div className="flex items-center">
                        <button
                          onClick={() => handleSelectModel(m.id)}
                          className={cn(
                            "flex-1 text-left px-3 py-1.5 text-xs hover:bg-white/[0.05] transition-colors",
                            m.id === activeModelId &&
                              "bg-[var(--accent-glow)]"
                          )}
                        >
                          <div className="font-medium text-[var(--text-primary)]">
                            {m.name}
                          </div>
                          <div className="text-[10px] text-[var(--text-muted)] font-mono">
                            {m.baseURL}
                          </div>
                        </button>
                        <button
                          onClick={(e) => handleDiscover(e, m.id)}
                          className="p-1 mr-1 text-[var(--text-muted)] hover:text-[var(--accent-light)] rounded"
                        >
                          <RefreshCw className="h-3 w-3" />
                        </button>
                      </div>
                      {m.availableModels.length > 0 && (
                        <div className="ml-4 border-l border-[var(--border)] pl-2">
                          {m.availableModels.map((name) => (
                            <button
                              key={name}
                              onClick={() => handleSelectModel(m.id, name)}
                              className={cn(
                                "block w-full text-left px-2 py-1 text-[11px] font-mono hover:bg-white/[0.05] text-[var(--text-secondary)]",
                                m.id === activeModelId &&
                                  m.model === name &&
                                  "text-[var(--accent-light)]"
                              )}
                            >
                              {name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Reasoning Toggle */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              updateModel(activeModel.id, {
                reasoningEnabled: !activeModel.reasoningEnabled,
              })
            }
            className={cn(
              "h-7 gap-1 px-2 text-[11px] border rounded-md transition-colors",
              activeModel.reasoningEnabled
                ? "text-[var(--accent-light)] border-[var(--accent)]/40 bg-[var(--accent-glow)]"
                : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-secondary)]"
            )}
            title="Reasoning ON/OFF"
          >
            <Brain className="h-3.5 w-3.5" />
          </Button>

          {/* Reasoning Effort — only when reasoning is ON */}
          {activeModel.reasoningEnabled && (
            <div ref={reasoningRef} className="relative">
              <Button
                variant="ghost"
                size="xs"
                onClick={() => setReasoningOpen(!reasoningOpen)}
                className="h-7 gap-1 px-2 text-[11px] text-[var(--text-secondary)] border border-[var(--border)] rounded-md hover:text-[var(--text-primary)]"
              >
                {labels[reasoningEffort]}
                <ChevronDown className="h-2.5 w-2.5" />
              </Button>

              {reasoningOpen && (
                <div className="absolute bottom-full left-0 mb-1 z-50 w-28 rounded-lg bg-[#0d0d10] border border-[var(--border-strong)] shadow-xl overflow-hidden">
                  {(["low", "medium", "high"] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => {
                        onReasoningEffortChange(level);
                        setReasoningOpen(false);
                      }}
                      className={cn(
                        "flex items-center w-full text-left px-3 py-1.5 text-xs hover:bg-white/[0.05]",
                        reasoningEffort === level &&
                          "bg-[var(--accent-glow)] text-[var(--accent-light)]"
                      )}
                    >
                      {labels[level]}
                      {reasoningEffort === level && (
                        <Check className="h-3 w-3 ml-auto" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Streaming Toggle */}
          <Button
            variant="ghost"
            size="xs"
            onClick={() =>
              updateModel(activeModel.id, {
                streamingEnabled: !activeModel.streamingEnabled,
              })
            }
            className={cn(
              "h-7 gap-1 px-2 text-[11px] border rounded-md transition-colors",
              activeModel.streamingEnabled
                ? "text-[var(--accent-light)] border-[var(--accent)]/40 bg-[var(--accent-glow)]"
                : "text-[var(--text-muted)] border-[var(--border)] hover:text-[var(--text-secondary)]"
            )}
            title={activeModel.streamingEnabled ? "Streaming ON" : "Streaming OFF"}
          >
            <Zap className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Input Row */}
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
            disabled={isStreaming}
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
                disabled={!input.trim()}
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
          Enter = Senden · Shift+Enter = Zeilenumbruch
        </div>
      </div>
    </div>
  );
}
