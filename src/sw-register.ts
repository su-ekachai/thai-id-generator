import { log } from './logger';

/**
 * Service worker registration. Thin wrapper over `vite-plugin-pwa`'s virtual
 * `virtual:pwa-register` module so the rest of the codebase remains decoupled
 * from the plugin and easier to unit-test (the virtual module is unavailable
 * inside Vitest's happy-dom environment).
 *
 * The module exports two type aliases used by the update banner and a single
 * function, `registerServiceWorker`, that performs the registration and wires
 * the update callback.
 *
 * @packageDocumentation
 */

/**
 * Callback that activates the waiting service worker and reloads the page.
 *
 * Implementations call `update(true)` from the virtual module, which posts a
 * `SKIP_WAITING` message to the new worker and then performs `location.reload`.
 *
 * @param reload - When `true`, reload the page after activation. Default `true`.
 */
export type ApplyUpdate = (reload?: boolean) => Promise<void>;

/**
 * Callback invoked when the service worker reports a new version waiting to
 * activate. The callback receives an `ApplyUpdate` it can invoke to confirm
 * the update from a UI control (typically the reload button on the banner).
 *
 * @param apply - The function the consumer invokes once the user confirms the
 *   update.
 */
export type OnUpdateAvailable = (apply: ApplyUpdate) => void;

/**
 * Registers the service worker emitted by `vite-plugin-pwa` and bridges its
 * update lifecycle to the supplied `onUpdate` callback.
 *
 * The function is a no-op in environments where service workers are not
 * available (such as Vitest's happy-dom environment or insecure contexts) so
 * the caller does not need to feature-detect.
 *
 * Errors during dynamic import of the virtual module are caught and logged at
 * `error` level rather than propagated, because a missing service worker must
 * not break the rest of the page.
 *
 * @param onUpdate - Invoked once a new service worker version is waiting.
 *   Receives an `ApplyUpdate` to be called from the UI.
 */
export async function registerServiceWorker(onUpdate: OnUpdateAvailable): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

  try {
    const { registerSW } = await import(/* @vite-ignore */ 'virtual:pwa-register');
    const update = registerSW({
      immediate: true,
      onNeedRefresh() {
        log.info('service worker reports new version waiting');
        onUpdate(async () => {
          await update(true);
        });
      },
      onRegisterError(error: unknown) {
        log.error('service worker registration failed', error);
      },
    });
  } catch (err) {
    log.error('service worker registration threw', err);
  }
}
