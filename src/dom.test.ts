import { describe, expect, it } from 'vitest';
import { cell, clearChildren, el, text } from './dom';

describe('el', () => {
  it('creates an element with the requested tag and class string', () => {
    const node = el('div', 'foo bar');
    expect(node.tagName).toBe('DIV');
    expect(node.className).toBe('foo bar');
  });

  it('accepts an empty class string', () => {
    const node = el('span', '');
    expect(node.className).toBe('');
  });
});

describe('cell', () => {
  it('creates a td whose textContent is the supplied string', () => {
    const td = cell('hello', 'p-2');
    expect(td.tagName).toBe('TD');
    expect(td.textContent).toBe('hello');
    expect(td.className).toBe('p-2');
  });

  it('escapes markup characters by storing them as text', () => {
    const td = cell('<script>alert(1)</script>', '');
    expect(td.textContent).toBe('<script>alert(1)</script>');
    expect(td.children).toHaveLength(0);
  });
});

describe('text', () => {
  it('creates a tagged element with the supplied text content', () => {
    const node = text('p', 'lead', 'Hello world');
    expect(node.tagName).toBe('P');
    expect(node.className).toBe('lead');
    expect(node.textContent).toBe('Hello world');
  });
});

describe('clearChildren', () => {
  it('removes all child nodes from the container', () => {
    const container = document.createElement('div');
    container.appendChild(document.createElement('span'));
    container.appendChild(document.createElement('span'));
    container.appendChild(document.createElement('span'));
    expect(container.childElementCount).toBe(3);
    clearChildren(container);
    expect(container.childElementCount).toBe(0);
  });

  it('is a no-op on an empty container', () => {
    const container = document.createElement('div');
    expect(() => clearChildren(container)).not.toThrow();
    expect(container.childElementCount).toBe(0);
  });
});
