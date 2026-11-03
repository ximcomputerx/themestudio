import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'electron-vite'

const root = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '@engine': resolve(root, 'src/theme-engine'),
        '@shared': resolve(root, 'src/shared'),
        '@i18n': resolve(root, 'src/i18n')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(root, 'electron/main/index.ts')
        }
      },
      externalizeDeps: {
        exclude: ['jszip']
      }
    }
  },
  preload: {
    resolve: {
      alias: {
        '@shared': resolve(root, 'src/shared'),
        '@engine': resolve(root, 'src/theme-engine')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(root, 'electron/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: resolve(root, 'src'),
    resolve: {
      alias: {
        '@': resolve(root, 'src'),
        '@engine': resolve(root, 'src/theme-engine'),
        '@shared': resolve(root, 'src/shared')
      }
    },
    build: {
      rollupOptions: {
        input: {
          index: resolve(root, 'src/index.html')
        }
      }
    },
    plugins: [react(), tailwindcss()]
  }
})
