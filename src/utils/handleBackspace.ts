export function computeBackspaceDelete(
  value: string,
  selectionStart: number,
  selectionEnd: number,
): { value: string; selectionStart: number } {
  if (selectionStart !== selectionEnd) {
    return {
      value: value.slice(0, selectionStart) + value.slice(selectionEnd),
      selectionStart,
    };
  }

  if (selectionStart === 0) {
    return { value, selectionStart: 0 };
  }

  return {
    value: value.slice(0, selectionStart - 1) + value.slice(selectionStart),
    selectionStart: selectionStart - 1,
  };
}
