import { accessor, createTemplate } from './utils';

describe('accessor', () => {
  test('attr', () => {
    const obj = { a: 5, b: 3 };

    expect(accessor(obj, 'a')).toBe(5);
    expect(accessor(obj, 'b')).toBe(3);
  });
  test('function', () => {
    const obj = { a: 5, b: 3 };

    expect(accessor(obj, () => 5)).toBe(5);
    expect(accessor(null, (v) => v)).toBe(null);
    expect(accessor(obj, (v) => v.a)).toBe(5);
  });
});

describe('createTemplate', () => {
  test('default', () => {
    const template = createTemplate(`<div></div>`);
    expect(template).toBeInstanceOf(HTMLTemplateElement);
  });
  test('content', () => {
    const template = createTemplate(`<div class="a"></div>`);
    expect(template).toBeInstanceOf(HTMLTemplateElement);
    expect(template.content.childElementCount).toBe(1);
    expect(template.content.firstElementChild.classList.contains('a')).toBe(true);
  });
});
