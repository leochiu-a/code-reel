"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "usehooks-ts";

type CodeSnippet = {
  id: string;
  title: string;
  code: string;
};

type UseStepStateOptions = {
  defaultCode: string;
  intervalMs: number;
};

const useStepState = ({ defaultCode, intervalMs }: UseStepStateOptions) => {
  const initialSnippetIdRef = useRef(crypto.randomUUID());
  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => [
    { id: initialSnippetIdRef.current, title: "Step 1", code: defaultCode },
  ]);
  const [activeSnippetId, setActiveSnippetId] = useState(
    initialSnippetIdRef.current
  );
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [storedStepIndex, setStoredStepIndex] = useLocalStorage<number>(
    "codesnap-current-step",
    0
  );
  const [isResetOpen, setIsResetOpen] = useState(false);
  const hasAppliedStoredRef = useRef(false);

  const activeSnippetIndex = useMemo(
    () => snippets.findIndex((snippet) => snippet.id === activeSnippetId),
    [snippets, activeSnippetId]
  );
  const activeSnippet = snippets[activeSnippetIndex] ?? snippets[0];
  const previewSnippet = snippets[previewIndex] ?? snippets[0];

  useEffect(() => {
    if (!isPlaying) return;
    if (snippets.length < 2) {
      setIsPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => {
      setPreviewIndex((prev) => {
        const next = prev + 1;
        if (next >= snippets.length) {
          setIsPlaying(false);
          return prev;
        }
        return next;
      });
    }, intervalMs);

    return () => window.clearTimeout(timer);
  }, [intervalMs, isPlaying, previewIndex, snippets.length]);

  useEffect(() => {
    if (hasAppliedStoredRef.current) return;
    if (snippets.length === 0) return;
    const clampedIndex = Math.max(
      0,
      Math.min(storedStepIndex, snippets.length - 1)
    );
    const targetSnippet = snippets[clampedIndex];
    if (!targetSnippet) return;
    hasAppliedStoredRef.current = true;
    setActiveSnippetId(targetSnippet.id);
    setPreviewIndex(clampedIndex);
  }, [snippets, storedStepIndex]);

  useEffect(() => {
    const index = Math.max(
      0,
      snippets.findIndex((snippet) => snippet.id === activeSnippetId)
    );
    if (index !== storedStepIndex) {
      setStoredStepIndex(index);
    }
  }, [activeSnippetId, snippets, storedStepIndex, setStoredStepIndex]);

  const handleSnippetChange = (nextCode: string) => {
    setSnippets((prev) =>
      prev.map((snippet) =>
        snippet.id === activeSnippet.id
          ? { ...snippet, code: nextCode }
          : snippet
      )
    );
  };

  const handleAddSnippet = () => {
    const id = crypto.randomUUID();
    setSnippets((prev) => {
      const nextIndex = prev.length + 1;
      const baseCode = prev[prev.length - 1]?.code ?? "";
      const next = [
        ...prev,
        {
          id,
          title: `Step ${nextIndex}`,
          code: baseCode,
        },
      ];
      setActiveSnippetId(id);
      setPreviewIndex(next.length - 1);
      return next;
    });
  };

  const handleRemoveSnippet = () => {
    setSnippets((prev) => {
      if (prev.length === 1) return prev;
      const currentIndex = prev.findIndex(
        (snippet) => snippet.id === activeSnippet.id
      );
      const next = prev.filter((snippet) => snippet.id !== activeSnippet.id);
      const nextIndex = Math.max(0, Math.min(currentIndex, next.length - 1));
      const nextSnippet = next[nextIndex];
      if (nextSnippet) {
        setActiveSnippetId(nextSnippet.id);
        setPreviewIndex(nextIndex);
      }
      return next;
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
    setSnippets([{ id: resetId, title: "Step 1", code: defaultCode }]);
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
    handleAddSnippet,
    handleRemoveSnippet,
    handlePlay,
    handleSelectSnippet,
    handleResetConfirm,
  };
};

export default useStepState;
