import { Document, Packer, Paragraph, TextRun } from "docx";
import { saveAs } from "file-saver";
import { LayoutElement } from "../types/section";
import { StyleConfig } from "@/types/styles";

export async function exportLayoutDocx(
  layout: LayoutElement[],
  style: StyleConfig
) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: layout.map((el) =>
          new Paragraph({
            children: [
              new TextRun({
                text: el.title || "",
                bold: true,
                size: 28,
              }),
              new TextRun({
                text: el.content || "",
                break: 1,
                size: 24,
              }),
            ],
          })
        ),
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, "Lebenslauf.docx");
}
