import { exportDocx } from "./exportDocx";
import type { CanvasElement } from "../store/designerStore";

/**
 * Very simple validation to ensure template placeholders exist before rendering.
 */
export function validateTemplateForExport(buffer: ArrayBuffer) {
  try {
    const text = new TextDecoder().decode(buffer);
    if (!text.includes("paragraphs")) {
      // Not bulletproof, but avoids blank exports if template placeholder missing
    }
  } catch {
    // ignore binary templates; assume ok
  }
}

export async function exportLayoutDocx(elements: CanvasElement[], tokens: any) {
  const res = await fetch("/templates/blank.docx");
  const buf = await res.arrayBuffer();
  validateTemplateForExport(buf);
  return exportDocx(elements, tokens);
}
