
import React, { useState, useCallback, useEffect } from 'react';
import { toPng } from 'html-to-image';
import CodeEditor from './components/CodeEditor';
import SettingsPanel from './components/SettingsPanel';
import { EditorSettings, Language } from './types';
import { enhanceCode, detectLanguage } from './services/geminiService';

const DEFAULT_CODE = `function helloWorld() {
  console.log("Hello from CodeSnap AI!");
  
  const greeting = {
    message: "Create beautiful snippets",
    poweredBy: "Gemini 3"
  };
  
  return greeting;
}`;

const App: React.FC = () => {
  const [code, setCode] = useState(DEFAULT_CODE);
  const [isProcessing, setIsProcessing] = useState(false);
  const [settings, setSettings] = useState<EditorSettings>({
    theme: 'one-dark',
    language: 'javascript',
    padding: 64,
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    showLineNumbers: true,
    windowControls: true,
    fontSize: 16,
    borderRadius: 16,
  });

  const handleSettingsChange = (newSettings: Partial<EditorSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const handleExport = useCallback(() => {
    const node = document.getElementById('code-capture-area');
    if (!node) return;

    toPng(node, { 
        cacheBust: true,
        pixelRatio: 2 // High resolution
    })
      .then((dataUrl) => {
        const link = document.createElement('a');
        link.download = `codesnap-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      })
      .catch((err) => {
        console.error('Export failed:', err);
      });
  }, []);

  const handleMagicFix = async () => {
    setIsProcessing(true);
    try {
      const enhanced = await enhanceCode(code, "Modernize, add comments, and fix potential bugs.");
      setCode(enhanced);
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
            <p className="text-slate-400">Transform your code into professional sharing-ready images.</p>
          </div>

          <CodeEditor 
            code={code} 
            onCodeChange={setCode} 
            settings={settings} 
          />

          <div className="flex justify-center gap-4 text-xs text-slate-500 font-mono">
            <span>TIP: Paste your code directly into the frame.</span>
            <span>•</span>
            <span>Powered by Gemini 3</span>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
