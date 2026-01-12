import React, { forwardRef, useCallback } from "react";

interface CodeTextareaProps {
  value: string;
  onValueChange: (value: string) => void;
  showPreview?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ariaLabel?: string;
}

function indentText(text: string) {
  return text
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
}

function dedentText(text: string) {
  return text
    .split("\n")
    .map((line) => line.replace(/^\s\s/, ""))
    .join("\n");
}

function getCurrentlySelectedLine(textarea: HTMLTextAreaElement) {
  const original = textarea.value;
  const selectionStart = textarea.selectionStart;
  const beforeStart = original.slice(0, selectionStart);
  const startIndex = beforeStart.lastIndexOf("\n");
  return original.slice(startIndex !== -1 ? startIndex + 1 : 0).split("\n")[0];
}

function handleTab(textarea: HTMLTextAreaElement, shiftKey: boolean) {
  const original = textarea.value;
  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const beforeStart = original.slice(0, start);
  const currentLine = getCurrentlySelectedLine(textarea);

  if (start === end) {
    if (shiftKey) {
      const newStart = beforeStart.lastIndexOf("\n") + 1;
      textarea.setSelectionRange(newStart, end);
      textarea.setRangeText(dedentText(original.slice(newStart, end)), newStart, end, "end");
    } else {
      textarea.setRangeText("  ", start, end, "end");
    }
    return;
  }

  const newStart = beforeStart.lastIndexOf("\n") + 1 || 0;
  textarea.setSelectionRange(newStart, end);

  if (shiftKey) {
    const newText = dedentText(original.slice(newStart, end));
    textarea.setRangeText(newText, newStart, end, "end");
    if (currentLine.startsWith("  ")) {
      textarea.setSelectionRange(start - 2, start - 2 + newText.length);
    } else {
      textarea.setSelectionRange(start, start + newText.length);
    }
  } else {
    const newText = indentText(original.slice(newStart, end));
    textarea.setRangeText(newText, newStart, end, "end");
    textarea.setSelectionRange(start + 2, start + 2 + newText.length);
  }
}

function handleEnter(textarea: HTMLTextAreaElement) {
  const currentLine = getCurrentlySelectedLine(textarea);
  const { selectionStart, selectionEnd } = textarea;
  const currentIndentationMatch = currentLine.match(/^(\s+)/);
  let wantedIndentation = currentIndentationMatch ? currentIndentationMatch[0] : "";

  if (currentLine.match(/([{\[:>])$/)) {
    wantedIndentation += "  ";
  }

  textarea.setRangeText(`\n${wantedIndentation}`, selectionStart, selectionEnd, "end");
}

function handleBracketClose(textarea: HTMLTextAreaElement) {
  const currentLine = getCurrentlySelectedLine(textarea);
  const { selectionStart, selectionEnd } = textarea;

  if (selectionStart === selectionEnd && currentLine.match(/^\s{2,}$/)) {
    textarea.setSelectionRange(selectionStart - 2, selectionEnd);
  }

  textarea.setRangeText("}", textarea.selectionStart, textarea.selectionEnd, "end");
}

/**
 * Behavior adapted from ray.so's textarea editor:
 * https://github.com/raycast/ray-so/blob/main/app/(navigation)/(code)/components/Editor.tsx
 */
const CodeTextarea = forwardRef<HTMLTextAreaElement, CodeTextareaProps>(
  ({ value, onValueChange, showPreview = false, className, style, ariaLabel }, ref) => {
    const syncValue = useCallback(
      (textarea: HTMLTextAreaElement) => {
        onValueChange(textarea.value);
      },
      [onValueChange],
    );

    const handleKeyDown = useCallback<React.KeyboardEventHandler<HTMLTextAreaElement>>(
      (event) => {
        if (showPreview) return;
        const textarea = event.currentTarget;

        switch (event.key) {
          case "Tab":
            event.preventDefault();
            handleTab(textarea, event.shiftKey);
            syncValue(textarea);
            break;
          case "}":
            event.preventDefault();
            handleBracketClose(textarea);
            syncValue(textarea);
            break;
          case "Enter":
            event.preventDefault();
            handleEnter(textarea);
            syncValue(textarea);
            break;
          default:
            break;
        }
      },
      [showPreview, syncValue],
    );

    const handleChange = useCallback<React.ChangeEventHandler<HTMLTextAreaElement>>(
      (event) => {
        onValueChange(event.target.value);
      },
      [onValueChange],
    );

    return (
      <textarea
        ref={ref}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        wrap="off"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        className={className}
        style={style}
        aria-label={ariaLabel ?? "Code editor"}
      />
    );
  },
);

CodeTextarea.displayName = "CodeTextarea";

export default CodeTextarea;
