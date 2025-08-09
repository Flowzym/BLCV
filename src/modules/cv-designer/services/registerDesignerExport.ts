// src/modules/cv-designer/services/registerDesignerExport.ts
// Registriert Export-Strategien ("pdf" | "docx") und stellt eine einheitliche API bereit.
// Lädt die konkreten Implementierungen lazy (dynamic import), um das Bundle klein zu halten.

export type ExportType = "pdf" | "docx";

export type Frame = { x: number; y: number; width: number; height: number };

export type CanvasElement =
  | { kind: "section"; id: string; frame: Frame; content: string }
  | { kind: "photo"; id: string; frame: Frame; src: string };

export type StyleToken = {
  fontFamily: string;
  fontSize: number;
  colorPrimary: string;
  // optional: spacing etc. – nicht erzwungen
};

export type Margins = { top: number; right: number; bottom: number; left: number };

export interface ExportContext {
  elements: CanvasElement[];
  tokens: StyleToken;
  margins?: Partial<Margins>;
}

export type Exporter = (ctx: ExportContext) => Promise<Blob>;

const registry = new Map<ExportType, Exporter>();

/**
 * PDF-Exporter-Wrapper
 * Erwartet eine der folgenden Signaturen aus ./exportPdf:
 *   - export async function exportPdf(elements, tokens, margins?): Promise<Blob>
 *   - export default async function(ctx: ExportContext): Promise<Blob>
 */
const pdfExporter: Exporter = async (ctx) => {
  try {
    const mod = await import("./exportPdf");
    const fn: any = (mod as any).exportPdf ?? (mod as any).default;
    if (typeof fn !== "function") {
      throw new Error("exportPdf() nicht gefunden (weder named noch default).");
    }
    // Signatur tolerant auflösen
    return fn.length >= 2 ? await fn(ctx.elements, ctx.tokens, ctx.margins) : await fn(ctx);
  } catch (e: any) {
    throw new Error(`PDF-Export nicht verfügbar: ${e?.message ?? String(e)}`);
  }
};

/**
 * DOCX-Exporter-Wrapper
 * Erwartet eine der folgenden Signaturen aus ./exportDocx:
 *   - export async function exportDocx(elements, tokens, margins?): Promise<Blob>
 *   - export default async function(ctx: ExportContext): Promise<Blob>
 */
const docxExporter: Exporter = async (ctx) => {
  try {
    const mod = await import("./exportDocx");
    const fn: any = (mod as any).exportDocx ?? (mod as any).default;
    if (typeof fn !== "function") {
      throw new Error("exportDocx() nicht gefunden (weder named noch default).");
    }
    // Signatur tolerant auflösen
    return fn.length >= 2 ? await fn(ctx.elements, ctx.tokens, ctx.margins) : await fn(ctx);
  } catch (e: any) {
    throw new Error(`DOCX-Export nicht verfügbar: ${e?.message ?? String(e)}`);
  }
};

/**
 * Registriert die Export-Strategien. Idempotent – mehrfacher Aufruf ist ok.
 */
export function registerDesignerExport(): void {
  if (!registry.has("pdf")) registry.set("pdf", pdfExporter);
  if (!registry.has("docx")) registry.set("docx", docxExporter);
}

/**
 * Liefert den Exporter für einen Typ.
 */
export function getExporter(type: ExportType): Exporter {
  const ex = registry.get(type);
  if (!ex) {
    throw new Error(
      `Exporter "${type}" ist nicht registriert. Hast du registerDesignerExport() ausgeführt?`
    );
  }
  return ex;
}

/**
 * Bequeme Einmal-Funktion: wählt Strategie und führt Export aus.
 */
export async function exportWith(type: ExportType, ctx: ExportContext): Promise<Blob> {
  const ex = getExporter(type);
  return ex(ctx);
}

// Auch als Default exportieren, damit beide Import-Varianten funktionieren.
export default registerDesignerExport;
