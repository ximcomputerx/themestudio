import path from 'node:path'

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export function assertThemeId(id: unknown): string {
  if (typeof id !== 'string' || !UUID.test(id)) throw new Error('Invalid theme id')
  return id.toLowerCase()
}

export function themeFilePath(themesDir: string, id: unknown): string {
  const safe = assertThemeId(id)
  const root = path.resolve(themesDir)
  const full = path.resolve(root, `${safe}.json`)
  const relative = path.relative(root, full)
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    throw new Error('Theme path escapes the themes directory')
  }
  return full
}

export function imageMime(buffer: Uint8Array): 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp' | null {
  if (buffer.length >= 8 && buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4e && buffer[3] === 0x47) {
    return 'image/png'
  }
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'image/jpeg'
  if (buffer.length >= 6) {
    const gif = String.fromCharCode(...buffer.slice(0, 6))
    if (gif === 'GIF87a' || gif === 'GIF89a') return 'image/gif'
  }
  if (buffer.length >= 12) {
    const riff = String.fromCharCode(...buffer.slice(0, 4))
    const webp = String.fromCharCode(...buffer.slice(8, 12))
    if (riff === 'RIFF' && webp === 'WEBP') return 'image/webp'
  }
  return null
}
