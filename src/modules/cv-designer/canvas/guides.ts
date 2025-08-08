// src/modules/cv-designer/canvas/guides.ts
// Guides + Overflow-Badges für Fabric – robust gegen Default/Namespace-Export

export type Guide = { type: "v" | "h"; pos: number; kind?: string };

export function computeGuides(
  fabricLike: any,
  canvas: any,
  mv: any,
  threshold = 4
): Guide[] {
  const guides: Guide[] = [];
  const mvL = mv.left ?? 0;
  const mvT = mv.top ?? 0;
  const mvW = mv.getScaledWidth?.() ?? mv.width ?? 0;
  const mvH = mv.getScaledHeight?.() ?? mv.height ?? 0;
  const mvCX = mvL + mvW / 2;
  const mvCY = mvT + mvH / 2;

  const near = (a: number, b: number, t = threshold) => Math.abs(a - b) <= t;

  const objs = canvas.getObjects().filter((o: any) => o !== mv);
  for (const o of objs) {
    const l = o.left ?? 0;
    const t = o.top ?? 0;
    const w = o.getScaledWidth?.() ?? o.width ?? 0;
    const h = o.getScaledHeight?.() ?? o.height ?? 0;
    const cx = l + w / 2;
    const cy = t + h / 2;

    if (near(mvCX, cx)) guides.push({ type: "v", pos: cx, kind: "center" });
    if (near(mvL, l)) guides.push({ type: "v", pos: l, kind: "left" });
    if (near(mvL + mvW, l + w)) guides.push({ type: "v", pos: l + w, kind: "right" });

    if (near(mvCY, cy)) guides.push({ type: "h", pos: cy, kind: "mid" });
    if (near(mvT, t)) guides.push({ type: "h", pos: t, kind: "top" });
    if (near(mvT + mvH, t + h)) guides.push({ type: "h", pos: t + h, kind: "bottom" });
  }
  return guides;
}

export function drawGuides(fabricLike: any, canvas: any, guides: Guide[]) {
  const F = (fabricLike as any)?.fabric ?? fabricLike;
  clearGuides(canvas);
  (canvas as any).__guides = guides.map((g) => {
    const line =
      g.type === "v"
        ? new F.Line([g.pos, 0, g.pos, canvas.getHeight()], {
            stroke: "#60a5fa",
            selectable: false,
            evented: false,
          })
        : new F.Line([0, g.pos, canvas.getWidth(), g.pos], {
            stroke: "#60a5fa",
            selectable: false,
            evented: false,
          });
    canvas.add(line);
    line.moveTo?.(0);
    return line;
  });
  canvas.requestRenderAll();
}

export function clearGuides(canvas: any) {
  const arr: any[] = (canvas as any).__guides || [];
  arr.forEach((l) => canvas.remove(l));
  (canvas as any).__guides = [];
  canvas.requestRenderAll();
}

export function drawOverflowBadges(fabricLike: any, canvas: any) {
  const F = (fabricLike as any)?.fabric ?? fabricLike;
  const H = canvas.getHeight();
  const W = canvas.getWidth();
  const margin = 0;

  // alte Badges entfernen
  const old: any[] = (canvas as any).__badges || [];
  old.forEach((o) => canvas.remove(o));
  const badges: any[] = [];

  for (const o of canvas.getObjects()) {
    if (o.selectable !== true) continue;
    const r = {
      left: o.left ?? 0,
      top: o.top ?? 0,
      right: (o.left ?? 0) + (o.getScaledWidth?.() ?? o.width ?? 0),
      bottom: (o.top ?? 0) + (o.getScaledHeight?.() ?? o.height ?? 0),
    };
    const overflow =
      r.left < margin || r.top < margin || r.right > W - margin || r.bottom > H - margin;
    if (overflow) {
      const tag = new F.Textbox("!", {
        left: r.right + 6,
        top: r.top - 10,
        fontSize: 14,
        fill: "#ef4444",
        backgroundColor: "#fee2e2",
        selectable: false,
        evented: false,
      });
      canvas.add(tag);
      badges.push(tag);
    }
  }
  (canvas as any).__badges = badges;
  canvas.requestRenderAll();
}
