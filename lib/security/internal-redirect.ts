const INTERNAL_ORIGIN = 'https://internal.test-explorer.invalid'

export function getSafeInternalPath(value: FormDataEntryValue | string | null | undefined) {
  if (typeof value !== 'string' || value.length === 0 || value !== value.trim()) return null
  if (!value.startsWith('/') || value.startsWith('//') || value.includes('\\')) return null
  if (/\p{Cc}/u.test(value)) return null

  try {
    const url = new URL(value, INTERNAL_ORIGIN)
    if (url.origin !== INTERNAL_ORIGIN) return null
    return `${url.pathname}${url.search}${url.hash}`
  } catch {
    return null
  }
}
