import { traceCheckDigit } from './generator';
import { t } from './i18n';
import { cell, clearChildren, el } from './dom';

/**
 * Renders the step-by-step check-digit calculation for the given 12 digits
 * into the supplied container.
 *
 * The output is built entirely via DOM APIs (no `innerHTML`) and consists of:
 *
 *  - A short intro paragraph translated from `algo.intro`.
 *  - A table whose header columns are translated from `algo.col.*` and whose
 *    body rows display each digit, its weight, and their product.
 *  - A summary `<dl>` with the sum, remainder, and computed check digit.
 *  - The formula string from `algo.formula`.
 *
 * Re-invoking the function on the same container replaces all previous
 * content. Throws when `first12` is not exactly 12 digits — the upstream
 * `traceCheckDigit` validates the input.
 *
 * @param container - The block into which the trace is rendered.
 * @param first12 - The first 12 digits of an ID, used as the input to the
 *   check-digit algorithm.
 * @throws {Error} When `first12` is not exactly 12 digit characters.
 */
export function renderAlgorithmTrace(container: HTMLElement, first12: string): void {
  const trace = traceCheckDigit(first12);
  clearAlgorithmTrace(container);

  const intro = el('p', 'text-sm text-muted mb-4');
  intro.textContent = t('algo.intro');
  container.appendChild(intro);

  const wrap = el('div', 'overflow-x-auto rounded-lg border border-app-border');
  const table = el('table', 'w-full text-sm');
  const thead = document.createElement('thead');
  const headRow = el('tr', 'text-left text-xs uppercase tracking-wide text-muted');
  for (const key of ['algo.col.position', 'algo.col.digit', 'algo.col.weight', 'algo.col.product']) {
    const th = el('th', 'py-2 pr-3 font-semibold');
    th.textContent = t(key);
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (let i = 0; i < trace.digits.length; i++) {
    const tr = el('tr', 'border-t border-app-border');
    tr.appendChild(cell(String(i + 1), 'py-1.5 pr-3 font-mono tabular-nums text-muted'));
    tr.appendChild(cell(String(trace.digits[i]), 'py-1.5 pr-3 font-mono tabular-nums'));
    tr.appendChild(cell(`× ${trace.weights[i]}`, 'py-1.5 pr-3 font-mono tabular-nums text-muted'));
    tr.appendChild(cell(String(trace.products[i]), 'py-1.5 pr-3 font-mono tabular-nums'));
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrap.appendChild(table);
  container.appendChild(wrap);

  const summary = el('dl', 'mt-4 grid grid-cols-1 gap-2 text-sm sm:grid-cols-3');
  summary.appendChild(stat(t('algo.sum'), String(trace.sum), 'bg-app-surface-2'));
  summary.appendChild(stat(t('algo.remainder'), String(trace.remainder), 'bg-app-surface-2'));
  summary.appendChild(
    stat(
      t('algo.checkDigit'),
      String(trace.checkDigit),
      'bg-app-accent-soft ring-1 ring-app-accent/30',
      'text-app-accent-strong',
    ),
  );
  container.appendChild(summary);

  const formula = el('p', 'mt-2 text-xs text-muted font-mono');
  formula.textContent = t('algo.formula');
  container.appendChild(formula);
}

/**
 * Removes every child of the container previously populated by
 * `renderAlgorithmTrace`. Safe to call on an empty container.
 *
 * @param container - The element to empty.
 */
export function clearAlgorithmTrace(container: HTMLElement): void {
  clearChildren(container);
}

function stat(label: string, value: string, bg: string, valueClass = ''): HTMLDivElement {
  const div = el('div', `rounded-md px-3 py-2 ${bg}`);
  const dt = el('dt', 'text-xs text-muted');
  dt.textContent = label;
  const dd = el('dd', `font-mono tabular-nums text-base ${valueClass}`.trim());
  dd.textContent = value;
  div.appendChild(dt);
  div.appendChild(dd);
  return div;
}
