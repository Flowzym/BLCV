// Single-Source Export Registry for Better_Letter (Designer + weitere Module)
export type ExportType = "pdf" | "docx";

export type ExportContext = {
  // Eine der beiden Quellen (Designer nutzt meist elements)
  elements?: any[];     // Canvas-/Designer-Elemente
  sections?: any[];     // Generische CV-Sections
  tokens?: any;         // Style-/Design-Tokens (Schriften, Margins etc.)
  fileName?: string;    // gewünschter Dateiname (ohne Extension)
};

export type ExportStrategy = (ctx: ExportContext) => Promise<Blob>;

const registry = new Map<ExportType, ExportStrategy>();

export function registerExportStrategy(type: ExportType, fn: ExportStrategy) {
  registry.set(type, fn);
}

export function unregisterExportStrategy(type: ExportType) {
  registry.delete(type);
}

export function getAvailableExportTypes(): ExportType[] {
  return Array.from(registry.keys());
}

export async function runExport(type: ExportType, ctx: ExportContext): Promise<Blob> {
  const strat = registry.get(type);
  if (!strat) {
    throw new Error(`No export strategy registered for type "${type}"`);
  }
  // Minimaler Guard: nichts Crashen lassen
  const safeCtx: ExportContext = {
    elements: ctx.elements ?? [],
    sections: ctx.sections ?? [],
    tokens: ctx.tokens ?? {},
    fileName: (ctx.fileName || "export").replace(/\.(pdf|docx)$/i, "")
  };
  return strat(safeCtx);
}
