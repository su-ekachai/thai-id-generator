import { t } from './i18n';
import type { ApplyUpdate } from './sw-register';
import { el } from './dom';

const BANNER_ID = 'pwa-update-banner';

/**
 * Mounts the "new version available" toast into `root` and wires its controls
 * to the supplied `applyUpdate` callback.
 *
 * The banner has three children:
 *
 *  1. A message span with the localised `update.available` text.
 *  2. A reload button that invokes `applyUpdate(true)` once, then disables itself
 *     to prevent double-firing while the service worker is taking over.
 *  3. A dismiss button (`×`) that removes the banner from the DOM.
 *
 * The banner uses `role="status"` and `aria-live="polite"` so assistive tech
 * announces the update without interrupting current speech. Invoking
 * `showUpdateBanner` again on the same root replaces any existing banner so
 * stale toasts cannot accumulate during rapid service-worker churn.
 *
 * @param applyUpdate - Callback that activates the waiting service worker and
 *   reloads the page. Provided by `registerServiceWorker`.
 * @param root - The element that becomes the banner's parent. Defaults to
 *   `document.body`.
 * @returns The created banner element. Useful for tests and animation hooks.
 */
export function showUpdateBanner(applyUpdate: ApplyUpdate, root: HTMLElement = document.body): HTMLElement {
  hideUpdateBanner(root);

  const banner = el('div', 'pwa-update-banner');
  banner.id = BANNER_ID;
  banner.setAttribute('role', 'status');
  banner.setAttribute('aria-live', 'polite');

  const text = el('span', 'pwa-update-banner__text');
  text.textContent = t('update.available');
  banner.appendChild(text);

  const reloadBtn = el('button', 'pwa-update-banner__reload');
  reloadBtn.type = 'button';
  reloadBtn.textContent = t('update.reload');
  reloadBtn.addEventListener('click', () => {
    reloadBtn.disabled = true;
    void applyUpdate(true);
  });
  banner.appendChild(reloadBtn);

  const dismissBtn = el('button', 'pwa-update-banner__dismiss');
  dismissBtn.type = 'button';
  dismissBtn.setAttribute('aria-label', t('update.dismiss'));
  dismissBtn.textContent = '×';
  dismissBtn.addEventListener('click', () => hideUpdateBanner(root));
  banner.appendChild(dismissBtn);

  root.appendChild(banner);
  return banner;
}

/**
 * Removes any existing update banner from `root`. No-op when the banner is
 * absent. Safe to call repeatedly.
 *
 * @param root - The element previously passed to `showUpdateBanner`. Defaults
 *   to `document.body`.
 */
export function hideUpdateBanner(root: HTMLElement = document.body): void {
  const existing = root.querySelector<HTMLElement>(`#${BANNER_ID}`);
  if (existing) existing.remove();
}
