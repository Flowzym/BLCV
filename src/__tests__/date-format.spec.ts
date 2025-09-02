import { describe, it, expect } from 'vitest';
import { formatZeitraum } from '@/utils/dateUtils';

describe('formatZeitraum', () => {
  it('formats running periods', () => {
    expect(formatZeitraum('03','2022',null,null,true)).toContain('heute');
  });
  it('formats year-only ranges', () => {
    expect(formatZeitraum(null,'2020',null,'2021',false)).toContain('2020');
  });
  it('formats month/year pairs', () => {
    expect(formatZeitraum('01','2020','05','2021',false)).toContain('01/2020');
  });
});
