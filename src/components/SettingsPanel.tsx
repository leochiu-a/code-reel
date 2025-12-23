
"use client";

import React from 'react';
import { EditorSettings, Theme, Language } from '../types';
import { GRADIENTS, THEMES } from '../constants';

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
  videoStatus
}) => {
  const etaLabel =
    typeof exportEtaMs === 'number'
      ? `~${(Math.max(exportEtaMs, 0) / 1000).toFixed(1)}s`
      : null;
  return (
    <div className="w-80 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 h-full overflow-y-auto">
      <div>
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <span className="text-blue-500">Settings</span>
        </h2>

        {/* Theme Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Theme</label>
          <select 
            value={settings.theme}
            onChange={(e) => onSettingsChange({ theme: e.target.value as Theme })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Object.entries(THEMES).map(([key, theme]) => (
              <option key={key} value={key}>{theme.label}</option>
            ))}
          </select>
        </div>

        {/* Language Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Language</label>
          <select 
            value={settings.language}
            onChange={(e) => onSettingsChange({ language: e.target.value as Language })}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="javascript">JavaScript</option>
            <option value="typescript">TypeScript</option>
            <option value="python">Python</option>
            <option value="rust">Rust</option>
            <option value="go">Go</option>
            <option value="cpp">C++</option>
            <option value="html">HTML</option>
            <option value="css">CSS</option>
          </select>
        </div>

        {/* Background Gradients */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">Background</label>
          <div className="grid grid-cols-5 gap-2">
            {GRADIENTS.map((g, idx) => (
              <button
                key={idx}
                onClick={() => onSettingsChange({ background: g })}
                className={`cursor-pointer w-10 h-10 rounded-full border-2 transition-all ${settings.background === g ? 'border-white scale-110 shadow-lg' : 'border-transparent opacity-70 hover:opacity-100'}`}
                style={{ background: g }}
              />
            ))}
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-6">
          <div>
            <label className="flex justify-between text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Padding <span>{settings.padding}px</span>
            </label>
            <input 
              type="range" min="16" max="128" step="8"
              value={settings.padding}
              onChange={(e) => onSettingsChange({ padding: parseInt(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Font Size <span>{settings.fontSize}px</span>
            </label>
            <input 
              type="range" min="12" max="24" step="1"
              value={settings.fontSize}
              onChange={(e) => onSettingsChange({ fontSize: parseInt(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>

          <div>
            <label className="flex justify-between text-sm font-medium text-slate-400 mb-2 uppercase tracking-wider">
              Border Radius <span>{settings.borderRadius}px</span>
            </label>
            <input 
              type="range" min="0" max="40" step="4"
              value={settings.borderRadius}
              onChange={(e) => onSettingsChange({ borderRadius: parseInt(e.target.value) })}
              className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
            />
          </div>
        </div>

        {/* Toggles */}
        <div className="mt-8 space-y-4">
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Line Numbers</span>
            <input 
              type="checkbox" checked={settings.showLineNumbers}
              onChange={(e) => onSettingsChange({ showLineNumbers: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
          </label>
          <label className="flex items-center justify-between cursor-pointer group">
            <span className="text-sm text-slate-300 group-hover:text-white transition-colors">Window Controls</span>
            <input 
              type="checkbox" checked={settings.windowControls}
              onChange={(e) => onSettingsChange({ windowControls: e.target.checked })}
              className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-blue-500"
            />
          </label>
        </div>
      </div>

      <div className="mt-auto pt-6 flex flex-col gap-3">
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
                ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-200 border border-rose-500/30"
            }`}
          >
            {videoStatus.message}
          </div>
        )}
        {copyStatus && (
          <div
            className={`rounded-lg px-3 py-2 text-sm font-medium ${
              copyStatus.tone === "success"
                ? "bg-emerald-500/15 text-emerald-200 border border-emerald-500/30"
                : "bg-rose-500/15 text-rose-200 border border-rose-500/30"
            }`}
          >
            {copyStatus.message}
          </div>
        )}
        <button 
          onClick={onCopyImage}
          disabled={isCopying || !isCopySupported}
          className="cursor-pointer w-full bg-slate-800 hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-slate-900/20 transition-all"
        >
          {isCopying ? 'Copying...' : 'Copy Image'}
        </button>
        <button 
          onClick={onExport}
          className="cursor-pointer w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/20 transition-all"
        >
          Export Image
        </button>
        <button 
          onClick={onExportVideo}
          disabled={isExportingVideo}
          className="cursor-pointer w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-900/20 transition-all"
        >
          {isExportingVideo ? "Exporting..." : "Export Video"}
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
