import { describe, expect, test } from "vitest";
import { computeEnterInsert } from "./handleEnter";

describe("computeEnterInsert", () => {
  test("cursor 在行首時不增加縮排", () => {
    // // jsx\n|function Chart({ data, enabled }) {
    const value = "// jsx\nfunction Chart({ data, enabled }) {";
    const cursorPos = 7; // 在 'f' 前面

    expect(computeEnterInsert(value, cursorPos)).toBe("\n");
  });

  test("cursor 在行尾且行末有 { 時增加兩格縮排", () => {
    // function Chart({ data, enabled }) {|
    const value = "function Chart({ data, enabled }) {";
    const cursorPos = value.length;

    expect(computeEnterInsert(value, cursorPos)).toBe("\n  ");
  });

  test("cursor 在有縮排的行尾且行末有 { 時，保留縮排並增加兩格", () => {
    // "  useEffect(() => {|"
    const value = "  useEffect(() => {";
    const cursorPos = value.length;

    expect(computeEnterInsert(value, cursorPos)).toBe("\n    ");
  });

  test("cursor 在有縮排的行尾且行末沒有 { 時，只保留縮排", () => {
    // "  let ref;|"
    const value = "  let ref;";
    const cursorPos = value.length;

    expect(computeEnterInsert(value, cursorPos)).toBe("\n  ");
  });

  test("cursor 在行中間時，只使用 cursor 前的內容判斷縮排", () => {
    // "  let |ref;"  cursor 在行中間，{ 不在 cursor 前
    const value = "  let ref;";
    const cursorPos = 6; // 在 'r' 前

    expect(computeEnterInsert(value, cursorPos)).toBe("\n  ");
  });
});
