export interface Rgba {
  r: number
  g: number
  b: number
  a: number
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(1, Math.max(0, value))
}

export function clamp255(value: number): number {
  if (Number.isNaN(value)) return 0
  return Math.min(255, Math.max(0, value))
}

export function roundTo(value: number, places: number): number {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

function hexByte(value: number): string {
  return Math.round(clamp255(value)).toString(16).padStart(2, '0').toUpperCase()
}

export function hslToRgb(h: number, s: number, l: number): Pick<Rgba, 'r' | 'g' | 'b'> {
  const hue = ((h % 360) + 360) % 360
  const sat = clamp01(s)
  const lig = clamp01(l)
  const c = (1 - Math.abs(2 * lig - 1)) * sat
  const hp = hue / 60
  const x = c * (1 - Math.abs((hp % 2) - 1))
  let r = 0
  let g = 0
  let b = 0
  if (hp < 1) {
    r = c
    g = x
  } else if (hp < 2) {
    r = x
    g = c
  } else if (hp < 3) {
    g = c
    b = x
  } else if (hp < 4) {
    g = x
    b = c
  } else if (hp < 5) {
    r = x
    b = c
  } else {
    r = c
    b = x
  }
  const m = lig - c / 2
  return { r: (r + m) * 255, g: (g + m) * 255, b: (b + m) * 255 }
}

export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  const rn = clamp255(r) / 255
  const gn = clamp255(g) / 255
  const bn = clamp255(b) / 255
  const max = Math.max(rn, gn, bn)
  const min = Math.min(rn, gn, bn)
  const l = (max + min) / 2
  const d = max - min
  if (d === 0) return { h: 0, s: 0, l }
  const s = d / (1 - Math.abs(2 * l - 1))
  const hRaw = max === rn ? ((gn - bn) / d) % 6 : max === gn ? (bn - rn) / d + 2 : (rn - gn) / d + 4
  let h = hRaw * 60
  if (h < 0) h += 360
  return { h, s, l }
}

function parseAlpha(raw: string | undefined): number {
  if (raw === undefined) return 1
  const text = raw.trim()
  if (text.endsWith('%')) return clamp01(Number(text.slice(0, -1)) / 100)
  return clamp01(Number(text))
}

export function parseColor(input: string): Rgba | null {
  const value = input.trim()
  const hex = /^#([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.exec(value)
  if (hex) {
    let body = hex[1] ?? ''
    if (body.length === 3 || body.length === 4) {
      body = body
        .split('')
        .map((part) => part + part)
        .join('')
    }
    const r = parseInt(body.slice(0, 2), 16)
    const g = parseInt(body.slice(2, 4), 16)
    const b = parseInt(body.slice(4, 6), 16)
    const a = body.length === 8 ? parseInt(body.slice(6, 8), 16) / 255 : 1
    return { r, g, b, a }
  }

  const comma = /^rgba?\(\s*([\d.]+)\s*,\s*([\d.]+)\s*,\s*([\d.]+)\s*(?:,\s*([\d.]+%?)\s*)?\)$/i.exec(value)
  const modern = /^rgba?\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+%?)\s*)?\)$/i.exec(value)
  const rgb = comma ?? modern
  if (rgb) {
    return {
      r: clamp255(Number(rgb[1])),
      g: clamp255(Number(rgb[2])),
      b: clamp255(Number(rgb[3])),
      a: parseAlpha(rgb[4])
    }
  }

  const hsl = /^hsla?\(\s*([-\d.]+)\s*,\s*([\d.]+)%\s*,\s*([\d.]+)%\s*(?:,\s*([\d.]+%?)\s*)?\)$/i.exec(value)
  const hslModern = /^hsla?\(\s*([-\d.]+)\s+([\d.]+)%\s+([\d.]+)%\s*(?:\/\s*([\d.]+%?)\s*)?\)$/i.exec(value)
  const hslMatch = hsl ?? hslModern
  if (hslMatch) {
    const converted = hslToRgb(Number(hslMatch[1]), Number(hslMatch[2]) / 100, Number(hslMatch[3]) / 100)
    return { ...converted, a: parseAlpha(hslMatch[4]) }
  }
  return null
}

export function toHex(color: Rgba, forceAlpha = false): string {
  const base = `#${hexByte(color.r)}${hexByte(color.g)}${hexByte(color.b)}`
  if (forceAlpha || color.a < 0.999) return `${base}${hexByte(color.a * 255)}`
  return base
}

export function toRgbCss(color: Rgba): string {
  const r = Math.round(color.r)
  const g = Math.round(color.g)
  const b = Math.round(color.b)
  if (color.a < 0.999) return `rgba(${r}, ${g}, ${b}, ${roundTo(color.a, 3)})`
  return `rgb(${r}, ${g}, ${b})`
}

export function toHslCss(color: Rgba): string {
  const { h, s, l } = rgbToHsl(color.r, color.g, color.b)
  const hue = Math.round(h)
  const sat = Math.round(s * 100)
  const lig = Math.round(l * 100)
  if (color.a < 0.999) return `hsla(${hue}, ${sat}%, ${lig}%, ${roundTo(color.a, 3)})`
  return `hsl(${hue}, ${sat}%, ${lig}%)`
}

export function canonicalColor(input: string): string | null {
  const parsed = parseColor(input)
  if (!parsed) return null
  return parsed.a < 0.999 ? toRgbCss(parsed) : toHex(parsed)
}

export function withAlpha(input: string, alpha: number): string {
  const parsed = parseColor(input)
  if (!parsed) return input
  return toRgbCss({ ...parsed, a: clamp01(alpha) })
}

export function opaqueHex(input: string): string {
  const parsed = parseColor(input)
  if (!parsed) return '#000000'
  return toHex({ ...parsed, a: 1 })
}

export function mixColors(a: string, b: string, amount: number): string {
  const left = parseColor(a)
  const right = parseColor(b)
  if (!left || !right) return a
  const t = clamp01(amount)
  return toRgbCss({
    r: left.r + (right.r - left.r) * t,
    g: left.g + (right.g - left.g) * t,
    b: left.b + (right.b - left.b) * t,
    a: left.a + (right.a - left.a) * t
  })
}

export function contrastText(input: string): string {
  const color = parseColor(input)
  if (!color) return '#F8FBFF'
  const y = (0.2126 * color.r + 0.7152 * color.g + 0.0722 * color.b) / 255
  return y > 0.64 ? '#0B1220' : '#F8FBFF'
}

export function relativeLuminance(input: string): number {
  const color = parseColor(input)
  if (!color) return 0
  const channel = (value: number) => {
    const s = value / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * channel(color.r) + 0.7152 * channel(color.g) + 0.0722 * channel(color.b)
}
