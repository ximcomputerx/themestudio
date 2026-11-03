export type PresetStyle = 'glass' | 'neon' | 'lightweight'
export type PresetMode = 'dark' | 'light'

export interface PresetCatalogEntry {
  styles: readonly PresetStyle[]
  mode: PresetMode
}

/** Display classification only. It is not stored in theme JSON. */
export const PRESET_CATALOG: Record<string, PresetCatalogEntry> = {
  'neon-glass-blue': { styles: ['glass', 'neon'], mode: 'dark' },
  'futuristic-electric-blue': { styles: ['glass', 'neon'], mode: 'dark' },
  'cyan-holographic': { styles: ['glass', 'neon'], mode: 'dark' },
  'dark-glass-professional': { styles: ['glass'], mode: 'dark' },
  'minimal-dark-blue': { styles: ['glass', 'lightweight'], mode: 'dark' },
  'aurora-glass': { styles: ['glass'], mode: 'dark' },
  'cyberpunk-violet': { styles: ['glass', 'neon'], mode: 'dark' },
  'arctic-frost': { styles: ['glass'], mode: 'light' },
  'obsidian-mono': { styles: ['glass'], mode: 'dark' },
  'emerald-matrix': { styles: ['glass', 'neon'], mode: 'dark' },
  'amber-industrial': { styles: ['glass', 'neon'], mode: 'dark' },
  'nordic-light': { styles: ['glass'], mode: 'light' },
  'pure-white': { styles: ['lightweight'], mode: 'light' },
  'soft-gray': { styles: ['lightweight'], mode: 'light' },
  'warm-sand': { styles: ['lightweight'], mode: 'light' },
  'mist-blue': { styles: ['lightweight'], mode: 'light' },
  'sage-calm': { styles: ['lightweight'], mode: 'light' }
}

export function presetCatalog(id: string): PresetCatalogEntry {
  return PRESET_CATALOG[id] ?? { styles: [], mode: 'dark' }
}
