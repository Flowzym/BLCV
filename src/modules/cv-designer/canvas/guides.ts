// src/modules/cv-designer/canvas/guides.ts
import type fabricNS from '@/lib/fabric-shim';

export type Guide = { type: 'v'|'h'; pos: number; kind: 'center'|'left'|'right'|'top'|'bottom'|'page_center'|'page_left'|'page_right'|'page_top'|'page_bottom' };

export function computeGuides(fabric: typeof fabricNS, canvas: any, moving: any, threshold = 5): Guide[] {
  const guides: Guide[] = [];
  const objs = canvas.getObjects().filter((o:any)=> o.selectable && o !== moving && o.name !== '__guide__' && o.name !== '__overflow_badge__');
  const mv = moving;
  const mvLeft = (mv.left ?? 0);
  const mvTop = (mv.top ?? 0);
  const mvW = (mv.getScaledWidth?.() ?? mv.width ?? 0);
  const mvH = (mv.getScaledHeight?.() ?? mv.height ?? 0);
  const mvCenterX = mvLeft + mvW/2;
  const mvCenterY = mvTop + mvH/2;

  const pageW = canvas.getWidth?.() ?? 595;
  const pageH = canvas.getHeight?.() ?? 842;
  const pageCX = pageW/2;
  const pageCY = pageH/2;

  const near = (a:number,b:number)=> Math.abs(a-b) <= threshold;

  // align to page centers & edges
  if (near(mvCenterX, pageCX)) guides.push({ type:'v', pos: pageCX, kind:'page_center' });
  if (near(mvCenterY, pageCY)) guides.push({ type:'h', pos: pageCY, kind:'page_center' });
  if (near(mvLeft, 0)) guides.push({ type:'v', pos: 0, kind:'page_left' });
  if (near(mvLeft+mvW, pageW)) guides.push({ type:'v', pos: pageW, kind:'page_right' });
  if (near(mvTop, 0)) guides.push({ type:'h', pos: 0, kind:'page_top' });
  if (near(mvTop+mvH, pageH)) guides.push({ type:'h', pos: pageH, kind:'page_bottom' });

  // align to other objects (edges + centers)
  for (const ob of objs) {
    const l = (ob.left ?? 0);
    const t = (ob.top ?? 0);
    const w = (ob.getScaledWidth?.() ?? ob.width ?? 0);
    const h = (ob.getScaledHeight?.() ?? ob.height ?? 0);
    const cx = l + w/2;
    const cy = t + h/2;

    if (near(mvCenterX, cx)) guides.push({ type:'v', pos: cx, kind:'center' });
    if (near(mvLeft, l)) guides.push({ type:'v', pos: l, kind:'left' });
    if (near(mvLeft+mvW, l+w)) guides.push({ type:'v', pos: l+w, kind:'right' });

    if (near(mvCenterY, cy)) guides.push({ type:'h', pos: cy, kind:'center' });
    if (near(mvTop, t)) guides.push({ type:'h', pos: t, kind:'top' });
    if (near(mvTop+mvH, t+h)) guides.push({ type:'h', pos: t+h, kind:'bottom' });
  }
  return guides;
}

export function drawGuides(fabric: typeof fabricNS, canvas:any, guides: Guide[]) {
  // remove existing
  const old = canvas.getObjects().filter((o:any)=> o?.name === '__guide__');
  old.forEach((o:any)=> canvas.remove(o));

  for (const g of guides) {
    if (g.type === 'v') {
      const line = new fabric.Line([g.pos, 0, g.pos, canvas.getHeight?.() ?? 842], { stroke: '#60a5fa', selectable:false, evented:false });
      (line as any).name = '__guide__';
      canvas.add(line);
      canvas.sendToBack(line);
    } else {
      const line = new fabric.Line([0, g.pos, canvas.getWidth?.() ?? 595, g.pos], { stroke: '#60a5fa', selectable:false, evented:false });
      (line as any).name = '__guide__';
      canvas.add(line);
      canvas.sendToBack(line);
    }
  }
  canvas.requestRenderAll();
}

export function clearGuides(canvas:any){
  const old = canvas.getObjects().filter((o:any)=> o?.name === '__guide__');
  old.forEach((o:any)=> canvas.remove(o));
  canvas.requestRenderAll();
}

export function drawOverflowBadges(fabric: typeof fabricNS, canvas:any){
  // remove existing badges
  const olds = canvas.getObjects().filter((o:any)=> o?.name === '__overflow_badge__');
  olds.forEach((o:any)=> canvas.remove(o));

  const W = canvas.getWidth?.() ?? 595;
  const H = canvas.getHeight?.() ?? 842;

  (canvas.getObjects() as any[]).forEach((o:any)=>{
    if (o.name === '__guide__' || o.name === '__overflow_badge__' || !o.selectable) return;
    const l = o.left ?? 0; const t = o.top ?? 0;
    const w = o.getScaledWidth?.() ?? o.width ?? 0;
    const h = o.getScaledHeight?.() ?? o.height ?? 0;
    const over = l < 0 || t < 0 || (l+w)>W || (t+h)>H;
    if (!over) return;
    const bx = Math.min(Math.max(l + w - 6, 6), W - 6);
    const by = Math.min(Math.max(t + 6, 6), H - 6);
    const badge = new fabric.Circle({ left: bx, top: by, radius: 6, fill: '#ef4444', selectable:false, evented:false });
    (badge as any).name = '__overflow_badge__';
    canvas.add(badge);
    canvas.bringToFront(badge);
  });
  canvas.requestRenderAll();
}
