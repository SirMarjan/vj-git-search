export function notNullish<T>(value?: T | null): T {
  if (value == null) {
    throw Error('Value is nullish')
  }
  return value
}
