import { beforeEach, describe, expect, it } from 'vitest';
import { applyTranslations, getLang, initLang, setLang, t } from './i18n';

function stubLanguage(value: string): void {
  Object.defineProperty(navigator, 'language', {
    configurable: true,
    get: () => value,
  });
}

beforeEach(() => {
  stubLanguage('en-US');
  // initLang reads localStorage first; tests/setup.ts clears storage already.
  // initLang() resets the module-level language back to a clean default.
  initLang();
});

describe('t', () => {
  it('returns the EN string for a known key', () => {
    setLang('en');
    expect(t('id.generate')).toBe('Generate');
  });

  it('returns the TH string after setLang("th")', () => {
    setLang('th');
    expect(t('id.generate')).toBe('สุ่ม');
  });

  it('falls back to the key when not found in the table', () => {
    expect(t('does.not.exist')).toBe('does.not.exist');
  });
});

describe('setLang', () => {
  it('persists the selection to localStorage', () => {
    setLang('th');
    expect(localStorage.getItem('thai-id-lang')).toBe('th');
  });

  it('updates document.documentElement.lang', () => {
    setLang('th');
    expect(document.documentElement.lang).toBe('th');
    setLang('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('exposes the current value via getLang', () => {
    setLang('th');
    expect(getLang()).toBe('th');
  });
});

describe('initLang', () => {
  it('respects a value persisted in localStorage', () => {
    localStorage.setItem('thai-id-lang', 'th');
    expect(initLang()).toBe('th');
    expect(document.documentElement.lang).toBe('th');
  });

  it('falls back to Thai when navigator.language starts with "th" and no storage entry exists', () => {
    stubLanguage('th-TH');
    expect(initLang()).toBe('th');
  });

  it('falls back to English by default', () => {
    stubLanguage('en-US');
    expect(initLang()).toBe('en');
  });

  it('ignores invalid stored values', () => {
    localStorage.setItem('thai-id-lang', 'fr');
    stubLanguage('en-US');
    expect(initLang()).toBe('en');
  });
});

describe('applyTranslations', () => {
  it('writes textContent for elements with data-i18n', () => {
    setLang('en');
    const node = document.createElement('span');
    node.dataset.i18n = 'id.copy';
    document.body.appendChild(node);
    applyTranslations();
    expect(node.textContent).toBe('Copy');
  });

  it('writes aria-label for elements with data-i18n-aria', () => {
    setLang('en');
    const node = document.createElement('button');
    node.dataset.i18nAria = 'theme.toggle.dark';
    document.body.appendChild(node);
    applyTranslations();
    expect(node.getAttribute('aria-label')).toBe('Switch to dark mode');
  });

  it('writes title for elements with data-i18n-title', () => {
    setLang('en');
    const node = document.createElement('a');
    node.dataset.i18nTitle = 'footer.source';
    document.body.appendChild(node);
    applyTranslations();
    expect(node.getAttribute('title')).toBe('Source on GitHub');
  });

  it('updates translations on language change', () => {
    const node = document.createElement('span');
    node.dataset.i18n = 'id.generate';
    document.body.appendChild(node);
    setLang('en');
    expect(node.textContent).toBe('Generate');
    setLang('th');
    expect(node.textContent).toBe('สุ่ม');
  });

  it('skips elements whose i18n attribute value is empty', () => {
    setLang('en');
    const span = document.createElement('span');
    span.setAttribute('data-i18n', '');
    const button = document.createElement('button');
    button.setAttribute('data-i18n-aria', '');
    const link = document.createElement('a');
    link.setAttribute('data-i18n-title', '');
    document.body.append(span, button, link);
    expect(() => applyTranslations()).not.toThrow();
    expect(span.textContent).toBe('');
    expect(button.hasAttribute('aria-label')).toBe(false);
    expect(link.hasAttribute('title')).toBe(false);
  });
});
