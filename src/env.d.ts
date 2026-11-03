/// <reference types="vite/client" />

import type { ThemeStudioApi } from '@shared/ipc'

declare global {
  interface Window {
    themeStudio: ThemeStudioApi
  }
}

export {}
