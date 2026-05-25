import { beforeEach, describe, expect, it, vi } from 'vitest';

const registerServiceWorker = vi.fn().mockResolvedValue(undefined);
vi.mock('./sw-register', () => ({
  registerServiceWorker: (...args: unknown[]) => registerServiceWorker(...args),
}));

const { bootstrap } = await import('./main');

const FIXTURE_HTML = `
  <div id="id-display">
    <span data-i18n="id.placeholder">Press Generate</span>
  </div>
  <button id="btn-generate" type="button"><span data-i18n="id.generate">Generate</span></button>
  <button id="btn-copy" type="button" disabled><span id="btn-copy-label" data-i18n="id.copy">Copy</span></button>
  <button id="theme-toggle" type="button" data-i18n-aria="theme.toggle.dark"></button>
  <button id="lang-en" type="button" aria-pressed="true">EN</button>
  <button id="lang-th" type="button" aria-pressed="false">TH</button>
  <details id="algo-details">
    <summary><span data-i18n="algo.heading">How it works</span></summary>
    <div id="algo-body"></div>
  </details>
  <details id="digits-details">
    <summary><span data-i18n="digits.heading">What each digit represents</span></summary>
    <div id="digits-body"></div>
  </details>
`;

function mountFixture(): void {
  const wrap = document.createElement('div');
  wrap.dataset.fixture = 'true';
  for (const node of new DOMParser().parseFromString(FIXTURE_HTML, 'text/html').body.childNodes) {
    wrap.appendChild(document.importNode(node, true));
  }
  document.body.appendChild(wrap);
}

beforeEach(() => {
  mountFixture();
});

describe('bootstrap', () => {
  it('wires Generate to populate the display with a formatted ID', () => {
    bootstrap({ registerSW: false });
    const generate = document.getElementById('btn-generate')!;
    const display = document.getElementById('id-display')!;
    generate.click();
    expect(display.textContent).toMatch(/^[1-8]-\d{4}-\d{5}-\d{2}-\d$/);
  });

  it('enables the Copy button after the first generate', () => {
    bootstrap({ registerSW: false });
    const generate = document.getElementById('btn-generate')!;
    const copy = document.getElementById('btn-copy') as HTMLButtonElement;
    expect(copy.disabled).toBe(true);
    generate.click();
    expect(copy.disabled).toBe(false);
  });

  it('copies exactly 13 digits with no separators', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    bootstrap({ registerSW: false });
    document.getElementById('btn-generate')!.click();
    const display = document.getElementById('id-display')!.textContent ?? '';
    document.getElementById('btn-copy')!.click();
    await Promise.resolve();
    await Promise.resolve();
    expect(writeText).toHaveBeenCalledTimes(1);
    const copied = writeText.mock.calls[0]![0] as string;
    expect(copied).toMatch(/^\d{13}$/);
    expect(copied).toBe(display.replace(/-/g, ''));
  });

  it('toggles the dark class on the documentElement when theme-toggle is clicked', () => {
    bootstrap({ registerSW: false });
    const toggle = document.getElementById('theme-toggle')!;
    const startsDark = document.documentElement.classList.contains('dark');
    toggle.click();
    expect(document.documentElement.classList.contains('dark')).toBe(!startsDark);
    toggle.click();
    expect(document.documentElement.classList.contains('dark')).toBe(startsDark);
  });

  it('updates aria-pressed when switching languages', () => {
    bootstrap({ registerSW: false });
    const langEn = document.getElementById('lang-en')!;
    const langTh = document.getElementById('lang-th')!;
    langTh.click();
    expect(langTh.getAttribute('aria-pressed')).toBe('true');
    expect(langEn.getAttribute('aria-pressed')).toBe('false');
    langEn.click();
    expect(langEn.getAttribute('aria-pressed')).toBe('true');
    expect(langTh.getAttribute('aria-pressed')).toBe('false');
  });

  it('triggers a generate when the algorithm details panel is first opened', () => {
    bootstrap({ registerSW: false });
    const details = document.getElementById('algo-details') as HTMLDetailsElement;
    const display = document.getElementById('id-display')!;
    expect(display.textContent).not.toMatch(/^\d-/);
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    expect(display.textContent).toMatch(/^[1-8]-\d{4}-\d{5}-\d{2}-\d$/);
  });

  it('triggers a generate when the digit-breakdown panel is first opened', () => {
    bootstrap({ registerSW: false });
    const details = document.getElementById('digits-details') as HTMLDetailsElement;
    const display = document.getElementById('id-display')!;
    const body = document.getElementById('digits-body')!;
    expect(body.childElementCount).toBe(0);
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    expect(display.textContent).toMatch(/^[1-8]-\d{4}-\d{5}-\d{2}-\d$/);
    expect(body.querySelector('[data-testid="digits-segments"]')).not.toBeNull();
  });

  it('renders the digit breakdown when Generate is clicked', () => {
    bootstrap({ registerSW: false });
    document.getElementById('btn-generate')!.click();
    const segments = document.querySelectorAll('#digits-body [data-testid="digits-segments"] > div');
    expect(segments.length).toBeGreaterThan(0);
  });

  it('re-renders the algorithm view in the new language after a language switch', () => {
    bootstrap({ registerSW: false });
    document.getElementById('btn-generate')!.click();
    document.getElementById('lang-th')!.click();
    const algoHeaders = Array.from(document.querySelectorAll('#algo-body thead th'));
    expect(algoHeaders.map((h) => h.textContent?.trim())).toEqual(['ตำแหน่ง', 'หลัก', 'น้ำหนัก', 'ผลคูณ']);
  });

  it('reverts the Copy button label after the timeout elapses', async () => {
    vi.useFakeTimers();
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    bootstrap({ registerSW: false });
    document.getElementById('btn-generate')!.click();
    document.getElementById('btn-copy')!.click();
    await vi.waitFor(() => expect(writeText).toHaveBeenCalled());
    const label = document.getElementById('btn-copy-label')!;
    expect(label.textContent).toBe('Copied');
    vi.advanceTimersByTime(1600);
    expect(label.textContent).toBe('Copy');
  });

  it('registers the service worker by default and skips it when opted out', () => {
    registerServiceWorker.mockClear();
    bootstrap();
    expect(registerServiceWorker).toHaveBeenCalledTimes(1);

    document.body.replaceChildren();
    mountFixture();
    registerServiceWorker.mockClear();
    bootstrap({ registerSW: false });
    expect(registerServiceWorker).not.toHaveBeenCalled();
  });

  it('mounts the update banner when the service worker reports a new version', () => {
    registerServiceWorker.mockImplementationOnce((onUpdate: (apply: () => Promise<void>) => void) => {
      onUpdate(async () => {});
      return Promise.resolve();
    });
    bootstrap();
    expect(document.getElementById('pwa-update-banner')).not.toBeNull();
  });

  it('falls back to execCommand when the clipboard API rejects', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('blocked'));
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: { writeText },
    });
    const execCommand = vi.fn().mockReturnValue(true);
    Object.defineProperty(document, 'execCommand', {
      configurable: true,
      value: execCommand,
    });
    bootstrap({ registerSW: false });
    document.getElementById('btn-generate')!.click();
    document.getElementById('btn-copy')!.click();
    await vi.waitFor(() => expect(execCommand).toHaveBeenCalledWith('copy'));
  });
});
