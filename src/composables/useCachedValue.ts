export function useCacheTransformedValue<I, O>(
  valueTransformerFn: (input: I) => O,
): {
  getValue: (input: I) => O
  clear: () => void
} {
  const cache = new Map<I, O>()

  const getValue = (input: I): O => {
    const cachedValue = cache.get(input)
    if (cachedValue != null) {
      console.log('Cache hit')
      return cachedValue
    }
    console.log('Cache miss')
    const calculateValue = valueTransformerFn(input)
    cache.set(input, calculateValue)
    return calculateValue
  }

  const clear = (): void => {
    console.log('Clear')
    cache.clear()
  }

  return {
    getValue,
    clear,
  }
}
