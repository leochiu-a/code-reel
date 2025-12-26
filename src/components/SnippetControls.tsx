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
  onReorderSnippet: (fromIndex: number, toIndex: number) => void;
};

const SnippetList: React.FC<SnippetListProps> = ({
  snippets,
  activeSnippetId,
  onSelectSnippet,
  onReorderSnippet,
}) => (
  <div className="flex items-center gap-1 rounded-full bg-slate-800/50 p-1">
    {snippets.map((snippet, index) => (
      <button
        key={snippet.id}
        draggable
        onClick={() => {
          onSelectSnippet(snippet.id, index);
        }}
        onDragStart={(event) => {
          event.dataTransfer.effectAllowed = "move";
          event.dataTransfer.dropEffect = "move";
          event.dataTransfer.setData("text/plain", String(index));
          event.currentTarget.style.cursor = "grabbing";
        }}
        onDragEnd={(event) => {
          event.currentTarget.style.cursor = "grab";
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }}
        onDrop={(event) => {
          event.preventDefault();
          event.currentTarget.style.cursor = "grab";
          const rawIndex = event.dataTransfer.getData("text/plain");
          if (!rawIndex) return;
          const fromIndex = Number(rawIndex);
          if (Number.isNaN(fromIndex) || fromIndex === index) return;
          onReorderSnippet(fromIndex, index);
        }}
        className={`relative cursor-pointer rounded-full px-3 py-1.5 text-xs font-medium transition-all duration-200 active:cursor-grabbing ${
          snippet.id === activeSnippetId
            ? "bg-slate-700 text-white shadow-sm"
            : "text-slate-400 hover:bg-slate-700/50 hover:text-slate-200"
        }`}
      >
        {snippet.title}
      </button>
    ))}
  </div>
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
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 text-slate-400 transition-colors hover:bg-slate-800 hover:text-red-400 disabled:cursor-not-allowed disabled:opacity-30"
    title="Remove Step"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className="h-4 w-4"
    >
      <path
        fillRule="evenodd"
        d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z"
        clipRule="evenodd"
      />
    </svg>
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
  onReorderSnippet: (fromIndex: number, toIndex: number) => void;
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
  onReorderSnippet,
  onResetConfirm,
  onPlay,
  isPlaying,
  isPlayDisabled,
}) => (
  <section className="mx-auto max-w-fit rounded-2xl border border-white/10 bg-black/60 p-2 shadow-2xl backdrop-blur-xl">
    <div className="flex flex-wrap items-center gap-4">
      <div className="flex items-center gap-2">
        <ClientOnlySnippetList
          snippets={snippets}
          activeSnippetId={activeSnippetId}
          onSelectSnippet={onSelectSnippet}
          onReorderSnippet={onReorderSnippet}
        />
        <button
          onClick={onAddSnippet}
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-slate-700 bg-slate-800/50 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          title="Add Step"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-5 w-5"
          >
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
        </button>
      </div>

      <div className="h-6 w-px bg-white/10" />

      <div className="flex items-center gap-2">
        <ClientOnlyRemoveButton
          snippets={snippets}
          onRemoveSnippet={onRemoveSnippet}
        />

        <div className="relative">
          <button
            onClick={() => setIsResetOpen((prev) => !prev)}
            className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-slate-700 bg-slate-800/50 px-3 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            Reset
          </button>
          {isResetOpen && (
            <div className="absolute right-0 bottom-full z-10 mb-2 w-56 rounded-xl border border-white/10 bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md">
              <p className="mb-4 text-sm text-slate-300">
                Are you sure you want to reset all steps?
              </p>
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => setIsResetOpen(false)}
                  className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={onResetConfirm}
                  className="cursor-pointer rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-rose-500"
                >
                  Reset All
                </button>
              </div>
            </div>
          )}
        </div>

        <button
          data-testid="play-animation"
          onClick={onPlay}
          disabled={isPlayDisabled}
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-blue-600 px-4 text-xs font-bold text-white shadow-lg shadow-blue-500/25 transition-all hover:bg-blue-500 hover:shadow-blue-500/40 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isPlaying ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Playing...
            </>
          ) : (
            <>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-3 w-3"
              >
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
              Play
            </>
          )}
        </button>
      </div>
    </div>
  </section>
);

export default SnippetControls;
