import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}

export async function copyText(value: string): Promise<void> {
  await navigator.clipboard.writeText(value)
}
