// src/__tests__/guides.test.ts
import { describe, it, expect } from 'vitest';
import type fabricNS from '@/lib/fabric-shim';
import { computeGuides } from '@/modules/cv-designer/canvas/guides';

function makeCanvas(width=595, height=842){
  const objs:any[] = [];
  return {
    getWidth: ()=> width,
    getHeight: ()=> height,
    getObjects: ()=> objs,
    add: (o:any)=> objs.push(o),
    _objs: objs
  };
}

describe('computeGuides', () => {
  it('returns page center guides when moving object is near center', () => {
    const canvas:any = makeCanvas(600, 800);
    const mv:any = { left: 300-50, top: 400-20, width: 100, height: 40, selectable: true };
    const gs = computeGuides({} as unknown as typeof fabricNS, canvas, mv, 5);
    const v = gs.find(g=> g.type==='v' && (g.kind as any).includes('center'));
    const h = gs.find(g=> g.type==='h' && (g.kind as any).includes('center'));
    expect(v).toBeTruthy();
    expect(h).toBeTruthy();
  });

  it('includes guides from other objects (edges/centers)', () => {
    const canvas:any = makeCanvas();
    canvas._objs.push({ left: 100, top: 100, width: 100, height: 40, selectable: true });
    const mv:any = { left: 150, top: 100, width: 80, height: 40, selectable: true };
    const gs = computeGuides({} as unknown as typeof fabricNS, canvas, mv, 5);
    expect(gs.some(g=> g.kind==='center' && g.type==='v')).toBe(true);
  });
});
