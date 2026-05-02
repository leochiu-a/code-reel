import { describe, expect, test } from "vitest";
import { computeBackspaceDelete } from "./handleBackspace";

describe("computeBackspaceDelete", () => {
  test("cursor 在行首（position 0）時什麼都不做", () => {
    const value = "function Chart() {}";
    expect(computeBackspaceDelete(value, 0, 0)).toEqual({
      value: "function Chart() {}",
      selectionStart: 0,
    });
  });

  test("一般字符：刪除 cursor 前一個字符", () => {
    // "let ref;|" → "let ref"
    const value = "let ref;";
    const pos = value.length;
    expect(computeBackspaceDelete(value, pos, pos)).toEqual({
      value: "let ref",
      selectionStart: 7,
    });
  });

  test("cursor 在行首（非第一行）時，刪除前一個換行，合併到前一行末尾", () => {
    // "// jsx\n|function" → "// jsxfunction"
    const value = "// jsx\nfunction";
    const cursorPos = 7; // before 'f'
    expect(computeBackspaceDelete(value, cursorPos, cursorPos)).toEqual({
      value: "// jsxfunction",
      selectionStart: 6,
    });
  });

  test("有選取範圍時刪除整個選取", () => {
    // "let [ref];", selectionStart=4, selectionEnd=7
    const value = "let ref;";
    expect(computeBackspaceDelete(value, 4, 7)).toEqual({
      value: "let ;",
      selectionStart: 4,
    });
  });
});
