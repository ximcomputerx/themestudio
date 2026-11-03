import { useEffect } from 'react'
import { PropertyEditor } from '@/components/editor/PropertyEditor'
import { StatusBar, StudioDialogs, ThemeLibrary, TokenPanel, Toolbar } from '@/components/layout/Chrome'
import { PreviewStage } from '@/components/preview/PreviewStage'
import { TooltipProvider } from '@/components/ui/primitives'
import { applyResolvedLanguage, text } from '@/i18n'
import { describeError } from '@/i18n/localize'
import { useLabel } from '@/i18n/use-label'
import { cn } from '@/lib/utils'
import { useStudioStore } from '@/store/studio-store'
import type { PreviewScene } from '@shared/ipc'
import { resolveLanguage } from '@shared/locale'

export function App() {
  const bootState = useStudioStore((state) => state.bootState)
  const bootError = useStudioStore((state) => state.bootError)
  const focus = useStudioStore((state) => state.previewFocus)
  const platform = window.themeStudio?.platform
  const { label } = useLabel()

  useEffect(() => {
    if (!window.themeStudio) return
    void useStudioStore.getState().boot()
    const stop = window.themeStudio.onMenuAction((action) => {
      const store = useStudioStore.getState()
      if (action === 'new') store.createTheme('neon-glass-blue', text('theme-library:untitled'))
      else if (action === 'save') void store.save().catch((error: unknown) => store.notify({ raw: error instanceof Error ? error.message : 'code:saveFailed' }))
      else if (action === 'save-as') store.setSaveAsOpen(true)
      else if (action === 'import') void store.importTheme()
      else if (action === 'export') store.setExportOpen(true)
      else if (action === 'undo') store.undo()
      else if (action === 'redo') store.redo()
      else if (action === 'compare') store.setCompare(!store.compare)
      else if (action === 'toggle-preview-fullscreen') store.setPreviewFocus(!store.previewFocus)
      else if (action === 'settings') store.setSettingsOpen(true)
      else if (action === 'request-close') void store.requestClose()
      else if (action.startsWith('scene:')) store.setScene(action.slice('scene:'.length) as PreviewScene)
      else if (action.startsWith('preset:')) store.createTheme(action.slice('preset:'.length))
    })
    const stopLocale = window.themeStudio.language.onSystemLocaleChanged((locale) => {
      const store = useStudioStore.getState()
      if (store.languagePreference !== 'system') {
        useStudioStore.setState({ systemLocale: locale })
        return
      }
      void applyResolvedLanguage(resolveLanguage('system', locale)).then(() => {
        useStudioStore.setState({ systemLocale: locale })
      })
    })
    const onKey = (event: KeyboardEvent) => {
      const typing = event.target instanceof HTMLElement && Boolean(event.target.closest('input, textarea, select, [contenteditable="true"]'))
      const meta = event.ctrlKey || event.metaKey
      if (!meta) return
      const store = useStudioStore.getState()
      const key = event.key.toLowerCase()
      if (key === 's') {
        event.preventDefault()
        if (event.shiftKey) store.setSaveAsOpen(true)
        else void store.save().catch((error: unknown) => store.notify({ raw: error instanceof Error ? error.message : 'code:saveFailed' }))
      } else if (!typing && key === 'z') {
        event.preventDefault()
        if (event.shiftKey) store.redo()
        else store.undo()
      } else if (!typing && key === 'y') {
        event.preventDefault()
        store.redo()
      } else if (!typing && key === 'n') {
        event.preventDefault()
        store.createTheme('neon-glass-blue', text('theme-library:untitled'))
      } else if (!typing && key === 'e') {
        event.preventDefault()
        store.setExportOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      stop()
      stopLocale()
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  if (!window.themeStudio) {
    return (
      <div className="boot">
        <h1>Theme Studio</h1>
        <p>{label('messages:shellOnly')}</p>
      </div>
    )
  }

  if (bootState !== 'ready') {
    return (
      <div className="boot">
        <h1>Theme Studio</h1>
        <p>{bootState === 'error' ? describeError(bootError ?? '', label) : label('messages:opening')}</p>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={cn('shell', focus && 'focus-preview', platform === 'win32' && 'platform-win32')}>
        <Toolbar />
        <div className="workspace">
          <ThemeLibrary />
          <PreviewStage />
          <PropertyEditor />
        </div>
        <TokenPanel />
        <StatusBar />
        <StudioDialogs />
      </div>
    </TooltipProvider>
  )
}
