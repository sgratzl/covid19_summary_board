export function arrayEquals<T>(a: ReadonlyArray<T>, b: ReadonlyArray<T>) {
  if (a === b) {
    return true;
  }
  if (a.length !== b.length) {
    return false;
  }
  return a.every((ai, i) => ai === b[i]);
}
