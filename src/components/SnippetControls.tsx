"use client";

import React from "react";
import dynamic from "next/dynamic";

type CodeSnippet = {
  id: string;
  title: string;
  code: string;
};

type SnippetListProps = {
  snippets: CodeSnippet[];
  activeSnippetId: string;
  onSelectSnippet: (id: string, index: number) => void;
};

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  activeSnippetId,
  onSelectSnippet,
}) => (
  <>
    {snippets.map((snippet, index) => (
      <button
        key={snippet.id}
        onClick={() => {
          onSelectSnippet(snippet.id, index);
        }}
        className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
          snippet.id === activeSnippetId
            ? "border-blue-400 bg-blue-500/10 text-blue-200"
            : "border-white/10 text-slate-300 hover:border-white/30 hover:text-white"
        }`}
      >
        {snippet.title}
      </button>
    ))}
  </>
);

const ClientOnlySnippetList = dynamic(() => Promise.resolve(SnippetList), {
  ssr: false,
});

type RemoveButtonProps = {
  snippets: CodeSnippet[];
  onRemoveSnippet: () => void;
};

const RemoveButton: React.FC<RemoveButtonProps> = ({
  snippets,
  onRemoveSnippet,
}) => (
  <button
    onClick={onRemoveSnippet}
    disabled={snippets.length === 1}
    className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
  >
    Remove
  </button>
);

const ClientOnlyRemoveButton = dynamic(() => Promise.resolve(RemoveButton), {
  ssr: false,
});

type SnippetControlsProps = {
  snippets: CodeSnippet[];
  activeSnippetId: string;
  isResetOpen: boolean;
  setIsResetOpen: React.Dispatch<React.SetStateAction<boolean>>;
  onSelectSnippet: (id: string, index: number) => void;
  onAddSnippet: () => void;
  onRemoveSnippet: () => void;
  onResetConfirm: () => void;
  onPlay: () => void;
  isPlaying: boolean;
  isPlayDisabled: boolean;
};

const SnippetControls: React.FC<SnippetControlsProps> = ({
  snippets,
  activeSnippetId,
  isResetOpen,
  setIsResetOpen,
  onSelectSnippet,
  onAddSnippet,
  onRemoveSnippet,
  onResetConfirm,
  onPlay,
  isPlaying,
  isPlayDisabled,
}) => (
  <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex flex-wrap gap-2">
        <ClientOnlySnippetList
          snippets={snippets}
          activeSnippetId={activeSnippetId}
          onSelectSnippet={onSelectSnippet}
        />
        <button
          onClick={onAddSnippet}
          className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
        >
          + Add Step
        </button>
      </div>

      <div className="flex items-center gap-2">
        <ClientOnlyRemoveButton
          snippets={snippets}
          onRemoveSnippet={onRemoveSnippet}
        />
        <div className="relative">
          <button
            onClick={() => setIsResetOpen((prev) => !prev)}
            className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
          >
            Reset
          </button>
          {isResetOpen && (
            <div className="absolute right-0 z-10 mt-2 w-56 rounded-xl border border-white/10 bg-slate-950 p-3 text-xs text-slate-200 shadow-2xl">
              <p className="mb-3 text-slate-300">
                Reset all steps and start over?
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsResetOpen(false)}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={onResetConfirm}
                  className="rounded-full bg-rose-500/90 px-3 py-1 text-xs font-semibold text-white transition hover:bg-rose-400"
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
        <button
          data-testid="play-animation"
          onClick={onPlay}
          disabled={isPlayDisabled}
          className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPlaying ? "Playing..." : "Play Animation"}
        </button>
      </div>
    </div>
  </section>
);

export default SnippetControls;
