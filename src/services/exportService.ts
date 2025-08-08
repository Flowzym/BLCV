import { saveAs } from "file-saver";
import type { Section } from "@/types/section";
import type { StyleConfig } from "@/modules/cv-designer/types/styles";

const DEFAULT_STYLE = { fontFamily: 'Inter', fontSize: 12, colorPrimary: '#111827', spacing: 8 } as const;

export interface ExportContext {
  sections: Section[];
  style: StyleConfig;
}

export interface ExportHooks {
  onStart?: () => void;
  onProgress?: (p: number) => void; // 0..100
  onSuccess?: (blob: Blob) => void;
  onError?: (err: any) => void;
}

export interface ExportStrategy {
  id: string;
  supports(type: "pdf" | "docx"): boolean;
  render(ctx: ExportContext, type: "pdf" | "docx", hooks?: ExportHooks): Promise<Blob>;
}

const registry: ExportStrategy[] = [];

export function registerExportStrategy(strategy: ExportStrategy) {
  if (!registry.find((s) => s.id === strategy.id)) registry.push(strategy);
}

export async function exportDocument(
  origin: "wizard" | "designer",
  type: "pdf" | "docx",
  ctx: ExportContext,
  hooks?: ExportHooks
) {
  const strat =
    registry.find((s) => s.id === origin && s.supports(type)) ||
    registry.find((s) => s.supports(type));
  if (!strat) {
    hooks?.onError?.(new Error(`No export strategy for ${origin} with ${type}`));
    throw new Error(`No export strategy for ${origin} with ${type}`);
  }
  try {
    hooks?.onStart?.();
    hooks?.onProgress?.(10);
    const blob = await strat.render(ctx, type, hooks);
    hooks?.onProgress?.(100);
    hooks?.onSuccess?.(blob);
    saveAs(blob, `Better_Letter_${origin}.${type}`);
    return blob;
  } catch (e) {
    hooks?.onError?.(e);
    throw e;
  }
}
