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
