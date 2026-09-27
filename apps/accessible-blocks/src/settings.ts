// What a visitor chose, remembered in this browser only. Storage can be
// missing or blocked (private windows), so the app works without it.

export type Level = "symbols" | "words" | "java";

export interface Settings {
  level: Level;
  /** Text size in percent, from 100 to 150. */
  size: number;
  dark: boolean;
  contrast: boolean;
  dyslexia: boolean;
  help: boolean;
}

const KEY = "accessible-blocks-settings";

export const SIZE_MIN = 100;
export const SIZE_MAX = 150;

const prefersDark = () => {
  try {
    return matchMedia("(prefers-color-scheme: dark)").matches;
  } catch {
    return false;
  }
};

export function loadSettings(): Settings {
  const defaults: Settings = { level: "words", size: 100, dark: prefersDark(), contrast: false, dyslexia: false, help: true };
  try {
    const saved = { ...defaults, ...JSON.parse(localStorage.getItem(KEY) ?? "{}") };
    // Values saved by an older version fall back to the defaults.
    if (!["symbols", "words", "java"].includes(saved.level)) saved.level = defaults.level;
    if (typeof saved.size !== "number" || saved.size < SIZE_MIN || saved.size > SIZE_MAX) saved.size = defaults.size;
    return saved;
  } catch {
    return defaults;
  }
}

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(settings));
  } catch {
    // Not remembered, but everything still works.
  }
}
