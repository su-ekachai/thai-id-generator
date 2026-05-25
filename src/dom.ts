/**
 * Safe DOM construction helpers used by every renderer.
 *
 * The renderers in `algorithm-view.ts`, `digits-view.ts`, and `update-banner.ts`
 * deliberately avoid `innerHTML`, `outerHTML`, and `insertAdjacentHTML` so that
 * dynamic content cannot become an injection surface. These helpers centralise
 * the equivalent safe pattern: `document.createElement` + `className` + structured
 * `textContent` assignment.
 */

/**
 * Creates an `HTMLElement` of the given tag and assigns a class string.
 *
 * @param tag - Tag name. Type-checked against the standard HTML element map.
 * @param className - Space-separated class list. Use an empty string for no class.
 * @returns A detached element ready to receive children and content.
 */
export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  return node;
}

/**
 * Creates a `<td>` cell with the given text and class string.
 *
 * The text is assigned via `textContent`, so any reserved HTML characters in
 * `text` render as literal text and are not interpreted as markup.
 *
 * @param text - The cell content, written as a plain text node.
 * @param className - Space-separated class list applied to the cell.
 * @returns A detached `HTMLTableCellElement`.
 */
export function cell(text: string, className: string): HTMLTableCellElement {
  const td = el('td', className);
  td.textContent = text;
  return td;
}

/**
 * Creates an element with text content assigned via `textContent`.
 *
 * Shorthand for the common pattern of `el(tag, className)` followed by
 * `node.textContent = text`. Useful when a label or short string is the
 * only content of the element.
 *
 * @param tag - Tag name.
 * @param className - Space-separated class list.
 * @param text - Text content. Assigned via `textContent`, never via `innerHTML`.
 * @returns A detached element containing only the provided text.
 */
export function text<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
  text: string,
): HTMLElementTagNameMap[K] {
  const node = el(tag, className);
  node.textContent = text;
  return node;
}

/**
 * Removes every child of a container without using `innerHTML = ''`.
 *
 * The repeated `removeChild` loop is preferred over `innerHTML` assignment
 * because the latter triggers the HTML parser and is flagged by strict
 * Content Security Policy audits.
 *
 * @param container - The element whose children must be removed.
 */
export function clearChildren(container: HTMLElement): void {
  while (container.firstChild) container.removeChild(container.firstChild);
}
