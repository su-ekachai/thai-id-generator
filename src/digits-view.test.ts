import { beforeEach, describe, expect, it } from 'vitest';
import { clearDigitsBreakdown, renderDigitsBreakdown } from './digits-view';
import { setLang } from './i18n';

let container: HTMLDivElement;

beforeEach(() => {
  setLang('en');
  container = document.createElement('div');
  document.body.appendChild(container);
});

describe('renderDigitsBreakdown', () => {
  it('renders five color-coded segment chips with the digits from the input', () => {
    renderDigitsBreakdown(container, '1012345678907');
    const chips = container.querySelectorAll<HTMLElement>('[data-testid="digits-segments"] > div');
    // 5 chips + 5 labels = 10 grid children
    expect(chips).toHaveLength(10);
    const digitTexts = Array.from(chips).slice(0, 5).map((c) => c.textContent);
    expect(digitTexts).toEqual(['1', '0123', '45678', '90', '7']);
  });

  it('uses the same number of grid-column spans as the segment length', () => {
    renderDigitsBreakdown(container, '1012345678907');
    const chips = container.querySelectorAll<HTMLElement>('[data-testid="digits-segments"] > div');
    const spans = Array.from(chips).slice(0, 5).map((c) => c.style.gridColumn);
    expect(spans).toEqual([
      'span 1 / span 1',
      'span 4 / span 4',
      'span 5 / span 5',
      'span 2 / span 2',
      'span 1 / span 1',
    ]);
  });

  it('renders a reference table with one row per segment', () => {
    renderDigitsBreakdown(container, '1012345678907');
    const rows = container.querySelectorAll('table tbody tr');
    expect(rows).toHaveLength(5);
    const positions = Array.from(rows).map((r) => r.querySelector('td')?.textContent?.trim());
    expect(positions).toEqual(['1', '2–5', '6–10', '11–12', '13']);
  });

  it('renders all 8 person-type codes', () => {
    renderDigitsBreakdown(container, '1012345678907');
    const codeRows = container.querySelectorAll('dl > div');
    expect(codeRows).toHaveLength(8);
    const codes = Array.from(codeRows).map((r) => r.querySelector('dt')?.textContent?.trim());
    expect(codes).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
  });

  it('translates section content when the language changes', () => {
    renderDigitsBreakdown(container, '1012345678907');
    expect(container.querySelector('p')?.textContent).toContain('13 digits');

    setLang('th');
    renderDigitsBreakdown(container, '1012345678907');
    expect(container.querySelector('p')?.textContent).toContain('13 หลัก');
  });

  it('exposes per-chip aria-label for screen readers', () => {
    renderDigitsBreakdown(container, '1012345678907');
    const firstChip = container.querySelector<HTMLElement>('[data-testid="digits-segments"] > div')!;
    expect(firstChip.getAttribute('aria-label')).toBe('Type: 1');
  });

  it('replaces previous content on re-render', () => {
    renderDigitsBreakdown(container, '1012345678907');
    const firstChild = container.firstChild;
    renderDigitsBreakdown(container, '8765432109876');
    expect(container.firstChild).not.toBe(firstChild);
    expect(container.querySelectorAll('table')).toHaveLength(1);
    expect(container.querySelectorAll('dl')).toHaveLength(1);
  });

  it('rejects malformed input', () => {
    expect(() => renderDigitsBreakdown(container, '123')).toThrow();
    expect(() => renderDigitsBreakdown(container, '12345678901a3')).toThrow();
  });
});

describe('clearDigitsBreakdown', () => {
  it('empties the container', () => {
    renderDigitsBreakdown(container, '1012345678907');
    expect(container.childElementCount).toBeGreaterThan(0);
    clearDigitsBreakdown(container);
    expect(container.childElementCount).toBe(0);
  });
});
