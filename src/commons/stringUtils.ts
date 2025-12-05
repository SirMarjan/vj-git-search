export function isBlank(text?: string | null): text is null | undefined | string {
  if (text == null) {
    return true
  }

  const trimText = text.trim()
  return trimText === ''
}

export function isNotBlank(text?: string | null): text is string {
  return !isBlank(text)
}
