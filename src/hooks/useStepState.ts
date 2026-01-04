"use client";

import { useEffect, useMemo, useRef, useState, startTransition } from "react";
import { useLocalStorage } from "usehooks-ts";

type CodeSnippet = {
  id: string;
  title: string;
  code: string;
  highlightLines?: number[];
};

type UseStepStateOptions = {
  defaultCode: string;
  defaultSnippets?: Array<{
    code: string;
    highlightLines?: number[];
  }>;
  intervalMs: number;
};

const useStepState = ({ defaultCode, defaultSnippets, intervalMs }: UseStepStateOptions) => {
  const normalizeStepTitles = (list: CodeSnippet[]) =>
    list.map((snippet, index) => ({
      ...snippet,
      title: `Step ${index + 1}`,
    }));

  const [storedSnippets, setStoredSnippets] = useLocalStorage<CodeSnippet[]>(
    "codesnap-snippets",
    [],
  );

  const initialId = useMemo(() => {
    if (storedSnippets.length > 0) {
      return storedSnippets[0]?.id ?? crypto.randomUUID();
    }

    return crypto.randomUUID();
  }, [storedSnippets]);

  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => {
    if (storedSnippets.length > 0) {
      return normalizeStepTitles(storedSnippets);
    }
    const baseSnippets =
      defaultSnippets && defaultSnippets.length > 0
        ? defaultSnippets
        : [{ code: defaultCode, highlightLines: [] }];
    return normalizeStepTitles(
      baseSnippets.map((snippet, index) => ({
        id: index === 0 ? initialId : crypto.randomUUID(),
        title: "",
        code: snippet.code,
        highlightLines: snippet.highlightLines ?? [],
      })),
    );
  });
  const [activeSnippetId, setActiveSnippetId] = useState(initialId);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const [storedStepIndex, setStoredStepIndex] = useLocalStorage<number>("codesnap-current-step", 0);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const hasAppliedStoredRef = useRef(false);

  const activeSnippetIndex = useMemo(
    () => snippets.findIndex((snippet) => snippet.id === activeSnippetId),
    [snippets, activeSnippetId],
  );

  const activeSnippet = snippets[activeSnippetIndex] ?? snippets[0];
  const previewSnippet = snippets[previewIndex] ?? snippets[0];

  const firstSnippetId = snippets[0]?.id;

  useEffect(() => {
    if (!isPlaying) return;
    if (snippets.length < 2) {
      startTransition(() => {
        setIsPlaying(false);
      });
      return;
    }
    const isLastStep = previewIndex >= snippets.length - 1;
    // Add 1 second to the last step to ensure the last step is displayed for at least 1 second
    const timerDuration = isLastStep ? intervalMs + 1000 : intervalMs;
    const timer = window.setTimeout(() => {
      setPreviewIndex((prev) => {
        const next = prev + 1;
        if (next >= snippets.length) {
          startTransition(() => {
            setIsPlaying(false);

            // Reset to the first snippet when the last snippet is reached
            if (firstSnippetId) {
              setActiveSnippetId(firstSnippetId);
            }
          });
          return 0;
        }
        return next;
      });
    }, timerDuration);

    return () => window.clearTimeout(timer);
  }, [firstSnippetId, intervalMs, isPlaying, previewIndex, snippets.length]);

  useEffect(() => {
    if (hasAppliedStoredRef.current) return;
    if (snippets.length === 0) return;

    const clampedIndex = Math.max(0, Math.min(storedStepIndex, snippets.length - 1));
    const targetSnippet = snippets[clampedIndex];

    if (!targetSnippet) return;

    hasAppliedStoredRef.current = true;

    startTransition(() => {
      setActiveSnippetId(targetSnippet.id);
      setPreviewIndex(clampedIndex);
    });
  }, [snippets, storedStepIndex]);

  useEffect(() => {
    const index = Math.max(
      0,
      snippets.findIndex((snippet) => snippet.id === activeSnippetId),
    );
    if (index !== storedStepIndex) {
      setStoredStepIndex(index);
    }
  }, [activeSnippetId, snippets, storedStepIndex, setStoredStepIndex]);

  useEffect(() => {
    if (snippets.length === 0) return;
    setStoredSnippets(snippets);
  }, [snippets, setStoredSnippets]);

  const handleSnippetChange = (nextCode: string) => {
    setSnippets((prev) =>
      prev.map((snippet) =>
        snippet.id === activeSnippet.id ? { ...snippet, code: nextCode } : snippet,
      ),
    );
  };

  const handleHighlightLinesChange = (nextLines: number[]) => {
    setSnippets((prev) =>
      prev.map((snippet) =>
        snippet.id === activeSnippet.id ? { ...snippet, highlightLines: nextLines } : snippet,
      ),
    );
  };

  const handleAddSnippet = () => {
    const id = crypto.randomUUID();
    setSnippets((prev) => {
      const baseCode = prev[prev.length - 1]?.code ?? "";
      const next = normalizeStepTitles([
        ...prev,
        {
          id,
          title: "",
          code: baseCode,
          highlightLines: [],
        },
      ]);
      setActiveSnippetId(id);
      setPreviewIndex(next.length - 1);
      return next;
    });
  };

  const handleRemoveSnippet = () => {
    setSnippets((prev) => {
      if (prev.length === 1) return prev;
      const currentIndex = prev.findIndex((snippet) => snippet.id === activeSnippet.id);
      const next = normalizeStepTitles(prev.filter((snippet) => snippet.id !== activeSnippet.id));
      const nextIndex = Math.max(0, Math.min(currentIndex, next.length - 1));
      const nextSnippet = next[nextIndex];
      if (nextSnippet) {
        setActiveSnippetId(nextSnippet.id);
        setPreviewIndex(nextIndex);
      }
      return next;
    });
  };

  const handleReorderSnippet = (fromIndex: number, toIndex: number) => {
    setSnippets((prev) => {
      if (
        fromIndex === toIndex ||
        fromIndex < 0 ||
        toIndex < 0 ||
        fromIndex >= prev.length ||
        toIndex >= prev.length
      ) {
        return prev;
      }

      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);

      next.splice(toIndex, 0, moved);

      const normalized = normalizeStepTitles(next);
      const nextActiveIndex = normalized.findIndex((snippet) => snippet.id === activeSnippetId);

      if (nextActiveIndex >= 0) {
        setPreviewIndex(nextActiveIndex);
      }

      return normalized;
    });
  };

  const handlePlay = () => {
    if (snippets.length < 2) return;
    setPreviewIndex(0);
    setIsPlaying(true);
  };

  const handleSelectSnippet = (id: string, index: number) => {
    setActiveSnippetId(id);
    setPreviewIndex(index);
  };

  const handleResetConfirm = () => {
    const resetId = crypto.randomUUID();
    const nextSnippets = [{ id: resetId, title: "Step 1", code: defaultCode, highlightLines: [] }];
    setSnippets(nextSnippets);
    setStoredSnippets(nextSnippets);
    setActiveSnippetId(resetId);
    setPreviewIndex(0);
    setIsPlaying(false);
    setStoredStepIndex(0);
    setIsResetOpen(false);
  };

  return {
    snippets,
    activeSnippet,
    previewSnippet,
    previewIndex,
    isPlaying,
    isResetOpen,
    setIsResetOpen,
    handleSnippetChange,
    handleHighlightLinesChange,
    handleAddSnippet,
    handleRemoveSnippet,
    handleReorderSnippet,
    handlePlay,
    handleSelectSnippet,
    handleResetConfirm,
  };
};

export default useStepState;
