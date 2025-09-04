export function toKey(month: string | null, year: string | null): number | null {
  const y = year ? parseInt(String(year), 10) : null;
  if (!y || isNaN(y)) return null;
  const m = month ? parseInt(String(month), 10) : 0;
  if (isNaN(m) || m < 0 || m > 12) return y * 12;
  return y * 12 + m;
}

export function periodWarning(
  startMonth: string | null,
  startYear: string | null,
  endMonth: string | null,
  endYear: string | null,
  isCurrent: boolean
): string | null {
  const s = toKey(startMonth, startYear);
  const e = isCurrent ? Infinity : toKey(endMonth, endYear);
  if (s !== null && typeof e === 'number' && e !== Infinity && e < s) {
    return 'Ende liegt vor dem Start – bitte Zeitraum prüfen.';
  }
  if (s === null && typeof e === 'number' && e !== Infinity) {
    return 'Start fehlt – überlege, ob ein Startdatum sinnvoll ist.';
  }
  return null;
}


/**
 * Compare two entries by period (descending):
 * 1) Entries marked as current (isCurrent) come first.
 * 2) Then by end date (later first). Missing end date treated as current? No – only isCurrent wins.
 * 3) Tie-breaker by start date (later first).
 * If both entries lack any time info, they are equal.
 */
export function compareByPeriod(
  a: { startMonth?: string | null; startYear?: string | null; endMonth?: string | null; endYear?: string | null; isCurrent?: boolean | null },
  b: { startMonth?: string | null; startYear?: string | null; endMonth?: string | null; endYear?: string | null; isCurrent?: boolean | null }
): number {
  const sA = toKey(a.startMonth ?? null, a.startYear ?? null);
  const sB = toKey(b.startMonth ?? null, b.startYear ?? null);
  const eA = (a.isCurrent ? Infinity : toKey(a.endMonth ?? null, a.endYear ?? null)) ?? null;
  const eB = (b.isCurrent ? Infinity : toKey(b.endMonth ?? null, b.endYear ?? null)) ?? null;

  const aHasTime = sA !== null || (typeof eA === 'number');
  const bHasTime = sB !== null || (typeof eB === 'number');

  if (!aHasTime && !bHasTime) return 0;
  if (!aHasTime) return 1;   // b first
  if (!bHasTime) return -1;  // a first

  // 1) End desc (Infinity first)
  const endA = typeof eA === 'number' ? eA : -Infinity;
  const endB = typeof eB === 'number' ? eB : -Infinity;
  if (endA !== endB) return endB - endA;

  // 2) Start desc
  const startA = sA ?? -Infinity;
  const startB = sB ?? -Infinity;
  if (startA !== startB) return startB - startA;

  return 0;
}
