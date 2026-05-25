import { beforeEach, describe, expect, it } from 'vitest';
import { clearAlgorithmTrace, renderAlgorithmTrace } from './algorithm-view';
import { setLang } from './i18n';

let container: HTMLDivElement;

beforeEach(() => {
  setLang('en');
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('renderAlgorithmTrace', () => {
  it('renders 12 rows whose digits match the input', () => {
    renderAlgorithmTrace(container, '101234567890');
    const tbody = container.querySelector('tbody');
    expect(tbody).not.toBeNull();
    expect(tbody!.querySelectorAll('tr')).toHaveLength(12);
  });

  it('renders the correct weight for each row', () => {
    renderAlgorithmTrace(container, '101234567890');
    const cells = container.querySelectorAll<HTMLTableCellElement>('tbody tr td:nth-child(3)');
    const weights = Array.from(cells).map((c) => c.textContent?.trim());
    expect(weights).toEqual(['× 13', '× 12', '× 11', '× 10', '× 9', '× 8', '× 7', '× 6', '× 5', '× 4', '× 3', '× 2']);
  });

  it('renders the sum, remainder, and check digit', () => {
    renderAlgorithmTrace(container, '101234567890');
    const stats = container.querySelectorAll<HTMLElement>('dl dd');
    const values = Array.from(stats).map((s) => s.textContent?.trim());
    expect(values).toEqual(['268', '4', '7']);
  });

  it('replaces previous content on re-render (no duplicate rows)', () => {
    renderAlgorithmTrace(container, '101234567890');
    renderAlgorithmTrace(container, '999999999999');
    const tbodies = container.querySelectorAll('tbody');
    expect(tbodies).toHaveLength(1);
    expect(tbodies[0]!.querySelectorAll('tr')).toHaveLength(12);
  });

  it('uses translated column headers', () => {
    setLang('th');
    renderAlgorithmTrace(container, '101234567890');
    const headers = Array.from(container.querySelectorAll('thead th')).map((th) => th.textContent?.trim());
    expect(headers).toEqual(['ตำแหน่ง', 'หลัก', 'น้ำหนัก', 'ผลคูณ']);
  });

  it('rejects malformed input', () => {
    expect(() => renderAlgorithmTrace(container, 'abc')).toThrow();
  });
});

describe('clearAlgorithmTrace', () => {
  it('empties the container', () => {
    renderAlgorithmTrace(container, '101234567890');
    expect(container.childElementCount).toBeGreaterThan(0);
    clearAlgorithmTrace(container);
    expect(container.childElementCount).toBe(0);
  });
});
