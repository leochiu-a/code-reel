import { DEFAULT_EDITOR_SETTINGS, getThemeSettings } from "../constants";
import type { EditorSettings, Theme } from "../types";

// The editor's settings, persisted between visits. They seed the editor on
// mount and are written back as they change; nothing renders from the stored
// copy, so plain storage is enough and its writes never re-render the editor.
const STORAGE_KEY = "codesnap-settings";

export const readStoredSettings = (): Partial<EditorSettings> => {
  try {
    return JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
};

export const writeStoredSettings = (settings: EditorSettings) => {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Storage can be full or blocked; the editor keeps working without it.
  }
};

/**
 * Makes `theme` the look the editor opens with, as the landing page's template
 * cards do before navigating. Going through storage keeps the URL plain: a
 * query param would have to be dropped after use, and changing the search
 * params remounts the page in the App Router.
 */
export const storeTheme = (theme: Theme) => {
  const stored = { ...DEFAULT_EDITOR_SETTINGS, ...readStoredSettings() };
  writeStoredSettings({ ...stored, ...getThemeSettings(theme, stored.background) });
};
