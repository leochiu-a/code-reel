// Code shows tabs at the browser's default tab size.
const TAB = " ".repeat(8);

/** Width in px of the widest line across `codes`, set in `font` (a CSS font shorthand). */
export const measureCodeWidth = (codes: string[], font: string) => {
  const ctx = document.createElement("canvas").getContext("2d");
  if (!ctx) return 0;
  ctx.font = font;
  let widest = 0;
  for (const code of codes) {
    for (const line of code.split("\n")) {
      widest = Math.max(widest, ctx.measureText(line.replaceAll("\t", TAB)).width);
    }
  }
  return Math.ceil(widest);
};
