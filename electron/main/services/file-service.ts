import { mkdirSync, renameSync, writeFileSync } from 'node:fs'
import path from 'node:path'

export function ensureDir(dir: string): string {
  mkdirSync(dir, { recursive: true })
  return dir
}

export function writeAtomic(file: string, contents: string | Uint8Array): void {
  if (typeof contents === 'string' && contents.length > 2_000_000) throw new Error('code:fileTooLarge')
  if (contents instanceof Uint8Array && contents.byteLength > 8_000_000) throw new Error('code:fileTooLarge')
  const dir = path.dirname(file)
  ensureDir(dir)
  const tmp = path.join(dir, `.${path.basename(file)}.${process.pid}.${Date.now()}.tmp`)
  if (typeof contents === 'string') writeFileSync(tmp, contents, 'utf8')
  else writeFileSync(tmp, contents)
  renameSync(tmp, file)
}
