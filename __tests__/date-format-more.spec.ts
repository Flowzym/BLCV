import { describe, it, expect } from 'vitest';
import { formatZeitraum } from '@/utils/dateUtils';

describe('formatZeitraum – edge cases', () => {
  it('formats start-only year as "ab YYYY"', () => {
    const txt = formatZeitraum(null, '2020', null, null, false);
    expect(txt).toMatch(/2020/);
  });

  it('formats end-only as "bis ..." (year or month/year)', () => {
    const a = formatZeitraum(null, null, null, '2021', false);
    const b = formatZeitraum(null, null, '05', '2021', false);
    expect(a).toMatch(/2021/);
    expect(b).toMatch(/05\/?2021|2021/);
  });

  it('handles full range month/year', () => {
    const txt = formatZeitraum('01','2020','05','2021',false);
    expect(txt).toMatch(/01\/?2020/);
    expect(txt).toMatch(/05\/?2021/);
  });

  it('running job prints "heute" or "laufend"', () => {
    const txt = formatZeitraum('03','2022',null,null,true);
    expect(/heute|laufend/i.test(txt)).toBe(true);
  });
});
