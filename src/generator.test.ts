import { describe, expect, it } from 'vitest';
import { checkDigit, formatThaiId, generateThaiId, traceCheckDigit } from './generator';

/** Asserts a raw 13-digit ID's check digit matches its first 12 digits. */
function expectConsistent(id: string): void {
  expect(id).toHaveLength(13);
  expect(checkDigit(id.slice(0, 12))).toBe(Number(id[12]));
}

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
      expectConsistent(generateThaiId());
    }
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
