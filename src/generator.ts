/**
 * Thai national ID algorithm — pure functions, no DOM, no I/O.
 *
 * A Thai national ID is a 13-digit number. The 13th digit is a check digit
 * derived from the first 12 by the official Department of Provincial
 * Administration formula:
 *
 * ```text
 *   sum        = Σ d_i × (14 − i)   for i = 1..12
 *   remainder  = sum mod 11
 *   checkDigit = (11 − remainder) mod 10
 * ```
 *
 * The module is intentionally framework-agnostic so it can be unit-tested in
 * isolation (`src/generator.test.ts`) and reused outside the browser.
 *
 * @packageDocumentation
 */

const ID_LENGTH = 13;
const WEIGHT_BASE = 14;

/**
 * Computes the official check digit for the first 12 digits of a Thai
 * national ID.
 *
 * @param first12 - Exactly 12 digit characters; any other input throws.
 * @returns The 13th digit (`0..9`) that completes the valid ID.
 * @throws {Error} When `first12` is not exactly 12 digits.
 */
export function checkDigit(first12: string): number {
  if (first12.length !== 12 || !/^\d{12}$/.test(first12)) {
    throw new Error('checkDigit requires exactly 12 digits');
  }
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = Number(first12[i]);
    const weight = WEIGHT_BASE - (i + 1);
    sum += d * weight;
  }
  return (11 - (sum % 11)) % 10;
}

/**
 * Draws a uniformly random integer from the inclusive range `[min, maxExclusive)`
 * using `crypto.getRandomValues` and rejection sampling to avoid modulo bias.
 *
 * The function reads one byte at a time and discards any value at or above the
 * largest exact multiple of `range` representable in a byte. The expected
 * number of rejections is `< 1` for `range ≤ 128`, so latency is negligible.
 *
 * @param min - Inclusive lower bound. Non-negative.
 * @param maxExclusive - Exclusive upper bound. Must be greater than `min`.
 * @returns A uniformly distributed integer in `[min, maxExclusive)`.
 */
function secureRandomInt(min: number, maxExclusive: number): number {
  const range = maxExclusive - min;
  const limit = Math.floor(256 / range) * range;
  const buf = new Uint8Array(1);
  do {
    crypto.getRandomValues(buf);
  } while (buf[0]! >= limit);
  return min + (buf[0]! % range);
}

/**
 * Generates a syntactically valid 13-digit Thai national ID using
 * cryptographically strong randomness.
 *
 * The first digit is sampled uniformly from `1..8` to fall within the legal
 * person-type range. Digits 2–12 are sampled uniformly from `0..9`. The 13th
 * digit is computed by `checkDigit`. Output contains digits only, no separators;
 * use `formatThaiId` for display.
 *
 * Randomness is sourced from `crypto.getRandomValues` (available in every
 * Baseline-Widely-Available browser and in Bun/Node) rather than
 * `Math.random()`. The application is educational and does not require
 * cryptographic IDs, but the predictable seeding of `Math.random()` in some
 * engines is avoided as a matter of hygiene and to prevent future features
 * that rely on unpredictability from inheriting that weakness.
 *
 * @returns A 13-character digit string without separators.
 */
export function generateThaiId(): string {
  const d1 = secureRandomInt(1, 9);
  let body = String(d1);
  for (let i = 0; i < 11; i++) {
    body += String(secureRandomInt(0, 10));
  }
  return body + String(checkDigit(body));
}

/**
 * Verifies that a 13-digit string is internally consistent — i.e. its 13th
 * digit equals `checkDigit` of its first 12 digits.
 *
 * Non-digit characters are stripped before validation, so common display
 * formats such as `1-2345-67890-12-3` are accepted.
 *
 * @param id - The ID to validate. Separators are tolerated.
 * @returns `true` when the stripped string is 13 digits and the check digit
 *   matches; `false` otherwise.
 */
export function validateThaiId(id: string): boolean {
  const raw = id.replace(/\D/g, '');
  if (raw.length !== ID_LENGTH) return false;
  const expected = checkDigit(raw.slice(0, 12));
  return expected === Number(raw[12]);
}

/**
 * Formats a 13-digit ID into the conventional `X-XXXX-XXXXX-XX-X` display
 * grouping used on physical Thai national ID cards.
 *
 * Non-digit characters in `id` are stripped before formatting. Returns the
 * input unchanged when the stripped string is not exactly 13 digits.
 *
 * @param id - The ID to format. May already contain separators.
 * @returns The hyphenated display string, or the original input on mismatch.
 */
export function formatThaiId(id: string): string {
  const raw = id.replace(/\D/g, '');
  if (raw.length !== ID_LENGTH) return id;
  return `${raw[0]}-${raw.slice(1, 5)}-${raw.slice(5, 10)}-${raw.slice(10, 12)}-${raw[12]}`;
}

/**
 * Intermediate values produced by the check-digit calculation, exposed for
 * the educational step-by-step view.
 *
 * Field invariants for a valid input:
 *
 *  - `digits.length === weights.length === products.length === 12`.
 *  - `weights` equals `[13, 12, …, 2]`.
 *  - `products[i] === digits[i] * weights[i]`.
 *  - `sum === Σ products`.
 *  - `remainder === sum mod 11`.
 *  - `checkDigit === (11 − remainder) mod 10`.
 */
export interface AlgorithmTrace {
  /** The 12 input digits in order. */
  digits: number[];
  /** Position weights `[13, 12, …, 2]`. */
  weights: number[];
  /** Element-wise products of `digits` and `weights`. */
  products: number[];
  /** Sum of all `products`. */
  sum: number;
  /** `sum mod 11`. */
  remainder: number;
  /** The computed check digit `(11 − remainder) mod 10`. */
  checkDigit: number;
}

/**
 * Computes both the check digit and the intermediate values that produced it.
 *
 * Used by the algorithm view to render each weighted product as a table row.
 *
 * @param first12 - Exactly 12 digit characters.
 * @returns The full trace; see `AlgorithmTrace`.
 * @throws {Error} When `first12` is not exactly 12 digits.
 */
export function traceCheckDigit(first12: string): AlgorithmTrace {
  if (first12.length !== 12 || !/^\d{12}$/.test(first12)) {
    throw new Error('traceCheckDigit requires exactly 12 digits');
  }
  const digits: number[] = [];
  const weights: number[] = [];
  const products: number[] = [];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    const d = Number(first12[i]);
    const w = WEIGHT_BASE - (i + 1);
    digits.push(d);
    weights.push(w);
    products.push(d * w);
    sum += d * w;
  }
  const remainder = sum % 11;
  const cd = (11 - remainder) % 10;
  return { digits, weights, products, sum, remainder, checkDigit: cd };
}
