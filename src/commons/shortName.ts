export function computeShortName(name: string, joinString = '/'): string {
  const splittedName = name.split('/').map((it) => it.trim())
  if (splittedName.length <= 1) {
    const finalText = splittedName[0] ?? ''
    return finalText
  }

  const textArray = []
  if (splittedName.length > 2) {
    textArray.push('...')
  }

  textArray.push(...[splittedName[splittedName.length - 2], splittedName[splittedName.length - 1]])
  return textArray.join(joinString)
}
