export function arrayEquals<T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((ai, i) => ai === b[i]);
}

export function createTemplate(html: string) {
  const template = document.createElement('template');
  template.innerHTML = html;
  return template;
}

export function accessor<T>(value: T, accessor: keyof T | ((v: T) => string | number)) {
  if (typeof accessor === 'function') {
    return accessor(value);
  }
  return value[accessor];
}
