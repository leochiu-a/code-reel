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

const isClipboardImageSupported = () =>
  typeof window !== "undefined" && "clipboard" in navigator && "ClipboardItem" in window;

const useImageExport = () => {
  const [isCopying, setIsCopying] = useState(false);
  const [copyStatus, setCopyStatus] = useState<CopyStatus>(null);
  const [isCopySupported, setIsCopySupported] = useState(false);

  const onExport = useCallback(() => {
    const node = getCaptureNode();
    if (!node) return;

    const { captureOptions } = buildCapture(node);

    domToPng(node, captureOptions)
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

  return { onExport, onCopyImage, isCopying, copyStatus, isCopySupported };
};

export default useImageExport;
