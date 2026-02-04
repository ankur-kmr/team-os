import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Convert string to URL-safe slug
 * Example: "My Organization" → "my-organization"
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")      // Remove special chars
    .replace(/[\s_]+/g, "-")       // Replace spaces with hyphens
    .replace(/^-+|-+$/g, "")       // Remove leading/trailing hyphens
}
