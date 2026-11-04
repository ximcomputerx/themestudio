import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

function copyWithCommand(value: string): boolean {
  const area = document.createElement('textarea')
  area.value = value
  area.setAttribute('readonly', '')
  area.style.position = 'fixed'
  area.style.top = '0'
  area.style.left = '0'
  area.style.opacity = '0'
  document.body.appendChild(area)
  area.focus()
  area.select()
  const copied = document.execCommand('copy')
  area.remove()
  return copied
}

export async function copyText(value: string): Promise<void> {
  try {
    await navigator.clipboard.writeText(value)
  } catch (error) {
    if (!copyWithCommand(value)) throw error
  }
}
