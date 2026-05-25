import { beforeEach, describe, expect, it, vi } from 'vitest';
import { setLang } from './i18n';
import { hideUpdateBanner, showUpdateBanner } from './update-banner';

beforeEach(() => {
  setLang('en');
});

describe('showUpdateBanner', () => {
  it('mounts a banner with the correct ARIA attributes', () => {
    showUpdateBanner(vi.fn());
    const banner = document.getElementById('pwa-update-banner');
    expect(banner).not.toBeNull();
    expect(banner!.getAttribute('role')).toBe('status');
    expect(banner!.getAttribute('aria-live')).toBe('polite');
  });

  it('renders translated strings for label, button, and dismiss control', () => {
    setLang('en');
    showUpdateBanner(vi.fn());
    expect(document.querySelector('.pwa-update-banner__text')?.textContent).toBe('A new version is available.');
    expect(document.querySelector('.pwa-update-banner__reload')?.textContent).toBe('Reload');
    expect(document.querySelector('.pwa-update-banner__dismiss')?.getAttribute('aria-label')).toBe('Dismiss');
  });

  it('calls the applyUpdate callback when Reload is clicked', () => {
    const applyUpdate = vi.fn().mockResolvedValue(undefined);
    showUpdateBanner(applyUpdate);
    document.querySelector<HTMLButtonElement>('.pwa-update-banner__reload')!.click();
    expect(applyUpdate).toHaveBeenCalledWith(true);
  });

  it('disables the Reload button after the first click to prevent double-fires', () => {
    showUpdateBanner(vi.fn().mockResolvedValue(undefined));
    const reload = document.querySelector<HTMLButtonElement>('.pwa-update-banner__reload')!;
    reload.click();
    expect(reload.disabled).toBe(true);
  });

  it('removes the banner when the dismiss button is clicked', () => {
    showUpdateBanner(vi.fn());
    document.querySelector<HTMLButtonElement>('.pwa-update-banner__dismiss')!.click();
    expect(document.getElementById('pwa-update-banner')).toBeNull();
  });

  it('replaces an existing banner instead of stacking multiple', () => {
    showUpdateBanner(vi.fn());
    showUpdateBanner(vi.fn());
    expect(document.querySelectorAll('#pwa-update-banner')).toHaveLength(1);
  });
});

describe('hideUpdateBanner', () => {
  it('is a no-op when no banner exists', () => {
    expect(() => hideUpdateBanner()).not.toThrow();
  });

  it('removes the banner when present', () => {
    showUpdateBanner(vi.fn());
    hideUpdateBanner();
    expect(document.getElementById('pwa-update-banner')).toBeNull();
  });
});
