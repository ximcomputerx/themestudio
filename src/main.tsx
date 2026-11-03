import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './app/App'
import { initI18n } from './i18n'
import './styles/studio.css'
import './styles/preview.css'

const root = document.getElementById('root')
if (!root) throw new Error('Missing root element')

void initI18n()
  .then(() => {
    createRoot(root).render(
      <StrictMode>
        <App />
      </StrictMode>
    )
  })
  .catch((error: unknown) => {
    root.textContent = error instanceof Error ? error.message : 'Theme Studio failed to start'
  })
