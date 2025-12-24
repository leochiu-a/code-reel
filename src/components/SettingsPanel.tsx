"use client";

import React from "react";
import { EditorSettings, Theme, Language } from "../types";
import { GRADIENTS, LANGUAGES, THEMES } from "../constants";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

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
    typeof exportEtaMs === "number" ? `~${(Math.max(exportEtaMs, 0) / 1000).toFixed(1)}s` : null;
  const paddingOptions = [16, 32, 64, 96];
  const fontSizeOptions = [12, 14, 16, 20];
  const radiusOptions = [0, 8, 16, 32];
  return (
    <div className="flex h-full w-80 flex-col gap-8 overflow-y-auto border-r border-slate-800 bg-slate-900 p-6">
      <div>
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold">
          <span className="text-blue-500">Settings</span>
        </h2>

        {/* Theme Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium tracking-wider text-slate-400 uppercase">
            Theme
          </label>
          <select
            value={settings.theme}
            onChange={(e) => onSettingsChange({ theme: e.target.value as Theme })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(THEMES).map(([key, theme]) => (
              <option key={key} value={key}>
                {theme.label}
              </option>
            ))}
          </select>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium tracking-wider text-slate-400 uppercase">
            Language
          </label>
          <select
            value={settings.language}
            onChange={(e) => onSettingsChange({ language: e.target.value as Language })}
            className="w-full rounded-lg border border-slate-700 bg-slate-800 p-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
          >
            {Object.entries(LANGUAGES).map(([key, language]) => (
              <option key={key} value={key}>
                {language.label}
              </option>
            ))}
          </select>
        </div>

        {/* Background Gradients */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium tracking-wider text-slate-400 uppercase">
            Background
          </label>
          <div className="grid grid-cols-5 gap-2">
            {GRADIENTS.map((g, idx) => (
              <button
                key={idx}
                onClick={() => onSettingsChange({ background: g })}
                className={`h-10 w-10 cursor-pointer rounded-full border-2 transition-all ${
                  settings.background === g
                    ? "scale-110 border-white shadow-lg"
                    : "border-transparent opacity-70 hover:opacity-100"
                }`}
                style={{ background: g }}
              />
            ))}
          </div>
        </div>

        {/* Size Controls */}
        <div className="space-y-6">
          <div>
            <label className="mb-2 flex justify-between text-sm font-medium tracking-wider text-slate-400 uppercase">
              Padding
            </label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={String(settings.padding)}
              onValueChange={(value) => {
                if (!value) return;
                onSettingsChange({ padding: parseInt(value, 10) });
              }}
              spacing={0}
              className="w-full"
            >
              {paddingOptions.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={String(value)}
                  className="flex-1 cursor-pointer justify-center border-slate-700/80 text-xs text-slate-300 transition data-[state=on]:border-blue-400/60 data-[state=on]:bg-blue-500/15 data-[state=on]:text-blue-100"
                >
                  {value}px
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <label className="mb-2 flex justify-between text-sm font-medium tracking-wider text-slate-400 uppercase">
              Font Size
            </label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={String(settings.fontSize)}
              onValueChange={(value) => {
                if (!value) return;
                onSettingsChange({ fontSize: parseInt(value, 10) });
              }}
              spacing={0}
              className="w-full"
            >
              {fontSizeOptions.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={String(value)}
                  className="flex-1 cursor-pointer justify-center border-slate-700/80 text-xs text-slate-300 transition data-[state=on]:border-blue-400/60 data-[state=on]:bg-blue-500/15 data-[state=on]:text-blue-100"
                >
                  {value}px
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>

          <div>
            <label className="mb-2 flex justify-between text-sm font-medium tracking-wider text-slate-400 uppercase">
              Border Radius
            </label>
            <ToggleGroup
              type="single"
              variant="outline"
              size="sm"
              value={String(settings.borderRadius)}
              onValueChange={(value) => {
                if (!value) return;
                onSettingsChange({ borderRadius: parseInt(value, 10) });
              }}
              spacing={0}
              className="w-full"
            >
              {radiusOptions.map((value) => (
                <ToggleGroupItem
                  key={value}
                  value={String(value)}
                  className="flex-1 cursor-pointer justify-center border-slate-700/80 text-xs text-slate-300 transition data-[state=on]:border-blue-400/60 data-[state=on]:bg-blue-500/15 data-[state=on]:text-blue-100"
                >
                  {value}px
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-8 space-y-4">
          <label className="group flex cursor-pointer items-center justify-between">
            <span className="text-sm text-slate-300 transition-colors group-hover:text-white">
              Line Numbers
            </span>
            <input
              type="checkbox"
              checked={settings.showLineNumbers}
              onChange={(e) => onSettingsChange({ showLineNumbers: e.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="group flex cursor-pointer items-center justify-between">
            <span className="text-sm text-slate-300 transition-colors group-hover:text-white">
              Window Controls
            </span>
            <input
              type="checkbox"
              checked={settings.windowControls}
              onChange={(e) => onSettingsChange({ windowControls: e.target.checked })}
              className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="mt-auto flex flex-col gap-3 pt-6">
        {isExportingVideo && (
          <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
            <div className="flex items-center justify-between text-xs text-emerald-200/80">
              <span>Exporting video...</span>
              {etaLabel && <span>{etaLabel}</span>}
            </div>
            <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-950/60">
              <div
                className="h-full rounded-full bg-emerald-400 transition-[width] duration-150"
                style={{ width: `${Math.round(exportProgress * 100)}%` }}
              />
            </div>
          </div>
        )}
        {videoStatus && (
          <div
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              videoStatus.tone === "success"
                ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                : "border border-rose-500/30 bg-rose-500/15 text-rose-200"
            }`}
          >
            {videoStatus.message}
          </div>
        )}
        {copyStatus && (
          <div
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              copyStatus.tone === "success"
                ? "border border-emerald-500/30 bg-emerald-500/15 text-emerald-200"
                : "border border-rose-500/30 bg-rose-500/15 text-rose-200"
            }`}
          >
            {copyStatus.message}
          </div>
        )}
        <button
          onClick={onCopyImage}
          disabled={isCopying || !isCopySupported}
          className="w-full cursor-pointer rounded-xl bg-slate-800 px-4 py-3 font-bold text-white shadow-lg shadow-slate-900/20 transition-all hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCopying ? "Copying..." : "Copy Image"}
        </button>
        <button
          onClick={onExport}
          className="w-full cursor-pointer rounded-xl bg-blue-600 px-4 py-3 font-bold text-white shadow-lg shadow-blue-900/20 transition-all hover:bg-blue-500"
        >
          Export Image
        </button>
        <button
          onClick={onExportVideo}
          disabled={isExportingVideo}
          className="w-full cursor-pointer rounded-xl bg-emerald-600 px-4 py-3 font-bold text-white shadow-lg shadow-emerald-900/20 transition-all hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExportingVideo ? "Exporting..." : "Export Video"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
