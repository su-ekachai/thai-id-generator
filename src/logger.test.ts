import { describe, expect, it } from 'vitest';
import { log } from './logger';

describe('log singleton', () => {
  it('exposes the standard tslog level methods', () => {
    expect(typeof log.silly).toBe('function');
    expect(typeof log.trace).toBe('function');
    expect(typeof log.debug).toBe('function');
    expect(typeof log.info).toBe('function');
    expect(typeof log.warn).toBe('function');
    expect(typeof log.error).toBe('function');
    expect(typeof log.fatal).toBe('function');
  });

  it('names messages "thai-id" for downstream filtering', () => {
    expect(log.settings.name).toBe('thai-id');
  });

  it('uses the pretty transport so dev consoles are readable', () => {
    expect(log.settings.type).toBe('pretty');
  });

  it('returns log objects when invoked', () => {
    const entry = log.info('logger smoke test');
    expect(entry).toBeDefined();
  });
});
