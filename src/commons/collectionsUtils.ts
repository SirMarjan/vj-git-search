export function notNullishOrEmpty(array?: unknown[] | null): boolean {
  return array != null && array.length > 0
}
