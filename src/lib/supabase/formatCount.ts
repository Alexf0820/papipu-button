export const WORLD_COUNT_DIGITS = 24;

export function formatWorldCount(count: number): string {
  const safeCount = Number.isFinite(count) && count >= 0 ? Math.floor(count) : 0;
  return String(safeCount).padStart(WORLD_COUNT_DIGITS, "0").slice(-WORLD_COUNT_DIGITS);
}
