import { describe, it, expect } from 'vitest';
import { snap, snapPosition, snapSize } from '@/utils/snapGrid';

describe('snap utils', () => {
  it('snaps a value to grid', () => {
    expect(snap(13, 10)).toBe(10);
    expect(snap(17, 10)).toBe(20);
  });
  it('snaps position', () => {
    const p = snapPosition({x:13,y:27}, 8);
    expect(p.x % 8).toBe(0);
    expect(p.y % 8).toBe(0);
  });
  it('snaps size', () => {
    const s = snapSize({width:53,height:19}, 5);
    expect(s.width % 5).toBe(0);
    expect(s.height % 5).toBe(0);
  });
});
