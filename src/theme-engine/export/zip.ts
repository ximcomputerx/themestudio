import JSZip from 'jszip'
import type { ExportFile } from './package'

const SAFE_NAME = /^[A-Za-z0-9._-]+$/

export async function zipThemePackage(files: ExportFile[]): Promise<Uint8Array> {
  const zip = new JSZip()
  const folder = zip.folder('theme-package')
  if (!folder) throw new Error('Unable to create the theme package folder')
  for (const file of files) {
    if (!SAFE_NAME.test(file.path)) throw new Error(`Unsafe export path: ${file.path}`)
    folder.file(file.path, file.contents)
  }
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
}

export async function listZipEntries(buffer: Uint8Array): Promise<string[]> {
  const zip = await JSZip.loadAsync(buffer)
  return Object.keys(zip.files).filter((name) => !name.endsWith('/')).sort()
}
