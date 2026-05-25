import { describe, expect, it, vi } from 'vitest';
import { getTheme, initTheme, setTheme, toggleTheme } from './theme';

describe('initTheme', () => {
  it('respects a stored "dark" value', () => {
    localStorage.setItem('thai-id-theme', 'dark');
    expect(initTheme()).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('respects a stored "light" value', () => {
    localStorage.setItem('thai-id-theme', 'light');
    expect(initTheme()).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('falls back to prefers-color-scheme: dark when no value is stored', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (q: string) =>
        ({
          matches: q.includes('dark'),
          media: q,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    expect(initTheme()).toBe('dark');
  });

  it('falls back to light when prefers-color-scheme: dark is false', () => {
    vi.spyOn(window, 'matchMedia').mockImplementation(
      (q: string) =>
        ({
          matches: false,
          media: q,
          onchange: null,
          addEventListener: () => {},
          removeEventListener: () => {},
          addListener: () => {},
          removeListener: () => {},
          dispatchEvent: () => false,
        }) as MediaQueryList,
    );
    expect(initTheme()).toBe('light');
  });
});

describe('setTheme + getTheme', () => {
  it('persists and exposes the selection', () => {
    setTheme('dark');
    expect(getTheme()).toBe('dark');
    expect(localStorage.getItem('thai-id-theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    setTheme('light');
    expect(getTheme()).toBe('light');
    expect(localStorage.getItem('thai-id-theme')).toBe('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});

describe('toggleTheme', () => {
  it('flips between light and dark on each call', () => {
    setTheme('light');
    expect(toggleTheme()).toBe('dark');
    expect(toggleTheme()).toBe('light');
    expect(toggleTheme()).toBe('dark');
  });
});
