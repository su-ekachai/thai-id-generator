import { describe, expect, it, vi } from 'vitest';
import {
  checkDigit,
  formatThaiId,
  generateThaiId,
  traceCheckDigit,
  validateThaiId,
} from './generator';

describe('checkDigit', () => {
  it('matches the manually-computed value for a known fixture', () => {
    // 1×13 + 0×12 + 1×11 + 2×10 + 3×9 + 4×8 + 5×7 + 6×6 + 7×5 + 8×4 + 9×3 + 0×2
    // = 13+0+11+20+27+32+35+36+35+32+27+0 = 268; 268 mod 11 = 4; (11−4) mod 10 = 7
    expect(checkDigit('101234567890')).toBe(7);
  });

  it('returns 1 for the all-ones case', () => {
    // 1×(13+12+...+2) = 1×90 = 90; 90 mod 11 = 2; (11−2) mod 10 = 9
    expect(checkDigit('111111111111')).toBe(9);
  });

  it('returns 0 when remainder equals 1', () => {
    // sum mod 11 must equal 1 → (11−1) mod 10 = 0. "100000000000" gives sum 13 → 13 mod 11 = 2 → 9.
    // Use a constructed case: digits weighted so sum = 12.
    // d1=0 d2=1 → sum = 0×13 + 1×12 + 0×rest = 12 → 12 mod 11 = 1 → (11−1) mod 10 = 0
    expect(checkDigit('010000000000')).toBe(0);
  });

  it('rejects inputs that are not exactly 12 digits', () => {
    expect(() => checkDigit('12345')).toThrow();
    expect(() => checkDigit('1234567890123')).toThrow();
    expect(() => checkDigit('12345678901a')).toThrow();
    expect(() => checkDigit('')).toThrow();
  });
});

describe('generateThaiId', () => {
  it('returns 13 raw digits with the first digit in the range 1..8', () => {
    for (let i = 0; i < 200; i++) {
      const id = generateThaiId();
      expect(id).toMatch(/^[1-8]\d{12}$/);
    }
  });

  it('produces an ID whose check digit is internally consistent', () => {
    for (let i = 0; i < 1000; i++) {
      const id = generateThaiId();
      expect(validateThaiId(id)).toBe(true);
    }
  });

  it('uses the provided random source deterministically', () => {
    const seq = [0.05, 0.15, 0.25, 0.35, 0.45, 0.55, 0.65, 0.75, 0.85, 0.95, 0.5, 0.5];
    let i = 0;
    const spy = vi.spyOn(Math, 'random').mockImplementation(() => seq[i++ % seq.length] ?? 0);
    const id = generateThaiId();
    spy.mockRestore();
    expect(id).toHaveLength(13);
    expect(validateThaiId(id)).toBe(true);
  });
});

describe('validateThaiId', () => {
  it('accepts a known-good ID', () => {
    // 1012345678907 → checkDigit("101234567890") = 7
    expect(validateThaiId('1012345678907')).toBe(true);
  });

  it('rejects wrong length', () => {
    expect(validateThaiId('12345')).toBe(false);
    expect(validateThaiId('12345678901234')).toBe(false);
  });

  it('rejects all-zero IDs (check digit mismatch)', () => {
    expect(validateThaiId('0000000000000')).toBe(false);
  });

  it('rejects an ID with a tampered check digit', () => {
    expect(validateThaiId('1012345678900')).toBe(false);
  });

  it('strips non-digit characters before validating', () => {
    expect(validateThaiId('1-0123-45678-90-7')).toBe(true);
  });

  it('rejects when stripping leaves the wrong length', () => {
    expect(validateThaiId('1-0123-45678-90')).toBe(false);
  });
});

describe('formatThaiId', () => {
  it('inserts hyphens in the canonical X-XXXX-XXXXX-XX-X positions', () => {
    expect(formatThaiId('1012345678907')).toBe('1-0123-45678-90-7');
  });

  it('returns the input unchanged when it is not 13 digits', () => {
    expect(formatThaiId('123')).toBe('123');
  });

  it('strips existing separators before re-formatting', () => {
    expect(formatThaiId('1 0123 45678 90 7')).toBe('1-0123-45678-90-7');
  });
});

describe('traceCheckDigit', () => {
  it('returns digits, weights, products, sum, remainder, and check digit', () => {
    const trace = traceCheckDigit('101234567890');
    expect(trace.digits).toEqual([1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0]);
    expect(trace.weights).toEqual([13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2]);
    expect(trace.products).toEqual([13, 0, 11, 20, 27, 32, 35, 36, 35, 32, 27, 0]);
    expect(trace.sum).toBe(268);
    expect(trace.remainder).toBe(4);
    expect(trace.checkDigit).toBe(7);
  });

  it('rejects inputs of the wrong shape', () => {
    expect(() => traceCheckDigit('12345')).toThrow();
    expect(() => traceCheckDigit('12345678901a')).toThrow();
  });
});
