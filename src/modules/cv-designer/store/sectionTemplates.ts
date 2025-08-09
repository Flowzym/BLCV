import type { GroupKey, PartKey, PartStyle, PartSpec, SectionElement, Frame } from "../store/designerStore";

export interface SectionTemplate {
  id: string;
  group: GroupKey;
  /** relative Part-Offets innerhalb der Hauptbox */
  parts: Array<{
    key: PartKey;
    offset: { x: number; y: number; w?: number; h?: number };
    style?: PartStyle;
  }>;
  /** empfohlene Basisgröße (x/y kommen vom Layout/Spalte/Zeile) */
  baseSize: { width: number; height: number };
}

export const Templates = {
  experienceLeft: {
    id: "experience.left",
    group: "erfahrung",
    baseSize: { width: 350, height: 180 },
    parts: [
      { key: "titel", offset: { x: 0, y: 0, w: 350, h: 22 }, style: { fontWeight: "bold", fontSize: 14 } },
      { key: "zeitraum", offset: { x: 0, y: 26, w: 170, h: 18 }, style: { color: "#6b7280", fontSize: 12 } },
      { key: "unternehmen", offset: { x: 180, y: 26, w: 170, h: 18 }, style: { fontWeight: "bold", fontSize: 12 } },
      { key: "position", offset: { x: 0, y: 48, w: 350, h: 18 }, style: { fontSize: 12 } },
      { key: "taetigkeiten", offset: { x: 0, y: 70, w: 350, h: 100 }, style: { fontSize: 12, lineHeight: 1.5 } },
    ],
  } as SectionTemplate,

  educationLeft: {
    id: "education.left",
    group: "ausbildung",
    baseSize: { width: 350, height: 140 },
    parts: [
      { key: "titel", offset: { x: 0, y: 0, w: 350, h: 22 }, style: { fontWeight: "bold", fontSize: 14 } },
      { key: "zeitraum", offset: { x: 0, y: 26, w: 170, h: 18 }, style: { color: "#6b7280", fontSize: 12 } },
      { key: "institution", offset: { x: 180, y: 26, w: 170, h: 18 }, style: { fontWeight: "bold", fontSize: 12 } as PartStyle },
      { key: "abschluss", offset: { x: 0, y: 48, w: 350, h: 18 }, style: { fontSize: 12 } },
    ],
  } as SectionTemplate,

  contactRight: {
    id: "contact.right",
    group: "kontakt",
    baseSize: { width: 180, height: 160 },
    parts: [
      { key: "titel", offset: { x: 0, y: 0, w: 180, h: 20 }, style: { fontWeight: "bold", fontSize: 13 } },
      { key: "kontakt", offset: { x: 0, y: 24, w: 180, h: 120 }, style: { fontSize: 12, lineHeight: 1.5 } },
    ],
  } as SectionTemplate,
};

export function buildSectionFromTemplate(
  tpl: SectionTemplate,
  frame: Frame,
  texts: Partial<Record<PartKey, string>>,
  meta?: SectionElement["meta"],
  title?: string
): SectionElement {
  return {
    kind: "section",
    id: `sec_${Math.random().toString(36).slice(2, 8)}`,
    group: tpl.group,
    frame,
    parts: tpl.parts.map((p) => ({
      key: p.key,
      text: texts[p.key] ?? "",
      offset: { ...p.offset },
      style: p.style ? { ...p.style } : undefined,
    })),
    meta,
    title,
  };
}
