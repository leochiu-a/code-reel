"use client";

import React from "react";
import { EditorSettings, Language } from "../types";
import { DEFAULT_EDITOR_SETTINGS, LANGUAGES } from "../constants";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/animate-ui/components/radix/toggle-group";
import { Checkbox } from "@/components/animate-ui/components/radix/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface SettingsPanelProps {
  settings: EditorSettings;
  onSettingsChange: (settings: Partial<EditorSettings>) => void;
  isExportingVideo: boolean;
  exportProgress: number;
  exportEtaMs?: number | null;
  copyStatus?: { tone: "success" | "error"; message: string } | null;
  videoStatus?: { tone: "success" | "error"; message: string } | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  isExportingVideo,
  exportProgress,
  exportEtaMs,
  copyStatus,
  videoStatus,
}) => {
  const etaLabel =
    typeof exportEtaMs === "number" ? `~${(Math.max(exportEtaMs, 0) / 1000).toFixed(1)}s` : null;
  const paddingOptions = [16, 32, 64, 96];
  const fontSizeOptions = [12, 14, 16, 20];
  const radiusOptions = [0, 8, 16, 32];
  const borderShadowOptions = [
    { label: "None", value: "border-none" },
    {
      label: "Glass",
      value:
        "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.9) 0px 0px 0px 1px, rgba(255, 255, 255, 0.4) 0px 0px 0px 1.5px inset, rgba(0, 0, 0, 0.45) 0px 25px 20px -20px",
    },
  ];

  return (
    <div className="flex h-full w-60 flex-col gap-6 overflow-y-auto bg-[#212121] p-5 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.9)]">
      <div className="space-y-6">
        {/* Core Settings */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label className="text-xs font-medium text-white/90">LANGUAGE</Label>
            <div className="grid grid-cols-1 gap-3">
              <Select
                value={settings.language}
                onValueChange={(value) => onSettingsChange({ language: value as Language })}
              >
                <SelectTrigger className="w-full border-white/10 bg-white/5 text-slate-100 transition-colors hover:bg-white/10 focus:ring-emerald-500/40">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-[#141414] text-slate-100">
                  {Object.entries(LANGUAGES).map(([key, language]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="focus:bg-white/10 focus:text-white"
                    >
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-800/50" />

        {/* Layout Settings */}
        <div className="space-y-4">
          <Label className="text-xs font-medium text-white/90">LAYOUT</Label>

          <div className="space-y-3">
            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white/80">Padding</span>
              <ToggleGroup
                type="single"
                value={String(settings.padding)}
                onValueChange={(value) =>
                  value && onSettingsChange({ padding: parseInt(value, 10) })
                }
                className="w-full justify-start gap-1"
              >
                {paddingOptions.map((value) => (
                  <ToggleGroupItem key={value} value={String(value)} className="h-8 flex-1">
                    {value}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white/80">Font Size</span>
              <ToggleGroup
                type="single"
                value={String(settings.fontSize)}
                onValueChange={(value) =>
                  value && onSettingsChange({ fontSize: parseInt(value, 10) })
                }
                className="w-full justify-start gap-1"
              >
                {fontSizeOptions.map((value) => (
                  <ToggleGroupItem key={value} value={String(value)} className="h-8 flex-1">
                    {value}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white/80">Radius</span>
              <ToggleGroup
                type="single"
                value={String(settings.borderRadius)}
                onValueChange={(value) =>
                  value && onSettingsChange({ borderRadius: parseInt(value, 10) })
                }
                className="w-full justify-start gap-1"
              >
                {radiusOptions.map((value) => (
                  <ToggleGroupItem key={value} value={String(value)} className="h-8 flex-1">
                    {value}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-white/80">Shadow</span>
              <ToggleGroup
                type="single"
                value={settings.borderShadow ?? DEFAULT_EDITOR_SETTINGS.borderShadow}
                onValueChange={(value) => value && onSettingsChange({ borderShadow: value })}
                className="w-full justify-start gap-1"
              >
                {borderShadowOptions.map((option) => (
                  <ToggleGroupItem key={option.value} value={option.value} className="h-8 flex-1">
                    {option.label}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-800/50" />

        {/* Visibility */}
        <div className="space-y-3">
          <Label className="text-xs font-medium text-white/90">WINDOW</Label>
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/20">
            <span className="text-sm text-slate-200">Line Numbers</span>
            <Checkbox
              checked={settings.showLineNumbers}
              onCheckedChange={(checked) => onSettingsChange({ showLineNumbers: Boolean(checked) })}
              className="border-white/20 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-white/10 bg-white/5 p-3 transition-colors hover:border-white/20">
            <span className="text-sm text-slate-200">Window Controls</span>
            <Checkbox
              checked={settings.windowControls}
              onCheckedChange={(checked) => onSettingsChange({ windowControls: Boolean(checked) })}
              className="border-white/20 data-[state=checked]:border-emerald-500 data-[state=checked]:bg-emerald-500"
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="mt-auto flex flex-col gap-3 pt-6">
        {isExportingVideo && (
          <div className="animate-pulse rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            <div className="flex items-center justify-between text-xs text-emerald-200/80">
              <span>Exporting video...</span>
              {etaLabel && <span className="font-mono">{etaLabel}</span>}
            </div>
            <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-emerald-950/60">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-300 ease-out"
                style={{ width: `${Math.round(exportProgress * 100)}%` }}
              />
            </div>
          </div>
        )}

        {(videoStatus || copyStatus) && (
          <div className="space-y-2">
            {videoStatus && (
              <div
                className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                  videoStatus.tone === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {videoStatus.message}
              </div>
            )}
            {copyStatus && (
              <div
                className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                  copyStatus.tone === "success"
                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                    : "border-rose-500/30 bg-rose-500/10 text-rose-300"
                }`}
              >
                {copyStatus.message}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPanel;
