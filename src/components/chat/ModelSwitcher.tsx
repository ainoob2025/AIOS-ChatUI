"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronDown, Brain, RefreshCw, Check } from "lucide-react";
import { useChatStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ModelSwitcherProps {
  reasoningEffort: "low" | "medium" | "high";
  onReasoningEffortChange: (v: "low" | "medium" | "high") => void;
}

export default function ModelSwitcher({
  reasoningEffort,
  onReasoningEffortChange,
}: ModelSwitcherProps) {
  const {
    settings,
    setActiveModel,
    updateModel,
    getActiveModel,
    discoverModels,
  } = useChatStore();

  const activeModel = getActiveModel();
  const activeModelId = settings.activeModelId;

  const [open, setOpen] = useState(false);
  const [reasoningOpen, setReasoningOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const reasoningRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
      if (
        reasoningRef.current &&
        !reasoningRef.current.contains(e.target as Node)
      ) {
        setReasoningOpen(false);
      }
    }
    if (open || reasoningOpen) {
      document.addEventListener("mousedown", handleClick);
    }
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, reasoningOpen]);

  // Auto-discover models on mount
  useEffect(() => {
    if (activeModel && activeModel.availableModels.length === 0) {
      discoverModels(activeModel.id).catch(() => {});
    }
  }, [activeModel?.id]);

  const handleSelectModel = useCallback(
    (modelId: string, specificModel?: string) => {
      setActiveModel(modelId);
      if (specificModel) {
        updateModel(modelId, { model: specificModel });
      }
      setOpen(false);
    },
    [setActiveModel, updateModel]
  );

  const handleDiscover = useCallback(
    (e: React.MouseEvent, modelId: string) => {
      e.stopPropagation();
      discoverModels(modelId).catch(() => {});
    },
    [discoverModels]
  );

  const labels: Record<string, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
  };

  if (!activeModel) return null;

  return (
    <div className="flex items-center gap-2">
      {/* Provider/Model Selector */}
      <div ref={dropdownRef} className="relative">
        <Button
          variant="ghost"
          onClick={() => setOpen(!open)}
          className="h-8 gap-1.5 px-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg"
        >
          <span className="max-w-[120px] truncate font-medium text-[var(--text-primary)]">
            {activeModel.name}
          </span>
          <span className="text-[var(--text-muted)] truncate max-w-[100px]">
            {activeModel.model}
          </span>
          <ChevronDown
            className={cn("h-3 w-3 transition-transform", open && "rotate-180")}
          />
        </Button>

        {open && (
          <div className="absolute top-full left-0 mt-1 z-50 w-72 rounded-lg bg-[#0d0d10] border border-[var(--border-strong)] shadow-xl overflow-hidden">
            <div className="text-xs text-[var(--text-muted)] px-3 py-2 border-b border-[var(--border)]">
              Provider & Modell
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {settings.models.map((m) => (
                <div key={m.id}>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleSelectModel(m.id)}
                      className={cn(
                        "flex-1 text-left px-3 py-2 text-sm hover:bg-white/[0.05] transition-colors",
                        m.id === activeModelId && "bg-[var(--accent-glow)]"
                      )}
                    >
                      <div className="font-medium text-[var(--text-primary)]">
                        {m.name}
                      </div>
                      <div className="text-[10px] text-[var(--text-muted)] font-mono mt-0.5">
                        {m.baseURL}{m.endpoint}
                      </div>
                    </button>
                    <button
                      onClick={(e) => handleDiscover(e, m.id)}
                      className="p-1.5 mr-1 text-[var(--text-muted)] hover:text-[var(--accent-light)] rounded"
                      title="Modelle entdecken"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </button>
                  </div>
                  {m.availableModels.length > 0 && (
                    <div className="ml-4 border-l border-[var(--border)] pl-2">
                      {m.availableModels.map((modelName) => (
                        <button
                          key={modelName}
                          onClick={() => handleSelectModel(m.id, modelName)}
                          className={cn(
                            "block w-full text-left px-3 py-1.5 text-xs font-mono hover:bg-white/[0.05] transition-colors text-[var(--text-secondary)]",
                            m.id === activeModelId &&
                              m.model === modelName &&
                              "text-[var(--accent-light)]"
                          )}
                        >
                          {modelName}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="text-[10px] text-[var(--text-muted)] px-3 py-2 border-t border-[var(--border)]">
              Weitere in den Einstellungen
            </div>
          </div>
        )}
      </div>

      {/* Reasoning Effort */}
      {activeModel.reasoningEnabled && (
        <div ref={reasoningRef} className="relative">
          <Button
            variant="ghost"
            onClick={() => setReasoningOpen(!reasoningOpen)}
            className="h-8 gap-1 px-2 text-xs border rounded-lg"
            style={{
              color: "var(--accent-light)",
              borderColor: "rgba(59,130,246,0.3)",
            }}
          >
            <Brain className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">{labels[reasoningEffort]}</span>
          </Button>

          {reasoningOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 w-36 rounded-lg bg-[#0d0d10] border border-[var(--border-strong)] shadow-xl overflow-hidden">
              <div className="text-[10px] text-[var(--text-muted)] px-3 py-1.5 border-b border-[var(--border)]">
                Reasoning Effort
              </div>
              {(["low", "medium", "high"] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => {
                    onReasoningEffortChange(level);
                    setReasoningOpen(false);
                  }}
                  className={cn(
                    "flex items-center w-full text-left px-3 py-1.5 text-sm hover:bg-white/[0.05] transition-colors",
                    reasoningEffort === level && "bg-[var(--accent-glow)]"
                  )}
                >
                  {labels[level]}
                  {reasoningEffort === level && (
                    <Check className="h-3.5 w-3.5 ml-auto text-[var(--accent-light)]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
