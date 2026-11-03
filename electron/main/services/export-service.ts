import { app, dialog } from 'electron'
import { buildThemePackage, exportFileByKind, type PackageFileName } from '@engine/export/package'
import { listZipEntries, zipThemePackage } from '@engine/export/zip'
import { validateTheme } from '@engine/validation/validate'
import { translate } from '@i18n/resources'
import type { ExportKind, ExportResult } from '@shared/ipc'
import { resolveLanguage } from '@shared/locale'
import { imageMime } from '@shared/path-guard'
import { writeAtomic } from './file-service'
import { readSettings } from './settings-service'
import { safeExportName } from './theme-service'

function t(key: string, values?: Record<string, string | number>): string {
  return translate(resolveLanguage(readSettings().language, app.getLocale()), key, values)
}

const FILE_KIND: Record<Exclude<ExportKind, 'zip'>, { name: PackageFileName; extension: string; filterKey: string }> = {
  json: { name: 'theme.json', extension: 'json', filterKey: 'export:dialogJson' },
  variables: { name: 'variables.css', extension: 'css', filterKey: 'export:dialogCss' },
  components: { name: 'components.css', extension: 'css', filterKey: 'export:dialogCss' },
  tailwind: { name: 'tailwind.css', extension: 'css', filterKey: 'export:dialogCss' },
  shadcn: { name: 'shadcn.css', extension: 'css', filterKey: 'export:dialogCss' },
  readme: { name: 'README.md', extension: 'md', filterKey: 'export:dialogMarkdown' }
}

const ZIP_FILES = ['theme-package/theme.json', 'theme-package/variables.css', 'theme-package/components.css', 'theme-package/tailwind.css', 'theme-package/shadcn.css', 'theme-package/README.md']

function requireTheme(input: unknown) {
  const result = validateTheme(input)
  if (!result.ok) throw new Error(result.errors.join('\n'))
  return result.theme
}

export async function exportTheme(themeInput: unknown, kind: unknown): Promise<ExportResult> {
  if (kind !== 'json' && kind !== 'variables' && kind !== 'components' && kind !== 'tailwind' && kind !== 'shadcn' && kind !== 'readme' && kind !== 'zip') {
    throw new Error('code:unknownExport')
  }
  const theme = requireTheme(themeInput)
  const pack = buildThemePackage(theme)
  if (pack.errors.length > 0) throw new Error(pack.errors.join('\n'))

  if (kind === 'zip') {
    const buffer = await zipThemePackage(pack.files)
    const entries = await listZipEntries(buffer)
    for (const required of ZIP_FILES) {
      if (!entries.includes(required)) throw new Error(`code:packageMissing|${required}`)
    }
    const picked = await dialog.showSaveDialog({
      title: t('export:dialogPackage'),
      defaultPath: safeExportName(theme, 'zip'),
      filters: [{ name: t('export:dialogZip'), extensions: ['zip'] }]
    })
    if (picked.canceled || !picked.filePath) return { canceled: true }
    writeAtomic(picked.filePath, buffer)
    return { canceled: false, filePath: picked.filePath }
  }

  const spec = FILE_KIND[kind]
  const file = exportFileByKind(theme, spec.name)
  const picked = await dialog.showSaveDialog({
    title: t('export:dialogExport', { name: spec.name }),
    defaultPath: file.path === 'README.md' ? 'README.md' : safeExportName(theme, spec.extension),
    filters: [{ name: t(spec.filterKey), extensions: [spec.extension] }]
  })
  if (picked.canceled || !picked.filePath) return { canceled: true }
  writeAtomic(picked.filePath, file.contents)
  return { canceled: false, filePath: picked.filePath }
}

export async function pickImage(): Promise<{ canceled: boolean; dataUrl?: string }> {
  const picked = await dialog.showOpenDialog({
    title: t('export:dialogBackground'),
    properties: ['openFile'],
    filters: [{ name: t('export:dialogImages'), extensions: ['png', 'jpg', 'jpeg', 'webp', 'gif'] }]
  })
  if (picked.canceled || !picked.filePaths[0]) return { canceled: true }
  const { readFileSync, statSync } = await import('node:fs')
  const file = picked.filePaths[0]
  const stat = statSync(file)
  if (!stat.isFile()) throw new Error('code:imageRequired')
  if (stat.size > 8_000_000) throw new Error('code:imageTooLarge')
  const buffer = readFileSync(file)
  const mime = imageMime(buffer)
  if (!mime) throw new Error('code:imageUnsupported')
  return { canceled: false, dataUrl: `data:${mime};base64,${buffer.toString('base64')}` }
}
