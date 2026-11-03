export interface NumberRange {
  min: number
  max: number
  step: number
  unit: string
  decimals: number
}

export const GLASS_DEPTHS = ['low', 'medium', 'high'] as const
export const GLOW_LEVELS = ['off', 'subtle', 'medium', 'strong', 'extreme'] as const

export const RANGES = {
  glass: {
    opacity: { min: 0, max: 1, step: 0.01, unit: '', decimals: 2 },
    blur: { min: 0, max: 40, step: 1, unit: 'px', decimals: 0 },
    saturation: { min: 50, max: 200, step: 1, unit: '%', decimals: 0 },
    borderOpacity: { min: 0, max: 1, step: 0.01, unit: '', decimals: 2 },
    innerHighlight: { min: 0, max: 1, step: 0.01, unit: '', decimals: 2 },
    contrast: { min: 0.5, max: 1.5, step: 0.01, unit: '', decimals: 2 }
  },
  glow: {
    intensity: { min: 0, max: 1, step: 0.01, unit: '', decimals: 2 },
    radius: { min: 0, max: 48, step: 1, unit: 'px', decimals: 0 },
    spread: { min: 0, max: 24, step: 1, unit: 'px', decimals: 0 },
    opacity: { min: 0, max: 1, step: 0.01, unit: '', decimals: 2 }
  },
  border: {
    width: { min: 0, max: 4, step: 1, unit: 'px', decimals: 0 },
    opacity: { min: 0, max: 1, step: 0.01, unit: '', decimals: 2 },
    radius: { min: 0, max: 32, step: 1, unit: 'px', decimals: 0 }
  },
  shadow: {
    blur: { min: 0, max: 80, step: 1, unit: 'px', decimals: 0 },
    spread: { min: -20, max: 40, step: 1, unit: 'px', decimals: 0 },
    opacity: { min: 0, max: 1, step: 0.01, unit: '', decimals: 2 },
    offsetX: { min: -40, max: 40, step: 1, unit: 'px', decimals: 0 },
    offsetY: { min: -40, max: 40, step: 1, unit: 'px', decimals: 0 }
  },
  typography: {
    fontSize: { min: 11, max: 22, step: 1, unit: 'px', decimals: 0 },
    fontWeight: { min: 400, max: 700, step: 100, unit: '', decimals: 0 },
    lineHeight: { min: 1, max: 2, step: 0.05, unit: '', decimals: 2 },
    letterSpacing: { min: -0.05, max: 0.2, step: 0.005, unit: 'em', decimals: 3 }
  },
  radius: {
    sm: { min: 0, max: 24, step: 1, unit: 'px', decimals: 0 },
    md: { min: 0, max: 32, step: 1, unit: 'px', decimals: 0 },
    lg: { min: 0, max: 40, step: 1, unit: 'px', decimals: 0 },
    xl: { min: 0, max: 48, step: 1, unit: 'px', decimals: 0 },
    pill: { min: 0, max: 999, step: 1, unit: 'px', decimals: 0 }
  },
  animation: {
    transitionMs: { min: 0, max: 600, step: 10, unit: 'ms', decimals: 0 },
    hoverMs: { min: 0, max: 600, step: 10, unit: 'ms', decimals: 0 },
    focusMs: { min: 0, max: 600, step: 10, unit: 'ms', decimals: 0 },
    panelMs: { min: 0, max: 800, step: 10, unit: 'ms', decimals: 0 },
    dialogMs: { min: 0, max: 800, step: 10, unit: 'ms', decimals: 0 },
    glowMs: { min: 0, max: 800, step: 10, unit: 'ms', decimals: 0 }
  }
} as const satisfies Record<string, Record<string, NumberRange>>

export const FONT_STACKS = [
  {
    id: 'segoe',
    label: 'Segoe UI',
    value: '"Segoe UI Variable", "Segoe UI", "Microsoft YaHei UI", sans-serif'
  },
  {
    id: 'yahei',
    label: '微软雅黑',
    value: '"Microsoft YaHei UI", "Microsoft YaHei", "Segoe UI", sans-serif'
  },
  {
    id: 'system',
    label: 'System UI',
    value: 'system-ui, "Segoe UI", "Microsoft YaHei UI", sans-serif'
  },
  {
    id: 'georgia',
    label: 'Georgia',
    value: 'Georgia, "Microsoft YaHei UI", serif'
  }
] as const

export const MONO_STACKS = [
  {
    id: 'cascadia',
    label: 'Cascadia Mono',
    value: '"Cascadia Code", "Cascadia Mono", Consolas, "Microsoft YaHei UI", monospace'
  },
  {
    id: 'consolas',
    label: 'Consolas',
    value: 'Consolas, "Courier New", "Microsoft YaHei UI", monospace'
  },
  {
    id: 'ui-mono',
    label: 'UI Monospace',
    value: 'ui-monospace, Consolas, "Microsoft YaHei UI", monospace'
  }
] as const
