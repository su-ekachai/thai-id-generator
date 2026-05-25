import { Logger, type ILogObj } from 'tslog';

const isDev: boolean = Boolean((import.meta as { env?: { DEV?: boolean } }).env?.DEV);

/**
 * Application-wide structured logger.
 *
 * The singleton is configured for two profiles. In development (`import.meta.env.DEV === true`)
 * the minimum log level is `silly` (`0`) and source positions are printed so calls
 * surface line numbers next to messages. In production the minimum level is `info` (`3`),
 * which keeps `info`, `warn`, `error`, and `fatal` visible while hiding `silly`, `trace`,
 * and `debug` to reduce console noise.
 *
 * The instance is intentionally a module singleton so that unit tests, the bootstrap
 * entry, and the service-worker registration share the same configured logger. Tests
 * mock the singleton at module-import time when behaviour assertions are required.
 *
 * @example
 *   import { log } from './logger';
 *   log.info('bootstrap complete', { lang: 'en' });
 *   log.warn('clipboard rejected; falling back', err);
 *   log.error('SW registration failed', err);
 */
export const log: Logger<ILogObj> = new Logger<ILogObj>({
  name: 'thai-id',
  type: 'pretty',
  minLevel: isDev ? 0 : 3,
  hideLogPositionForProduction: !isDev,
});
