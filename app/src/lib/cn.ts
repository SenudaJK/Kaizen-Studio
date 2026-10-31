/** Joins class names, skipping falsy values. Keeps conditional Tailwind classes readable. */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
