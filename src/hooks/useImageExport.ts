import { useCallback, useEffect, useState } from "react";
import { domToPng } from "modern-screenshot";

type CopyStatus = {
  tone: "success" | "error";
  message: string;
} | null;

const getCaptureNode = () => document.getElementById("code-capture-area");

const getCaptureSize = (node: HTMLElement) => ({
  width: Math.ceil(node.scrollWidth),
  height: Math.ceil(node.scrollHeight),
});

const createCaptureStyle = (width: number, height: number) => ({
  width: `${width}px`,
  height: `${height}px`,
});

const buildCapture = (node: HTMLElement) => {
  const { width, height } = getCaptureSize(node);
  return {
    width,
    height,
    captureOptions: {
      quality: 1,
      scale: 2,
      width,
      height,
      style: createCaptureStyle(width, height),
    },
  };
};

const nextFrame = () =>
  new Promise<void>((resolve) => {
    // Allow React to render the "Copying..." state before heavy image work runs.
    requestAnimationFrame(() => resolve());
  });

const isClipboardImageSupported = () =>
  typeof window !== "undefined" && "clipboard" in navigator && "ClipboardItem" in window;

const useImageExport = () => {
  const [isCopying, setIsCopying] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [isCopySupported, setIsCopySupported] = useState(false);

  const onExport = useCallback(async () => {
    const node = getCaptureNode();
    if (!node) return;

    setIsExporting(true);
    await nextFrame();
    await nextFrame();
    const { captureOptions } = buildCapture(node);

    try {
      const dataUrl = await domToPng(node, captureOptions);
      const link = document.createElement("a");
      link.download = `codesnap-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setIsExporting(false);
    }
  }, []);

  const onCopyImage = useCallback(async () => {
    if (!isClipboardImageSupported()) {
      setCopyStatus({
        tone: "error",
        message: "Clipboard image copy is not supported in this browser.",
      });
      return;
    }

    const node = getCaptureNode();
    if (!node) return;

    setIsCopying(true);
    // First frame: state enters the render/layout pipeline.
    // Second frame: browser finishes paint.
    // Then run domToPng to avoid blocking UI and delaying the "Copying..." label.
    await nextFrame();
    await nextFrame();
    const { captureOptions } = buildCapture(node);

    try {
      const dataUrl = await domToPng(node, captureOptions);
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setCopyStatus({ tone: "success", message: "Image copied to clipboard." });
    } catch (err) {
      console.error("Copy failed:", err);
      setCopyStatus({
        tone: "error",
        message: "Copy failed. Please try again.",
      });
    } finally {
      setIsCopying(false);
    }
  }, []);

  useEffect(() => {
    if (!copyStatus) return;
    const timer = window.setTimeout(() => {
      setCopyStatus(null);
    }, 2200);
    return () => window.clearTimeout(timer);
  }, [copyStatus]);

  useEffect(() => {
    setIsCopySupported(isClipboardImageSupported());
  }, []);

  return {
    onExport,
    onCopyImage,
    isCopying,
    isExporting,
    copyStatus,
    isCopySupported,
  };
};

export default useImageExport;
