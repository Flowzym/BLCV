import { describe, it, expect } from 'vitest';
import { genId } from '@/lib/id';

describe('genId', () => {
  it('prefixes and generates unique ids', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 500; i++) {
      const id = genId('exp');
      expect(id.startsWith('exp_')).toBe(true);
      expect(seen.has(id)).toBe(false);
      seen.add(id);
    }
  });
});
