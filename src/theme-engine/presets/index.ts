import type { PresetDefinition } from '../core/types'
import { amberIndustrial } from './amber-industrial'
import { arcticFrost } from './arctic-frost'
import { auroraGlass } from './aurora-glass'
import { cyanHolographic } from './cyan-holographic'
import { cyberpunkViolet } from './cyberpunk-violet'
import { darkGlassProfessional } from './dark-glass-professional'
import { emeraldMatrix } from './emerald-matrix'
import { futuristicElectricBlue } from './futuristic-electric-blue'
import { minimalDarkBlue } from './minimal-dark-blue'
import { neonGlassBlue } from './neon-glass-blue'
import { mistBlue } from './mist-blue'
import { nordicLight } from './nordic-light'
import { obsidianMono } from './obsidian-mono'
import { pureWhite } from './pure-white'
import { sageCalm } from './sage-calm'
import { softGray } from './soft-gray'
import { warmSand } from './warm-sand'

export const PRESETS: readonly PresetDefinition[] = [
  neonGlassBlue,
  futuristicElectricBlue,
  cyanHolographic,
  emeraldMatrix,
  amberIndustrial,
  cyberpunkViolet,
  minimalDarkBlue,
  auroraGlass,
  arcticFrost,
  darkGlassProfessional,
  obsidianMono,
  nordicLight,
  pureWhite,
  softGray,
  warmSand,
  mistBlue,
  sageCalm
]

export function presetById(id: string | null | undefined): PresetDefinition {
  return PRESETS.find((preset) => preset.id === id) ?? neonGlassBlue
}

export { PRESET_CATALOG, presetCatalog } from './catalog'
export type { PresetCatalogEntry, PresetMode, PresetStyle } from './catalog'

export {
  amberIndustrial,
  arcticFrost,
  auroraGlass,
  cyanHolographic,
  cyberpunkViolet,
  darkGlassProfessional,
  emeraldMatrix,
  futuristicElectricBlue,
  minimalDarkBlue,
  mistBlue,
  neonGlassBlue,
  nordicLight,
  obsidianMono,
  pureWhite,
  sageCalm,
  softGray,
  warmSand
}
