export function computeThemePreviewBackground(
  mappedBackground: string | undefined,
  themeDefaultBackground: string | undefined,
  codeBackground: string,
): string {
  return mappedBackground ?? themeDefaultBackground ?? codeBackground;
}
