// src/__tests__/id.test.ts
import { describe, it, expect } from 'vitest';
import { genId } from '@/lib/id';

describe('genId', () => {
  it('generates unique-ish ids with prefix', () => {
    const a = genId('x');
    const b = genId('x');
    expect(a).not.toBe(b);
    expect(a.startsWith('x-')).toBe(true);
    expect(b.startsWith('x-')).toBe(true);
  });
});
