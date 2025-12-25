"use client";

import React from "react";
import { EditorSettings, Theme, Language } from "../types";
import { GRADIENTS, LANGUAGES, THEMES } from "../constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  onExport: () => void;
  onExportVideo: () => void;
  onCopyImage: () => void;
  isCopying: boolean;
  isExportingVideo: boolean;
  isCopySupported: boolean;
  exportProgress: number;
  exportEtaMs?: number | null;
  copyStatus?: { tone: "success" | "error"; message: string } | null;
  videoStatus?: { tone: "success" | "error"; message: string } | null;
}

const SettingsPanel: React.FC<SettingsPanelProps> = ({
  settings,
  onSettingsChange,
  onExport,
  onExportVideo,
  onCopyImage,
  isCopying,
  isExportingVideo,
  isCopySupported,
  exportProgress,
  exportEtaMs,
  copyStatus,
  videoStatus,
}) => {
  const etaLabel =
    typeof exportEtaMs === "number"
      ? `~${(Math.max(exportEtaMs, 0) / 1000).toFixed(1)}s`
      : null;
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
    <div className="scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent flex h-full w-80 flex-col gap-6 overflow-y-auto border-r border-slate-800 bg-slate-900/50 p-5 backdrop-blur-xl">
      {/* Header */}
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-semibold tracking-tight text-slate-100">
          Settings
        </h2>
      </div>

      <div className="space-y-6">
        {/* Core Settings */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label className="text-xs font-medium text-slate-400">
              THEME & LANGUAGE
            </Label>
            <div className="grid grid-cols-1 gap-3">
              <Select
                value={settings.theme}
                onValueChange={(value) =>
                  onSettingsChange({ theme: value as Theme })
                }
              >
                <SelectTrigger className="w-full border-slate-700 bg-slate-800/50 text-slate-200 transition-colors hover:bg-slate-800 focus:ring-slate-700">
                  <SelectValue placeholder="Select theme" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900 text-slate-200">
                  {Object.entries(THEMES).map(([key, theme]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="focus:bg-slate-800 focus:text-slate-100"
                    >
                      {theme.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select
                value={settings.language}
                onValueChange={(value) =>
                  onSettingsChange({ language: value as Language })
                }
              >
                <SelectTrigger className="w-full border-slate-700 bg-slate-800/50 text-slate-200 transition-colors hover:bg-slate-800 focus:ring-slate-700">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent className="border-slate-700 bg-slate-900 text-slate-200">
                  {Object.entries(LANGUAGES).map(([key, language]) => (
                    <SelectItem
                      key={key}
                      value={key}
                      className="focus:bg-slate-800 focus:text-slate-100"
                    >
                      {language.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label className="text-xs font-medium text-slate-400">
              BACKGROUND
            </Label>
            <div className="grid grid-cols-5 gap-2">
              {GRADIENTS.map((g, idx) => (
                <button
                  key={idx}
                  onClick={() => onSettingsChange({ background: g })}
                  className={`aspect-square w-full cursor-pointer rounded-lg border-2 transition-all duration-200 ${
                    settings.background === g
                      ? "scale-105 border-white shadow-md ring-2 ring-white/20"
                      : "border-transparent opacity-60 hover:opacity-100"
                  }`}
                  style={{ background: g }}
                  aria-label={`Select background gradient ${idx + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="h-px bg-slate-800/50" />

        {/* Layout Settings */}
        <div className="space-y-4">
          <Label className="text-xs font-medium text-slate-400">LAYOUT</Label>
          
          <div className="space-y-3">
             <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Padding</span>
              <ToggleGroup
                type="single"
                value={String(settings.padding)}
                onValueChange={(value) =>
                  value && onSettingsChange({ padding: parseInt(value, 10) })
                }
                className="w-full justify-start gap-1"
              >
                {paddingOptions.map((value) => (
                  <ToggleGroupItem
                    key={value}
                    value={String(value)}
                    className="h-8 flex-1 rounded-md border border-slate-700 bg-slate-800/30 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 data-[state=on]:border-blue-500/50 data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-100"
                  >
                    {value}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

             <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Font Size</span>
              <ToggleGroup
                type="single"
                value={String(settings.fontSize)}
                onValueChange={(value) =>
                  value && onSettingsChange({ fontSize: parseInt(value, 10) })
                }
                className="w-full justify-start gap-1"
              >
                {fontSizeOptions.map((value) => (
                  <ToggleGroupItem
                    key={value}
                    value={String(value)}
                    className="h-8 flex-1 rounded-md border border-slate-700 bg-slate-800/30 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 data-[state=on]:border-blue-500/50 data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-100"
                  >
                    {value}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

             <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Radius</span>
              <ToggleGroup
                type="single"
                value={String(settings.borderRadius)}
                onValueChange={(value) =>
                  value && onSettingsChange({ borderRadius: parseInt(value, 10) })
                }
                className="w-full justify-start gap-1"
              >
                {radiusOptions.map((value) => (
                  <ToggleGroupItem
                    key={value}
                    value={String(value)}
                    className="h-8 flex-1 rounded-md border border-slate-700 bg-slate-800/30 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 data-[state=on]:border-blue-500/50 data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-100"
                  >
                    {value}
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>

            <div className="flex flex-col gap-1.5">
              <span className="text-xs text-slate-500">Shadow</span>
              <ToggleGroup
                type="single"
                value={settings.borderShadow ?? "border-none"}
                onValueChange={(value) =>
                  value && onSettingsChange({ borderShadow: value })
                }
                className="w-full justify-start gap-1"
              >
                {borderShadowOptions.map((option) => (
                  <ToggleGroupItem
                    key={option.value}
                    value={option.value}
                    className="h-8 flex-1 rounded-md border border-slate-700 bg-slate-800/30 text-xs text-slate-400 hover:bg-slate-800 hover:text-slate-200 data-[state=on]:border-blue-500/50 data-[state=on]:bg-blue-500/20 data-[state=on]:text-blue-100"
                  >
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
          <Label className="text-xs font-medium text-slate-400">WINDOW</Label>
          <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-800/20 p-3 transition-colors hover:border-slate-700">
            <span className="text-sm text-slate-300">Line Numbers</span>
            <Checkbox
              checked={settings.showLineNumbers}
              onCheckedChange={(checked) =>
                onSettingsChange({ showLineNumbers: Boolean(checked) })
              }
              className="border-slate-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
            />
          </div>
          <div className="flex items-center justify-between rounded-md border border-slate-800 bg-slate-800/20 p-3 transition-colors hover:border-slate-700">
            <span className="text-sm text-slate-300">Window Controls</span>
            <Checkbox
              checked={settings.windowControls}
              onCheckedChange={(checked) =>
                onSettingsChange({ windowControls: Boolean(checked) })
              }
               className="border-slate-600 data-[state=checked]:border-blue-600 data-[state=checked]:bg-blue-600"
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
               <div className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                 videoStatus.tone === "success" 
                   ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                   : "border-rose-500/30 bg-rose-500/10 text-rose-300"
               }`}>
                 {videoStatus.message}
               </div>
             )}
             {copyStatus && (
               <div className={`rounded-lg border px-3 py-2 text-xs font-medium ${
                 copyStatus.tone === "success" 
                   ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                   : "border-rose-500/30 bg-rose-500/10 text-rose-300"
               }`}>
                 {copyStatus.message}
               </div>
             )}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
            <Button
            onClick={onCopyImage}
            disabled={isCopying || !isCopySupported}
            variant="secondary"
            className="w-full cursor-pointer border border-slate-700 bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white"
            >
            {isCopying ? "Copying..." : "Copy"}
            </Button>
            <Button 
                onClick={onExport} 
                className="w-full cursor-pointer bg-blue-600 text-white shadow-lg shadow-blue-900/20 hover:bg-blue-500"
            >
            Export
            </Button>
        </div>
        
        <Button
          onClick={onExportVideo}
          disabled={isExportingVideo}
          className="w-full cursor-pointer border border-emerald-600/30 bg-emerald-600/10 text-emerald-400 transition-all duration-300 hover:bg-emerald-600 hover:text-white"
        >
          {isExportingVideo ? "Exporting..." : "Export Video"}
        </Button>
      </div>
    </div>
  );
};

export default SettingsPanel;
