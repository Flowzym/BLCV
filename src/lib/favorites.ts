export type FavoriteKind = 'company'|'position'|'aufgabenbereich'|'institution'|'ausbildungsart'|'abschluss';

export function canonicalize(v: string): string {
  return String(v ?? '').trim().toLowerCase();
}

export function hasFavorite(list: string[], value: string): boolean {
  const c = canonicalize(value);
  return list.some(x => canonicalize(x) === c);
}

export function toggleFavoriteIn(list: string[], value: string): string[] {
  const c = canonicalize(value);
  const filtered = list.filter(x => canonicalize(x) !== c);
  const wasPresent = filtered.length !== list.length;
  return wasPresent ? filtered : [...filtered, value];
}

export function dedupeFavorites(list: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const x of list) {
    const c = canonicalize(x);
    if (!seen.has(c)) { seen.add(c); out.push(x); }
  }
  return out;
}

export function sortByFavorite(items: string[], favorites: string[]): string[] {
  const favSet = new Set(favorites.map(canonicalize));
  return [...items].sort((a,b) => {
    const af = favSet.has(canonicalize(a)) ? 0 : 1;
    const bf = favSet.has(canonicalize(b)) ? 0 : 1;
    if (af !== bf) return af - bf;
    return a.localeCompare(b, undefined, { sensitivity: 'base' });
  });
}
