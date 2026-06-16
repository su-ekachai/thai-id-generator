import { afterEach, describe, expect, it, vi } from 'vitest';
import { log } from './logger';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('log singleton', () => {
  it('exposes info, warn, and error methods', () => {
    for (const level of ['info', 'warn', 'error'] as const) {
      expect(typeof log[level]).toBe('function');
    }
  });

  it('tags each line with the thai-id name and upper-case level for grepping', () => {
    const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    log.warn('clipboard rejected');
    expect(spy).toHaveBeenCalledWith('[thai-id] WARN', 'clipboard rejected');
  });

  it('forwards structured context to the console untouched', () => {
    const spy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const context = { lang: 'en' };
    log.info('bootstrap complete', context);
    expect(spy).toHaveBeenCalledWith('[thai-id] INFO', 'bootstrap complete', context);
  });

  it('routes error to console.error', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    log.error('boom');
    expect(spy).toHaveBeenCalledWith('[thai-id] ERROR', 'boom');
  });
});
