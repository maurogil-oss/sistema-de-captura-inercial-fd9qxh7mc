/* General utility functions (exposes cn) */
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merges multiple class names into a single string
 * @param inputs - Array of class names
 * @returns Merged class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Generates a unique short ID for trip sessions
 */
export const generateSessionId = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const rand = (len: number) =>
    Array.from({ length: len })
      .map(() => chars[Math.floor(Math.random() * chars.length)])
      .join('')
  return `TRP-${rand(4)}-${rand(2)}`
}
