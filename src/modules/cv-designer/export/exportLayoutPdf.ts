import jsPDF from "jspdf";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "@/types/styles";

export async function exportLayoutPdf(
  layout: LayoutElement[],
  style: StyleConfig
) {
  const doc = new jsPDF();
  let y = 20;

  layout.forEach((el) => {
    doc.setFontSize(14);
    if (el.title) {
      doc.text(el.title, 20, y);
      y += 8;
    }

    doc.setFontSize(11);
    if (el.content) {
      const splitText = doc.splitTextToSize(el.content, 170);
      doc.text(splitText, 20, y);
      y += splitText.length * 6 + 4;
    }
  });

  doc.save("Lebenslauf.pdf");
}
