/**
 * Tally marks are drawn in groups of five: four upright strokes crossed by a fifth.
 * `fullGroups` renders as struck-through bundles, `remainder` as loose strokes.
 */
export function tallyGroups(count: number): { fullGroups: number; remainder: number } {
  const safe = Math.max(0, Math.floor(count));
  return { fullGroups: Math.floor(safe / 5), remainder: safe % 5 };
}
