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
