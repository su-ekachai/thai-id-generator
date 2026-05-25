/**
 * Light / dark theme state. The chosen theme persists in `localStorage` and
 * is applied to the document as a `dark` class on `<html>`, which Tailwind v4
 * picks up via the project's `@custom-variant dark` declaration.
 *
 * The early-loaded `public/theme-init.js` script applies the persisted theme
 * before the bundle runs, eliminating the flash of unstyled content. The
 * bundle then calls `initTheme()` to keep the module-level `current` in sync.
 *
 * @packageDocumentation
 */

/** Supported themes. */
export type Theme = 'light' | 'dark';

/** `localStorage` key under which the chosen theme persists. */
const STORAGE_KEY = 'thai-id-theme';

/**
 * Resolves the initial theme using the priority order:
 *
 *  1. Value stored under `localStorage[STORAGE_KEY]` when it is `'light'` or `'dark'`.
 *  2. `window.matchMedia('(prefers-color-scheme: dark)')`.
 *  3. Default `'light'` (matchMedia falls back to non-matching in tests).
 */
function detectInitialTheme(): Theme {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

let current: Theme = 'light';

/**
 * Returns the currently-active theme.
 *
 * @returns Either `'light'` or `'dark'`.
 */
export function getTheme(): Theme {
  return current;
}

/**
 * Applies the given theme to the document, updating both `localStorage` and
 * the `dark` class on `<html>`.
 *
 * @param theme - The theme to apply.
 */
export function setTheme(theme: Theme): void {
  current = theme;
  localStorage.setItem(STORAGE_KEY, theme);
  document.documentElement.classList.toggle('dark', theme === 'dark');
}

/**
 * Flips between light and dark and returns the new value.
 *
 * @returns The theme value applied by this call.
 */
export function toggleTheme(): Theme {
  setTheme(current === 'dark' ? 'light' : 'dark');
  return current;
}

/**
 * Initialises the theme module on page load. Reads the persisted choice (or
 * detects from `prefers-color-scheme`) and writes it to the DOM so the rest
 * of the bundle stays in sync with `public/theme-init.js`.
 *
 * @returns The resolved theme.
 */
export function initTheme(): Theme {
  current = detectInitialTheme();
  document.documentElement.classList.toggle('dark', current === 'dark');
  return current;
}
