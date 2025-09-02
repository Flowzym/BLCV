import { describe, it, expect } from 'vitest';
import { periodWarning, toKey } from '@/lib/dateGuard';

describe('dateGuard', () => {
  it('warns when end < start', () => {
    const w = periodWarning('07','2025','08','2023',false);
    expect(w).toMatch(/Ende liegt vor dem Start/i);
  });

  it('no warning when laufend', () => {
    const w = periodWarning('07','2025',null,null,true);
    expect(w).toBeNull();
  });

  it('warns when end exists but start missing', () => {
    const w = periodWarning(null,null,'05','2020',false);
    expect(w).toMatch(/Start fehlt/i);
  });

  it('toKey returns null without year and handles invalid month', () => {
    expect(toKey('03', null)).toBeNull();
    expect(toKey('13', '2020')).toBe(2020 * 12); // invalid month -> treat as year only
    expect(toKey('05', '2020')).toBe(2020 * 12 + 5);
  });
});
