"use client";

import React from "react";
import dynamic from "next/dynamic";
import { Plus, Trash2, Play } from "lucide-react";
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/components/animate-ui/components/radix/toggle-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/animate-ui/components/radix/popover";

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
}) => {
  const snippetIndex = React.useMemo(
    () => new Map(snippets.map((snippet, index) => [snippet.id, index])),
    [snippets],
  );

  return (
    <ToggleGroup
      type="single"
      value={activeSnippetId}
      onValueChange={(nextValue) => {
        if (!nextValue) return;
        const index = snippetIndex.get(nextValue);
        if (index === undefined) return;
        onSelectSnippet(nextValue, index);
      }}
    >
      {snippets.map((snippet, index) => (
        <ToggleGroupItem
          key={snippet.id}
          value={snippet.id}
          draggable
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
        >
          {snippet.title}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
};

const ClientOnlySnippetList = dynamic(() => Promise.resolve(SnippetList), {
  ssr: false,
});

type RemoveButtonProps = {
  snippets: CodeSnippet[];
  onRemoveSnippet: () => void;
};

const RemoveButton: React.FC<RemoveButtonProps> = ({ snippets, onRemoveSnippet }) => (
  <button
    onClick={onRemoveSnippet}
    disabled={snippets.length === 1}
    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#222] text-slate-300 transition-colors hover:bg-white/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-30"
    title="Remove Step"
  >
    <Trash2 className="h-4 w-4" />
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
  <section className="mx-auto max-w-fit rounded-2xl border border-white/10 bg-[#1c1c1c] p-2 shadow-[0_18px_40px_-20px_rgba(0,0,0,0.9)]">
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
          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-[#222] text-slate-300 transition-colors hover:bg-white/10 hover:text-white"
          title="Add Step"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="h-6 w-px bg-white/10" />

      <div className="flex items-center gap-2">
        <ClientOnlyRemoveButton snippets={snippets} onRemoveSnippet={onRemoveSnippet} />

        <Popover open={isResetOpen} onOpenChange={setIsResetOpen}>
          <PopoverTrigger asChild>
            <button className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full border border-white/10 bg-[#222] px-3 text-xs font-medium text-slate-300 transition-colors hover:bg-white/10 hover:text-white">
              Reset
            </button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            side="top"
            sideOffset={8}
            className="w-56 rounded-xl border border-white/10 bg-[#1b1b1b] p-4 shadow-2xl"
          >
            <p className="mb-4 text-sm text-slate-300">Are you sure you want to reset all steps?</p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setIsResetOpen(false)}
                className="cursor-pointer rounded-lg px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onResetConfirm();
                  setIsResetOpen(false);
                }}
                className="cursor-pointer rounded-lg bg-rose-500/90 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-colors hover:bg-rose-500"
              >
                Reset All
              </button>
            </div>
          </PopoverContent>
        </Popover>

        <button
          data-testid="play-animation"
          onClick={onPlay}
          disabled={isPlayDisabled}
          className="flex h-8 cursor-pointer items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-900/30 transition-all hover:bg-emerald-400 hover:shadow-emerald-900/45 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
        >
          {isPlaying ? (
            <>
              <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
              Playing...
            </>
          ) : (
            <>
              <Play className="h-3 w-3" />
              Play
            </>
          )}
        </button>
      </div>
    </div>
  </section>
);

export default SnippetControls;
