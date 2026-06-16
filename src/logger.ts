/**
 * Application-wide logger.
 *
 * A dependency-free wrapper over the platform `console`. It exists so call sites
 * stay decoupled from the console and so every line carries a consistent,
 * greppable shape: each is tagged `[thai-id] <LEVEL>` and structured context is
 * forwarded to the console untouched, so devtools renders it as an inspectable
 * value rather than a flattened string.
 *
 * Only the levels the application emits are exposed — `info`, `warn`, and
 * `error`. All three are actionable and always reach the console.
 *
 * @example
 *   import { log } from './logger';
 *   log.info('bootstrap complete', { lang: 'en' });
 *   log.warn('clipboard rejected', err);
 *   log.error('service worker registration failed', err);
 */

const NAME = 'thai-id';

type LogFn = (message: string, ...context: unknown[]) => void;

/** The logging surface consumed across the application. */
export interface Log {
  info: LogFn;
  warn: LogFn;
  error: LogFn;
}

/**
 * Builds a level method that prefixes the `thai-id` tag and forwards the message
 * and any structured context to the matching `console` method. The console
 * member is read at call time so output respects spies and console
 * reconfiguration rather than capturing a stale reference.
 */
function at(level: string, method: 'info' | 'warn' | 'error'): LogFn {
  return (message, ...context) => console[method](`[${NAME}] ${level}`, message, ...context);
}

export const log: Log = {
  info: at('INFO', 'info'),
  warn: at('WARN', 'warn'),
  error: at('ERROR', 'error'),
};
