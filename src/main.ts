import './style.css';
import { generateThaiId, formatThaiId } from './generator';
import { initLang, setLang, t, applyTranslations, getLang, type Lang } from './i18n';
import { initTheme, toggleTheme, getTheme } from './theme';
import { log } from './logger';
import { registerServiceWorker } from './sw-register';
import { renderAlgorithmTrace, clearAlgorithmTrace } from './algorithm-view';
import { renderDigitsBreakdown, clearDigitsBreakdown } from './digits-view';
import { clearChildren } from './dom';
import { showUpdateBanner } from './update-banner';

/** Options accepted by `bootstrap`. */
export interface BootstrapOptions {
  /**
   * When `true` (default), the service worker is registered via
   * `registerServiceWorker`. Tests pass `false` to skip the registration so
   * the `virtual:pwa-register` module never resolves in the test environment.
   */
  registerSW?: boolean;
}

const COPY_RESET_MS = 1500;

/**
 * Wires the DOM elements declared in `index.html` to the application's
 * generators, renderers, and platform integrations.
 *
 * `bootstrap` is invoked once per page load. It assumes that the DOM tree from
 * `index.html` is already present; calling it before `DOMContentLoaded` throws
 * because the `byId` lookups expect every required element to exist.
 *
 * The function:
 *
 *  1. Reads stored theme and language preferences and applies them to the
 *     document.
 *  2. Registers click handlers for the generate, copy, theme, and language
 *     controls.
 *  3. Lazily populates the algorithm and digits-breakdown panels on first
 *     expand.
 *  4. Registers the service worker (unless `registerSW: false`) and mounts the
 *     update banner when a new version is available.
 *
 * @param options - Optional bootstrap configuration. See `BootstrapOptions`.
 * @throws {Error} When any required DOM element is missing.
 */
export function bootstrap(options: BootstrapOptions = {}): void {
  const { registerSW = true } = options;

  const idDisplay = byId<HTMLDivElement>('id-display');
  const btnGenerate = byId<HTMLButtonElement>('btn-generate');
  const btnCopy = byId<HTMLButtonElement>('btn-copy');
  const btnCopyLabel = byId<HTMLSpanElement>('btn-copy-label');
  const themeToggle = byId<HTMLButtonElement>('theme-toggle');
  const langEn = byId<HTMLButtonElement>('lang-en');
  const langTh = byId<HTMLButtonElement>('lang-th');
  const algoBody = byId<HTMLDivElement>('algo-body');
  const algoDetails = byId<HTMLDetailsElement>('algo-details');
  const digitsBody = byId<HTMLDivElement>('digits-body');
  const digitsDetails = byId<HTMLDetailsElement>('digits-details');

  // The current 13-digit raw value, without separators, used by Copy and the
  // language-switch handler so re-renders stay synchronised with the display.
  let currentRawId = '';
  let copyResetTimer: number | undefined;

  function setIdDisplay(raw: string): void {
    currentRawId = raw;
    clearChildren(idDisplay);
    idDisplay.textContent = formatThaiId(raw);
    btnCopy.disabled = false;
  }

  function onGenerate(): void {
    const raw = generateThaiId();
    setIdDisplay(raw);
    renderAlgorithmTrace(algoBody, raw.slice(0, 12));
    renderDigitsBreakdown(digitsBody, raw);
  }

  async function onCopy(): Promise<void> {
    if (!currentRawId) return;
    // The clipboard receives the raw 13-digit number so downstream form
    // fields and validators accept it without further parsing.
    const text = currentRawId;
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      log.warn('navigator.clipboard.writeText rejected; falling back to execCommand', err);
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch (execErr) {
        log.error('execCommand("copy") fallback failed', execErr);
      }
      document.body.removeChild(ta);
    }
    btnCopyLabel.textContent = t('id.copied');
    if (copyResetTimer !== undefined) window.clearTimeout(copyResetTimer);
    copyResetTimer = window.setTimeout(() => {
      btnCopyLabel.textContent = t('id.copy');
    }, COPY_RESET_MS);
  }

  function onToggleTheme(): void {
    toggleTheme();
    updateThemeToggleAria();
  }

  function updateThemeToggleAria(): void {
    const isDark = getTheme() === 'dark';
    const key = isDark ? 'theme.toggle.light' : 'theme.toggle.dark';
    themeToggle.dataset.i18nAria = key;
    themeToggle.setAttribute('aria-label', t(key));
  }

  function selectLang(lang: Lang): void {
    setLang(lang);
    langEn.setAttribute('aria-pressed', String(lang === 'en'));
    langTh.setAttribute('aria-pressed', String(lang === 'th'));
    updateThemeToggleAria();
    if (currentRawId) {
      renderAlgorithmTrace(algoBody, currentRawId.slice(0, 12));
      renderDigitsBreakdown(digitsBody, currentRawId);
    }
  }

  initTheme();
  const initialLang = initLang();
  langEn.setAttribute('aria-pressed', String(initialLang === 'en'));
  langTh.setAttribute('aria-pressed', String(initialLang === 'th'));
  applyTranslations();
  updateThemeToggleAria();
  clearAlgorithmTrace(algoBody);
  clearDigitsBreakdown(digitsBody);

  btnGenerate.addEventListener('click', onGenerate);
  btnCopy.addEventListener('click', () => {
    void onCopy();
  });
  themeToggle.addEventListener('click', onToggleTheme);
  langEn.addEventListener('click', () => selectLang('en'));
  langTh.addEventListener('click', () => selectLang('th'));

  algoDetails.addEventListener('toggle', () => {
    if (algoDetails.open && !currentRawId) onGenerate();
  });

  digitsDetails.addEventListener('toggle', () => {
    if (digitsDetails.open && !currentRawId) onGenerate();
  });

  if (registerSW) {
    void registerServiceWorker((applyUpdate) => {
      log.info('new service worker version available; showing reload banner');
      showUpdateBanner(applyUpdate);
    });
  }

  log.info('bootstrap complete', { lang: getLang(), theme: getTheme() });
}

function byId<T extends HTMLElement>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error(`Missing element #${id}`);
  return node as T;
}

/* v8 ignore start */
// Auto-bootstrap when loaded as the browser entry point. This branch is
// excluded from coverage because it only fires in real browsers, never in
// the Vitest happy-dom environment (which sets `import.meta.env.VITEST`).
if (typeof document !== 'undefined' && !import.meta.env?.VITEST) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => bootstrap());
  } else {
    bootstrap();
  }
}
/* v8 ignore stop */
