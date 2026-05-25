import { t } from './i18n';
import { cell, clearChildren, el } from './dom';

/**
 * Maps a logical segment of the 13-digit Thai ID to its display range,
 * i18n keys, Tailwind colour utilities, and byte offsets into the raw string.
 */
interface Segment {
  range: string;
  labelKey: string;
  meaningKey: string;
  chipClass: string;
  start: number; // inclusive 0-based offset into the raw 13-digit string
  end: number; // exclusive
}

const SEGMENTS: readonly Segment[] = [
  {
    range: '1',
    labelKey: 'digits.label.type',
    meaningKey: 'digits.meaning.type',
    chipClass: 'segment-type',
    start: 0,
    end: 1,
  },
  {
    range: '2–5',
    labelKey: 'digits.label.location',
    meaningKey: 'digits.meaning.location',
    chipClass: 'segment-location',
    start: 1,
    end: 5,
  },
  {
    range: '6–10',
    labelKey: 'digits.label.volume',
    meaningKey: 'digits.meaning.volume',
    chipClass: 'segment-volume',
    start: 5,
    end: 10,
  },
  {
    range: '11–12',
    labelKey: 'digits.label.sequence',
    meaningKey: 'digits.meaning.sequence',
    chipClass: 'segment-sequence',
    start: 10,
    end: 12,
  },
  {
    range: '13',
    labelKey: 'digits.label.check',
    meaningKey: 'digits.meaning.check',
    chipClass: 'segment-check',
    start: 12,
    end: 13,
  },
];

const TYPE_CODES = ['1', '2', '3', '4', '5', '6', '7', '8'] as const;

/**
 * Renders the 13-digit segmented breakdown for an ID into the given container.
 *
 * The view consists of three blocks built with safe DOM APIs:
 *
 *  - A CSS-grid row of five colour-coded chips, each carrying its segment of
 *    the raw ID and an aligned label row underneath.
 *  - A reference table mapping each position range to its label and meaning.
 *  - A person-type code table covering positions 1–8 of digit 1.
 *
 * Re-invoking on the same container replaces previous content.
 *
 * @param container - The block into which the breakdown is rendered.
 * @param rawId - The 13-digit Thai national ID string without separators.
 * @throws {Error} When `rawId` is not exactly 13 digits.
 */
export function renderDigitsBreakdown(container: HTMLElement, rawId: string): void {
  clearDigitsBreakdown(container);

  if (!/^\d{13}$/.test(rawId)) {
    throw new Error('renderDigitsBreakdown requires a 13-digit string');
  }

  const intro = el('p', 'text-sm text-muted mb-5');
  intro.textContent = t('digits.intro');
  container.appendChild(intro);

  container.appendChild(buildSegmentGrid(rawId));
  container.appendChild(buildReferenceTable());
  container.appendChild(buildTypeCodesTable());
}

/**
 * Removes every child of the container previously populated by
 * `renderDigitsBreakdown`. Safe to call on an empty container.
 *
 * @param container - The element to empty.
 */
export function clearDigitsBreakdown(container: HTMLElement): void {
  clearChildren(container);
}

function buildSegmentGrid(rawId: string): HTMLElement {
  // grid-cols-13: each column = one digit. Each segment spans `end - start`
  // columns so labels stay aligned to their digit group across viewports.
  const grid = el(
    'div',
    'grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1 sm:gap-1.5 mb-5',
  );
  grid.dataset.testid = 'digits-segments';

  // Row 1 — digit chips
  for (const seg of SEGMENTS) {
    const chip = el(
      'div',
      `flex items-center justify-center rounded-md ring-1 px-1 py-2 sm:py-3 font-mono tabular-nums text-base sm:text-2xl font-bold ${seg.chipClass}`,
    );
    chip.style.gridColumn = `span ${seg.end - seg.start} / span ${seg.end - seg.start}`;
    chip.textContent = rawId.slice(seg.start, seg.end);
    chip.setAttribute('aria-label', `${t(seg.labelKey)}: ${rawId.slice(seg.start, seg.end)}`);
    grid.appendChild(chip);
  }

  // Row 2 — segment labels
  for (const seg of SEGMENTS) {
    const label = el(
      'div',
      'flex items-center justify-center text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-muted truncate',
    );
    label.style.gridColumn = `span ${seg.end - seg.start} / span ${seg.end - seg.start}`;
    label.textContent = t(seg.labelKey);
    grid.appendChild(label);
  }

  return grid;
}

function buildReferenceTable(): HTMLElement {
  const wrap = el('div', 'overflow-x-auto rounded-lg border border-app-border mb-5');
  const table = el('table', 'w-full text-sm');

  const thead = document.createElement('thead');
  const headRow = el('tr', 'text-left text-xs uppercase tracking-wide text-muted');
  for (const key of ['digits.col.position', 'digits.col.label', 'digits.col.meaning']) {
    const th = el('th', 'py-2 px-3 font-semibold');
    th.scope = 'col';
    th.textContent = t(key);
    headRow.appendChild(th);
  }
  thead.appendChild(headRow);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  for (const seg of SEGMENTS) {
    const tr = el('tr', 'border-t border-app-border align-top');
    tr.appendChild(cell(seg.range, 'py-2 px-3 font-mono tabular-nums text-muted whitespace-nowrap'));
    tr.appendChild(cell(t(seg.labelKey), 'py-2 px-3 font-semibold whitespace-nowrap'));
    tr.appendChild(cell(t(seg.meaningKey), 'py-2 px-3 text-muted'));
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function buildTypeCodesTable(): HTMLElement {
  const wrap = el('section', 'rounded-lg border border-app-border');

  const heading = el('h3', 'flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted px-3 py-2 border-b border-app-border');
  heading.textContent = t('digits.type.heading');
  wrap.appendChild(heading);

  const list = el('dl', 'grid grid-cols-1 sm:grid-cols-2 gap-x-4');
  for (const code of TYPE_CODES) {
    const row = el(
      'div',
      'flex gap-3 px-3 py-2 border-b border-app-border last:border-b-0 sm:[&:nth-last-child(2)]:border-b-0',
    );
    const dt = el(
      'dt',
      'flex h-7 w-7 shrink-0 items-center justify-center rounded-md segment-type font-mono tabular-nums text-sm font-bold',
    );
    dt.textContent = code;
    const dd = el('dd', 'text-sm text-app leading-snug');
    dd.textContent = t(`digits.type.${code}`);
    row.append(dt, dd);
    list.appendChild(row);
  }
  wrap.appendChild(list);
  return wrap;
}

