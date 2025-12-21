import React, { useState, useCallback, useEffect } from "react";
import { toPng } from "html-to-image";
import type { HighlighterCore } from "shiki/core";
import CodeEditor from "./components/CodeEditor";
import SettingsPanel from "./components/SettingsPanel";
import { EditorSettings, Language } from "./types";
import { enhanceCode, detectLanguage } from "./services/geminiService";
import { THEMES } from "./constants";
import { getHighlighter } from "./services/shiki";

const DEFAULT_CODE = `function helloWorld() {
  console.log("Hello from CodeSnap AI!");
  
  const greeting = {
    message: "Create beautiful snippets",
    poweredBy: "Gemini 3"
  };
  
  return greeting;
}`;

const INITIAL_SNIPPET_ID = crypto.randomUUID();

type CodeSnippet = {
  id: string;
  title: string;
  code: string;
};

const App: React.FC = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>([
    { id: INITIAL_SNIPPET_ID, title: "Step 1", code: DEFAULT_CODE },
  ]);
  const [activeSnippetId, setActiveSnippetId] = useState(INITIAL_SNIPPET_ID);
  const [previewIndex, setPreviewIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [highlighter, setHighlighter] = useState<HighlighterCore | null>(null);
  const [settings, setSettings] = useState<EditorSettings>({
    theme: "one-dark",
    language: "javascript",
    padding: 64,
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    showLineNumbers: false,
    windowControls: true,
    fontSize: 16,
    borderRadius: 16,
  });

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const activeSnippetIndex = snippets.findIndex(
    (snippet) => snippet.id === activeSnippetId
  );
  const activeSnippet = snippets[activeSnippetIndex] ?? snippets[0];
  const previewSnippet = snippets[previewIndex] ?? snippets[0];
  const shikiTheme = THEMES[settings.theme].shikiTheme;

  const handleExport = useCallback(() => {
    const node = document.getElementById("code-capture-area");
    if (!node) return;

    toPng(node, {
      cacheBust: true,
      pixelRatio: 2, // High resolution
    })
      .then((dataUrl) => {
        const link = document.createElement("a");
        link.download = `codesnap-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error("Export failed:", err);
      });
  }, []);

  useEffect(() => {
    let mounted = true;
    getHighlighter().then((loaded) => {
      if (!mounted) return;
      setHighlighter(loaded);
    });
    return () => {
      mounted = false;
    };
  }, []);

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
    }, 1100);

    return () => window.clearTimeout(timer);
  }, [isPlaying, previewIndex, snippets.length]);

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

  const handleMagicFix = async () => {
    setIsProcessing(true);
    try {
      const enhanced = await enhanceCode(
        activeSnippet.code,
        "Modernize, add comments, and fix potential bugs."
      );
      setSnippets((prev) =>
        prev.map((snippet) =>
          snippet.id === activeSnippet.id
            ? { ...snippet, code: enhanced }
            : snippet
        )
      );
      const lang = await detectLanguage(enhanced);
      handleSettingsChange({ language: lang as Language });
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#0f172a] overflow-hidden">
      {/* Settings Panel on the Left */}
      <SettingsPanel
        settings={settings}
        onSettingsChange={handleSettingsChange}
        onExport={handleExport}
        onMagicFix={handleMagicFix}
        isProcessing={isProcessing}
      />

      {/* Main Preview Area */}
      <main className="flex-1 overflow-y-auto p-8 lg:p-12 flex items-center justify-center bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black">
        <div className="w-full max-w-5xl flex flex-col gap-6 animate-in fade-in duration-700">
          <div className="text-center mb-4">
            <h1 className="text-4xl font-extrabold text-white tracking-tight mb-2">
              CodeSnap <span className="text-blue-500">AI</span>
            </h1>
            <p className="text-slate-400">
              Transform your code into professional sharing-ready images.
            </p>
          </div>

          <CodeEditor
            code={activeSnippet.code}
            onCodeChange={handleSnippetChange}
            settings={settings}
            showPreview={isPlaying && Boolean(highlighter)}
            preview={
              highlighter
                ? {
                    highlighter,
                    code: previewSnippet.code,
                    language: settings.language,
                    theme: shikiTheme,
                  }
                : undefined
            }
          />

          <section className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2">
                {snippets.map((snippet, index) => (
                  <button
                    key={snippet.id}
                    onClick={() => {
                      setActiveSnippetId(snippet.id);
                      setPreviewIndex(index);
                    }}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      snippet.id === activeSnippet.id
                        ? "border-blue-400 bg-blue-500/10 text-blue-200"
                        : "border-white/10 text-slate-300 hover:border-white/30 hover:text-white"
                    }`}
                  >
                    {snippet.title}
                  </button>
                ))}
                <button
                  onClick={handleAddSnippet}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-200 transition hover:border-white/30 hover:text-white"
                >
                  + Add Step
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleRemoveSnippet}
                  disabled={snippets.length === 1}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Remove
                </button>
                <button
                  onClick={handlePlay}
                  disabled={snippets.length < 2 || !highlighter}
                  className="rounded-full bg-emerald-500/90 px-3 py-1 text-xs font-semibold text-white shadow-lg shadow-emerald-900/20 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPlaying ? "Playing..." : "Play Animation"}
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default App;
