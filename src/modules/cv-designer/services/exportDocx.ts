import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";
import type { CanvasElement } from "../store/designerStore";

/**
 * Renders a DOCX Blob using token style mapping.
 */
export async function exportDocx(elements: CanvasElement[], tokens: any): Promise<Blob> {
  const paragraphs = elements
    .filter((e) => e.kind === "section")
    .flatMap((e: any) => e.content.split("\n"))
    .map((line: string) => ({ text: line }));

  const templateArrayBuffer = await fetch("/templates/blank.docx").then((r) =>
    r.arrayBuffer()
  );
  const zip = new PizZip(templateArrayBuffer);
  const doc = new Docxtemplater(zip, { paragraphLoop: true });
  doc.setData({ paragraphs, fontFamily: tokens.fontFamily, fontSize: tokens.fontSize });
  doc.render();
  return doc.getZip().generate({ type: "blob" });
}
