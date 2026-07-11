"use client";

import { useEffect, useCallback } from "react";
import { ChevronDown, Brain, RefreshCw } from "lucide-react";
import { useChatStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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

  const activeModelId = settings.activeModelId;

  const activeModel = getActiveModel();

  // Auto-discover models on mount
  useEffect(() => {
    if (activeModel && activeModel.availableModels.length === 0) {
      discoverModels(activeModel.id);
    }
  }, [activeModel?.id]);

  const handleDiscover = useCallback(
    (e: React.MouseEvent, modelId: string) => {
      e.preventDefault();
      e.stopPropagation();
      discoverModels(modelId);
    },
    [discoverModels]
  );

  const handleSelectModel = useCallback(
    (modelId: string, specificModel?: string) => {
      setActiveModel(modelId);
      if (specificModel) {
        updateModel(modelId, { model: specificModel });
      }
    },
    [setActiveModel, updateModel]
  );

  const reasoningEffortLabels: Record<string, string> = {
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
  };

  return (
    <div className="flex items-center gap-2">
      {/* Provider/Model Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button
            variant="ghost"
            className="h-8 gap-1.5 px-2 text-xs text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)] border border-[var(--border)] rounded-lg"
          >
            <span className="max-w-[120px] truncate font-medium text-[var(--text-primary)]">
              {activeModel?.name || "Modell"}
            </span>
            <span className="text-[var(--text-muted)] truncate max-w-[100px]">
              {activeModel?.model || ""}
            </span>
            <ChevronDown className="h-3 w-3 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-72 bg-[#0d0d10] border-[var(--border-strong)]"
        >
          <DropdownMenuLabel className="text-xs text-[var(--text-muted)]">
            Provider & Modell
          </DropdownMenuLabel>
          {settings.models.map((m) => (
            <div key={m.id}>
              <div className="flex items-center">
                <DropdownMenuItem
                  onClick={() => handleSelectModel(m.id)}
                  className={cn(
                    "flex-1 text-sm cursor-pointer",
                    m.id === activeModelId && "bg-[var(--accent-glow)]"
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{m.name}</span>
                    <span className="text-xs text-[var(--text-muted)]">
                      {m.baseURL}
                    </span>
                  </div>
                </DropdownMenuItem>
                <Tooltip>
                  <TooltipTrigger>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => handleDiscover(e, m.id)}
                      className="h-7 w-7 text-[var(--text-muted)] hover:text-[var(--accent-light)] shrink-0"
                    >
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Modelle entdecken</TooltipContent>
                </Tooltip>
              </div>
              {/* Available models for this provider */}
              {m.availableModels.length > 0 && (
                <div className="ml-4 border-l border-[var(--border)] pl-2 py-1 space-y-0.5">
                  {m.availableModels.map((modelName) => (
                    <DropdownMenuItem
                      key={modelName}
                      onClick={() => handleSelectModel(m.id, modelName)}
                      className={cn(
                        "text-xs py-1.5 cursor-pointer font-mono",
                        m.id === activeModelId &&
                          m.model === modelName &&
                          "text-[var(--accent-light)]"
                      )}
                    >
                      {modelName}
                    </DropdownMenuItem>
                  ))}
                </div>
              )}
            </div>
          ))}
          <DropdownMenuSeparator className="bg-[var(--border)]" />
          <DropdownMenuItem
            disabled
            className="text-xs text-[var(--text-muted)]"
          >
            Weitere Provider in den Einstellungen
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reasoning Effort — nur sichtbar wenn Provider Reasoning enabled hat */}
      {activeModel?.reasoningEnabled && (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button
              variant="ghost"
              className="h-8 gap-1 px-2 text-xs border rounded-lg"
              style={{
                color: "var(--accent-light)",
                borderColor: "rgba(59,130,246,0.3)",
              }}
            >
              <Brain className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">
                {reasoningEffortLabels[reasoningEffort]}
              </span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="start"
            className="w-40 bg-[#0d0d10] border-[var(--border-strong)]"
          >
            <DropdownMenuLabel className="text-xs text-[var(--text-muted)]">
              Reasoning Effort
            </DropdownMenuLabel>
            {(["low", "medium", "high"] as const).map((level) => (
              <DropdownMenuItem
                key={level}
                onClick={() => onReasoningEffortChange(level)}
                className={cn(
                  "text-sm cursor-pointer",
                  reasoningEffort === level && "bg-[var(--accent-glow)]"
                )}
              >
                {reasoningEffortLabels[level]}
                {reasoningEffort === level && (
                  <span className="ml-auto text-[var(--accent-light)]">✓</span>
                )}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
