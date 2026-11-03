export const NAMESPACES = [
  'common',
  'navigation',
  'theme-library',
  'theme-editor',
  'colors',
  'glass',
  'glow',
  'preview',
  'inspector',
  'export',
  'settings',
  'messages'
] as const

export type Namespace = (typeof NAMESPACES)[number]
