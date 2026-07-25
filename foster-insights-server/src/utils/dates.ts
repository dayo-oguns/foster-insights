/**
 * Parses dates in the dataset's M/D/YY or M/D/YYYY format.
 * Returns null for missing/invalid values (e.g. "NA", empty string).
 */
export function parseDate(value: string | undefined): Date | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NA') return null;

  const parts = trimmed.split('/');
  if (parts.length !== 3) return null;

  const month = parseInt(parts[0], 10);
  const day = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);

  if (Number.isNaN(month) || Number.isNaN(day) || Number.isNaN(year)) return null;
  if (year < 100) year += 2000;

  const date = new Date(year, month - 1, day);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Whole number of days between two dates (b - a). */
export function daysBetween(a: Date, b: Date): number {
  const MS_PER_DAY = 1000 * 60 * 60 * 24;
  return Math.round((b.getTime() - a.getTime()) / MS_PER_DAY);
}

/** Parses a numeric CSV field, returning null for missing/invalid values. */
export function toNumber(value: string | undefined): number | null {
  if (value === undefined) return null;
  const trimmed = value.trim();
  if (!trimmed || trimmed.toUpperCase() === 'NA') return null;
  const n = Number(trimmed);
  return Number.isNaN(n) ? null : n;
}
