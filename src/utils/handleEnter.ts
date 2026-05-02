/**
 * Computes the string to insert when the Enter key is pressed.
 *
 * Only the content **before** the cursor on the current line is used to
 * determine indentation, so pressing Enter at the start of a line (e.g.
 * before `function foo() {`) does not incorrectly add extra indentation.
 *
 * @param value - The full textarea content.
 * @param selectionStart - The cursor position (collapsed selection).
 * @returns A newline character followed by the computed indentation string.
 */
export function computeEnterInsert(value: string, selectionStart: number): string {
  const beforeCursor = value.slice(0, selectionStart);
  const lineStart = beforeCursor.lastIndexOf("\n") + 1;
  const currentLineBeforeCursor = beforeCursor.slice(lineStart);

  const indentMatch = currentLineBeforeCursor.match(/^(\s+)/);
  let indent = indentMatch ? indentMatch[0] : "";

  if (currentLineBeforeCursor.match(/([{\[:>])$/)) {
    indent += "  ";
  }

  return `\n${indent}`;
}
