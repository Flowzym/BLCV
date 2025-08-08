// src/modules/cv-designer/canvas/guides.ts
import type fabricNS from '@/lib/fabric-shim';

export type GuideKind =
  | 'center' | 'left' | 'right' | 'top' | 'bottom'
  | 'page_center' | 'page_left' | 'page_right' | 'page_top' | 'page_bottom';

export type Guide = { type: 'v'|'h'; pos: number; kind: GuideKind };

const GUIDE_NAME = '__guide__';
const BADGE_NAME = '__overflow_badge__';

function near(a: number, b: number, thr: number) {
  return Math.abs(a - b) <= thr;
}

export function computeGuides(fabric: typeof fabricNS, canvas: any, moving: any, threshold = 5): Guide[] {
  const guides: Guide[] = [];
  const objs = (canvas.getObjects() as any[]).filter(
    (o: any) => o && o.selectable && o.name !== GUIDE_NAME && o.name !== BADGE_NAME
  );
  const mv = moving;
  const l0 = mv.left ?? 0;
  const t0 = mv.top ?? 0;
  const w0 = mv.getScaledWidth?.() ?? mv.width ?? 0;
  const h0 = mv.getScaledHeight?.() ?? mv.height ?? 0;
  const cx0 = l0 + w0 / 2;
  const cy0 = t0 + h0 / 2;

  // other objects
  for (const o of objs) {
    if (o === mv) continue;
    const l = o.left ?? 0;
    const t = o.top ?? 0;
    const w = o.getScaledWidth?.() ?? o.width ?? 0;
    const h = o.getScaledHeight?.() ?? o.height ?? 0;
    const cx = l + w / 2;
    const cy = t + h / 2;

    if (near(cx0, cx, threshold)) guides.push({ type: 'v', pos: cx, kind: 'center' });
    if (near(l0, l, threshold)) guides.push({ type: 'v', pos: l, kind: 'left' });
    if (near(l0 + w0, l + w, threshold)) guides.push({ type: 'v', pos: l + w, kind: 'right' });

    if (near(cy0, cy, threshold)) guides.push({ type: 'h', pos: cy, kind: 'center' });
    if (near(t0, t, threshold)) guides.push({ type: 'h', pos: t, kind: 'top' });
    if (near(t0 + h0, t + h, threshold)) guides.push({ type: 'h', pos: t + h, kind: 'bottom' });
  }

  // page guides
  const W = canvas.getWidth?.() ?? 595;
  const H = canvas.getHeight?.() ?? 842;
  const pageCX = W / 2, pageCY = H / 2;
  if (near(cx0, pageCX, threshold)) guides.push({ type: 'v', pos: pageCX, kind: 'page_center' });
  if (near(l0, 0, threshold)) guides.push({ type: 'v', pos: 0, kind: 'page_left' });
  if (near(l0 + w0, W, threshold)) guides.push({ type: 'v', pos: W, kind: 'page_right' });
  if (near(cy0, pageCY, threshold)) guides.push({ type: 'h', pos: pageCY, kind: 'page_center' });
  if (near(t0, 0, threshold)) guides.push({ type: 'h', pos: 0, kind: 'page_top' });
  if (near(t0 + h0, H, threshold)) guides.push({ type: 'h', pos: H, kind: 'page_bottom' });

  return guides;
}

export function clearGuides(canvas: any) {
  const all = canvas.getObjects();
  for (const o of [...all]) {
    if ((o as any).name === GUIDE_NAME || (o as any).name === BADGE_NAME) {
      canvas.remove(o);
    }
  }
}

export function drawGuides(fabric: typeof fabricNS, canvas: any, guides: Guide[]) {
  clearGuides(canvas);
  for (const g of guides) {
    const line = new (fabric as any).Line(
      g.type === 'v' ? [g.pos, 0, g.pos, canvas.getHeight?.() ?? 842] : [0, g.pos, canvas.getWidth?.() ?? 595, g.pos],
      { stroke: '#3b82f6', selectable: false, evented: false }
    );
    (line as any).name = GUIDE_NAME;
    canvas.add(line);
  }
  canvas.requestRenderAll();
}

export function drawOverflowBadges(fabric: typeof fabricNS, canvas: any) {
  // remove old badges
  const toRemove = (canvas.getObjects() as any[]).filter((o) => (o as any).name === BADGE_NAME);
  toRemove.forEach((o) => canvas.remove(o));

  const W = canvas.getWidth?.() ?? 595;
  const H = canvas.getHeight?.() ?? 842;

  (canvas.getObjects() as any[]).forEach((o: any) => {
    if (!o || !o.selectable || (o as any).name === GUIDE_NAME) return;
    const l = o.left ?? 0;
    const t = o.top ?? 0;
    const w = o.getScaledWidth?.() ?? o.width ?? 0;
    const h = o.getScaledHeight?.() ?? o.height ?? 0;
    const over = l < 0 || t < 0 || l + w > W || t + h > H;
    if (!over) return;
    const bx = Math.min(Math.max(l + w - 6, 6), W - 6);
    const by = Math.min(Math.max(t + 6, 6), H - 6);
    const badge = new (fabric as any).Circle({ left: bx, top: by, radius: 6, fill: '#ef4444', selectable: false, evented: false });
    (badge as any).name = BADGE_NAME;
    canvas.add(badge);
    canvas.bringToFront(badge);
  });
  canvas.requestRenderAll();
}
