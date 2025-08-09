import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

/**
 * Erwartete Element-Struktur (minimal):
 * { kind: "section"|"photo", id: string, frame: {x,y,width,height}, content?: string, src?: string, title?: string }
 * tokens: { fontFamily?, fontSize?, lineHeight?, colorPrimary?, margins? }
 */
type Frame = { x: number; y: number; width: number; height: number };
type CanvasElement = {
  kind: "section" | "photo";
  id: string;
  frame: Frame;
  content?: string;
  src?: string;
  title?: string;
};

function dataUrlToBytes(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(",")[1] || "";
  const binStr = atob(base64);
  const len = binStr.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binStr.charCodeAt(i);
  return bytes;
}

export async function exportPdf(elements: CanvasElement[], tokens: any = {}): Promise<Blob> {
  const pdf = await PDFDocument.create();

  // A4 @ 72 dpi: 595 x 842 pt
  const PAGE_W = 595;
  const PAGE_H = 842;

  const margins = {
    top: tokens?.margins?.top ?? 36,
    right: tokens?.margins?.right ?? 36,
    bottom: tokens?.margins?.bottom ?? 36,
    left: tokens?.margins?.left ?? 36
  };

  const fontSize = Number(tokens?.fontSize) > 0 ? Number(tokens.fontSize) : 11;
  const lineHeight = Number(tokens?.lineHeight) > 0 ? Number(tokens.lineHeight) : 1.4;

  const page = pdf.addPage([PAGE_W, PAGE_H]);
  const contentW = PAGE_W - margins.left - margins.right;
  let cursorY = PAGE_H - margins.top;

  // Standard-Schrift
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const primary = tokens?.colorPrimary ?? "#111111";
  const [r, g, b] = hexToRgb(primary);

  // Hilfsfunktionen
  const textWidth = (text: string, fs: number, bold = false) => {
    const f = bold ? fontBold : font;
    return f.widthOfTextAtSize(text, fs);
  };
  const drawText = (p: any, x: number, y: number, text: string, fs: number, bold = false) => {
    p.drawText(text, {
      x, y, size: fs, font: bold ? fontBold : font, color: rgb(r, g, b)
    });
  };

  for (const el of elements) {
    if (el.kind === "section") {
      const title = (el.title || "").trim();
      const content = (el.content || "").toString();

      if (title) {
        // Umbruch falls nötig
        if (cursorY - fontSize * 1.2 < margins.bottom) pageBreak();
        drawText(page, margins.left, cursorY, title, Math.round(fontSize * 1.05), true);
        cursorY -= fontSize * 1.6;
      }

      const paragraphs = content.split("\n").map((l) => l.trim());
      for (const para of paragraphs) {
        const lines = wrapLine(para, contentW, (s) => textWidth(s, fontSize));
        for (const line of lines) {
          if (cursorY - fontSize * lineHeight < margins.bottom) pageBreak();
          drawText(page, margins.left, cursorY, line, fontSize);
          cursorY -= fontSize * lineHeight;
        }
        // Absatzabstand
        cursorY -= fontSize * 0.4;
      }
    } else if (el.kind === "photo" && el.src) {
      // Bild einfügen; respektiere el.frame Breite/Höhe, move Cursor danach
      if (cursorY - el.frame.height < margins.bottom) pageBreak();
      const bytes = dataUrlToBytes(el.src);
      const isPng = el.src.startsWith("data:image/png");
      const img = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);
      const drawH = el.frame.height;
      const drawW = el.frame.width;
      page.drawImage(img, {
        x: margins.left + (el.frame.x || 0),
        y: cursorY - drawH,
        width: drawW,
        height: drawH
      });
      cursorY -= drawH + fontSize * 0.8;
    }
  }

  const bytes = await pdf.save();
  return new Blob([bytes], { type: "application/pdf" });

  // Helpers
  function pageBreak() {
    const p = pdf.addPage([PAGE_W, PAGE_H]);
    (page as any).x = p.getX?.() ?? 0; // noop
    (page as any).y = p.getY?.() ?? 0; // noop
    (page as any).drawText = p.drawText.bind(p);
    (page as any).drawImage = p.drawImage.bind(p);
    (page as any).getWidth = p.getWidth.bind(p);
    (page as any).getHeight = p.getHeight.bind(p);
    (page as any).drawLine = p.drawLine?.bind(p);
    (page as any).moveTo = p.moveTo?.bind(p);
    (page as any).__proto__ = p; // rebind
    cursorY = PAGE_H - margins.top;
  }

  function wrapLine(text: string, maxWidth: number, measure: (s: string) => number): string[] {
    if (!text) return [""];
    const words = text.split(/\s+/);
    const lines: string[] = [];
    let current = "";
    for (const w of words) {
      const candidate = current ? `${current} ${w}` : w;
      if (measure(candidate) <= maxWidth) {
        current = candidate;
      } else {
        if (current) lines.push(current);
        // Wort selbst eventuell zu lang → hart trennen
        if (measure(w) > maxWidth) {
          const split = hardWrap(w, maxWidth, measure);
          lines.push(...split.slice(0, -1));
          current = split[split.length - 1];
        } else {
          current = w;
        }
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function hardWrap(word: string, maxWidth: number, measure: (s: string) => number): string[] {
    const parts: string[] = [];
    let buf = "";
    for (const ch of word) {
      const c2 = buf + ch;
      if (measure(c2) <= maxWidth) {
        buf = c2;
      } else {
        if (buf) parts.push(buf);
        buf = ch;
      }
    }
    if (buf) parts.push(buf);
    return parts;
  }

  function hexToRgb(hex: string): [number, number, number] {
    const h = hex.replace("#", "");
    const bigint = parseInt(h.length === 3 ? h.split("").map(c => c + c).join("") : h, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return [r / 255, g / 255, b / 255];
  }
}
