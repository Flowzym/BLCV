import jsPDF from "jspdf";
import type { CanvasElement } from "../store/designerStore";
export async function exportPdf(elements: CanvasElement[], tokens: any): Promise<Blob> {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setFontSize(tokens.fontSize);
  doc.setTextColor(tokens.colorPrimary);
  let y = 36;
  for (const e of elements) {
    if (e.kind === "section") {
      for (const line of (e as any).content.split("\n")) {
        doc.text(line, 36, y);
        y += tokens.fontSize * 1.5;
      }
    }
    if (e.kind === "photo") {
      doc.addImage((e as any).src, "JPEG", e.frame.x, y, e.frame.width, e.frame.height);
      y += e.frame.height + tokens.spacing;
    }
  }
  return doc.output("blob");
}
