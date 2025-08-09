// Falls dein Projekt StyleConfig-Typ bereits definiert hat, bleibt der Import bestehen.
// Bei Abweichungen ist dieses Objekt bewusst tolerant typisiert (as any).
import type { StyleConfig } from "@/types/cv-designer";

export const defaultStyleConfig: StyleConfig & any = {
  fontFamily: "Helvetica, Arial, sans-serif",
  fontSize: 11,
  lineHeight: 1.4,
  colorPrimary: "#111111",
  colorSecondary: "#4B5563",
  page: { size: "A4", dpi: 72 },
  margins: { top: 36, right: 36, bottom: 36, left: 36 },
  sectionSpacing: 12,
  snapSize: 20,
  widthPercent: 100
};
