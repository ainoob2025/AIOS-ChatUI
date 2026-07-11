"use client";

import { useState } from "react";
import {
  Settings,
  Plus,
  Trash2,
  Wifi,
  Check,
  X,
  RefreshCw,
  Brain,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useChatStore } from "@/lib/store";
import { testConnection } from "@/lib/api";
import { cn } from "@/lib/utils";
import { v4 as uuidv4 } from "uuid";

export default function SettingsDialog() {
  const {
    settings,
    updateSettings,
    addModel,
    removeModel,
    updateModel,
    setActiveModel,
    getActiveModel,
    discoverModels,
  } = useChatStore();

  const [showNewModel, setShowNewModel] = useState(false);
  const [testResult, setTestResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const [testing, setTesting] = useState(false);
  const [discovering, setDiscovering] = useState(false);

  // New model form state
  const [newModel, setNewModel] = useState({
    name: "",
    baseURL: "http://localhost:10010",
    apiKey: "not-needed",
    model: "",
  });

  const activeModel = getActiveModel();

  const handleAddModel = () => {
    if (!newModel.name || !newModel.model) return;
    addModel({
      id: uuidv4(),
      name: newModel.name,
      baseURL: newModel.baseURL,
      endpoint: "/v1/chat/completions",
      apiKey: newModel.apiKey,
      model: newModel.model,
      reasoningEnabled: false,
      reasoningEffort: "medium",
      availableModels: [],
    });
    setNewModel({
      name: "",
      baseURL: "http://localhost:10010",
      apiKey: "not-needed",
      model: "",
    });
    setShowNewModel(false);
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestResult(null);
    const result = await testConnection(
      activeModel?.baseURL || "",
      activeModel?.apiKey || ""
    );
    setTestResult(result);
    setTesting(false);
  };

  const handleDiscover = async () => {
    if (!activeModel) return;
    setDiscovering(true);
    setTestResult(null);
    const models = await discoverModels(activeModel.id);
    setTestResult({
      ok: models.length > 0,
      message:
        models.length > 0
          ? `${models.length} Modelle gefunden`
          : "Keine Modelle gefunden",
    });
    setDiscovering(false);
  };

  const handleModelChange = (value: string | null) => {
    if (value) setActiveModel(value);
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-hover)]"
        >
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[540px] bg-[#0d0d10] border-[var(--border-strong)] text-[var(--text-primary)] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <Settings className="h-5 w-5 text-[var(--accent-light)]" />
            Einstellungen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Model Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium text-[var(--text-secondary)]">
              Aktiver Provider
            </Label>
            <Select
              value={settings.activeModelId}
              onValueChange={handleModelChange}
            >
              <SelectTrigger className="bg-[var(--surface)] border-[var(--border)] text-sm h-10">
                <SelectValue placeholder="Provider wählen" />
              </SelectTrigger>
              <SelectContent className="bg-[#0d0d10] border-[var(--border-strong)]">
                {settings.models.map((m) => (
                  <SelectItem key={m.id} value={m.id} className="text-sm">
                    {m.name} ({m.model})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Active Model Config */}
          {activeModel && (
            <div className="space-y-3 p-4 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
              <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                Provider-Konfiguration
              </Label>

              <div className="space-y-2">
                <Label className="text-xs text-[var(--text-secondary)]">
                  Base URL
                </Label>
                <Input
                  value={activeModel.baseURL}
                  onChange={(e) =>
                    updateModel(activeModel.id, { baseURL: e.target.value })
                  }
                  className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9 font-mono"
                  placeholder="http://localhost:10010"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-[var(--text-secondary)]">
                  API Endpoint
                </Label>
                <Input
                  value={activeModel.endpoint}
                  onChange={(e) =>
                    updateModel(activeModel.id, { endpoint: e.target.value })
                  }
                  className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9 font-mono"
                  placeholder="/v1/chat/completions"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs text-[var(--text-secondary)]">
                  API Key
                </Label>
                <Input
                  value={activeModel.apiKey}
                  onChange={(e) =>
                    updateModel(activeModel.id, { apiKey: e.target.value })
                  }
                  type="password"
                  className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9 font-mono"
                  placeholder="sk-..."
                />
              </div>

              {/* Model Selection with Discovery */}
              <div className="space-y-2">
                <Label className="text-xs text-[var(--text-secondary)]">
                  Model
                </Label>
                {activeModel.availableModels.length > 0 ? (
                  <Select
                    value={activeModel.model}
                    onValueChange={(v) =>
                      v && updateModel(activeModel.id, { model: v })
                    }
                  >
                    <SelectTrigger className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9 font-mono">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d0d10] border-[var(--border-strong)]">
                      {activeModel.availableModels.map((m) => (
                        <SelectItem key={m} value={m} className="text-xs font-mono">
                          {m}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    value={activeModel.model}
                    onChange={(e) =>
                      updateModel(activeModel.id, { model: e.target.value })
                    }
                    className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9 font-mono"
                    placeholder="main-model"
                  />
                )}
              </div>

              {/* Reasoning Toggle */}
              <div className="flex items-center justify-between pt-1">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-[var(--text-muted)]" />
                  <Label className="text-xs text-[var(--text-secondary)]">
                    Reasoning
                  </Label>
                </div>
                <Switch
                  checked={activeModel.reasoningEnabled}
                  onCheckedChange={(checked) =>
                    updateModel(activeModel.id, {
                      reasoningEnabled: checked,
                    })
                  }
                />
              </div>

              {activeModel.reasoningEnabled && (
                <div className="space-y-1 pl-6">
                  <Label className="text-[10px] text-[var(--text-muted)]">
                    Default Effort
                  </Label>
                  <Select
                    value={activeModel.reasoningEffort}
                    onValueChange={(v) =>
                      v &&
                      updateModel(activeModel.id, {
                        reasoningEffort: v as "low" | "medium" | "high",
                      })
                    }
                  >
                    <SelectTrigger className="bg-[var(--surface-elevated)] border-[var(--border)] text-xs h-8 w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#0d0d10] border-[var(--border-strong)]">
                      <SelectItem value="low" className="text-xs">Niedrig</SelectItem>
                      <SelectItem value="medium" className="text-xs">Mittel</SelectItem>
                      <SelectItem value="high" className="text-xs">Hoch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex items-center gap-2 pt-1 flex-wrap">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnection}
                  disabled={testing}
                  className="text-xs border-[var(--border)] hover:bg-[var(--surface-hover)] h-8 gap-1.5"
                >
                  <Wifi className="h-3.5 w-3.5" />
                  {testing ? "Teste..." : "Testen"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDiscover}
                  disabled={discovering}
                  className="text-xs border-[var(--border)] hover:bg-[var(--surface-hover)] h-8 gap-1.5"
                >
                  <RefreshCw
                    className={cn(
                      "h-3.5 w-3.5",
                      discovering && "animate-spin"
                    )}
                  />
                  {discovering ? "Suche..." : "Modelle entdecken"}
                </Button>
                {testResult && (
                  <span
                    className={cn(
                      "text-xs flex items-center gap-1",
                      testResult.ok ? "text-green-400" : "text-red-400"
                    )}
                  >
                    {testResult.ok ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    {testResult.message}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Model Parameters */}
          <div className="space-y-3">
            <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Parameter
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label className="text-xs text-[var(--text-secondary)]">
                  Temperature
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={2}
                  step={0.1}
                  value={settings.temperature}
                  onChange={(e) =>
                    updateSettings({
                      temperature: parseFloat(e.target.value) || 0.7,
                    })
                  }
                  className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs text-[var(--text-secondary)]">
                  Max Tokens
                </Label>
                <Input
                  type="number"
                  min={0}
                  max={32768}
                  value={settings.maxTokens}
                  onChange={(e) =>
                    updateSettings({
                      maxTokens: parseInt(e.target.value) || 0,
                    })
                  }
                  className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9"
                />
                <span className="text-[10px] text-[var(--text-muted)]">
                  0 = kein Limit (Server-Default)
                </span>
              </div>
            </div>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              System Prompt
            </Label>
            <Textarea
              value={settings.systemPrompt}
              onChange={(e) => updateSettings({ systemPrompt: e.target.value })}
              className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-24 resize-none"
              placeholder="Optional: System-Prompt für alle Konversationen..."
            />
          </div>

          {/* All Models */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">
              Alle Provider
            </Label>
            <div className="space-y-1">
              {settings.models.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-sm"
                >
                  <span className="flex-1 truncate">
                    <span className="text-[var(--text-primary)]">{m.name}</span>
                    <span className="text-[var(--text-muted)] ml-2 font-mono text-xs">
                      {m.model} @ {m.baseURL}
                    </span>
                    {m.reasoningEnabled && (
                      <Brain className="h-3 w-3 inline ml-1 text-[var(--accent-light)]" />
                    )}
                  </span>
                  <Tooltip>
                    <TooltipTrigger>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeModel(m.id)}
                        className="h-6 w-6 text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-transparent"
                        disabled={settings.models.length <= 1}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Entfernen</TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>

            {showNewModel ? (
              <div className="space-y-3 p-4 rounded-xl border border-[var(--accent)]/30 bg-[var(--surface)]">
                <div className="space-y-2">
                  <Label className="text-xs">Name</Label>
                  <Input
                    value={newModel.name}
                    onChange={(e) =>
                      setNewModel({ ...newModel, name: e.target.value })
                    }
                    placeholder="Mein Provider"
                    className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Base URL</Label>
                  <Input
                    value={newModel.baseURL}
                    onChange={(e) =>
                      setNewModel({ ...newModel, baseURL: e.target.value })
                    }
                    className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9 font-mono"
                    placeholder="http://localhost:10010"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">API Key</Label>
                  <Input
                    value={newModel.apiKey}
                    onChange={(e) =>
                      setNewModel({ ...newModel, apiKey: e.target.value })
                    }
                    type="password"
                    className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9 font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Model ID</Label>
                  <Input
                    value={newModel.model}
                    onChange={(e) =>
                      setNewModel({ ...newModel, model: e.target.value })
                    }
                    placeholder="main-model"
                    className="bg-[var(--surface-elevated)] border-[var(--border)] text-sm h-9 font-mono"
                  />
                </div>
                <div className="flex gap-2 pt-1">
                  <Button
                    size="sm"
                    onClick={handleAddModel}
                    disabled={!newModel.name || !newModel.model}
                    className="text-xs h-8 bg-[var(--accent)] hover:bg-[var(--accent-light)]"
                  >
                    Hinzufügen
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowNewModel(false)}
                    className="text-xs h-8"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNewModel(true)}
                className="w-full text-xs border-dashed border-[var(--border)] hover:bg-[var(--surface-hover)] h-9 gap-1.5"
              >
                <Plus className="h-3.5 w-3.5" />
                Neuen Provider hinzufügen
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
