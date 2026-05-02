export const HIGHLIGHT_PADDING_PX = 14;

export type OnboardingRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

export function computeHighlightRect(
  rect: { top: number; left: number; width: number; height: number } | null,
  padding: number,
): OnboardingRect | null {
  if (!rect) return null;
  return {
    top: Math.max(rect.top - padding, 12),
    left: Math.max(rect.left - padding, 12),
    width: rect.width + padding * 2,
    height: rect.height + padding * 2,
  };
}
