import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utilitário para combinar classes Tailwind de forma segura,
 * resolvendo conflitos de especificidade.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
