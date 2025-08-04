// 📄 src/modules/cv-designer/utils/fontUtils.ts

import { StyleConfig, FontConfig } from "../types/styles";

export const defaultFont: FontConfig = {
  family: "Inter",
  size: 12,
  weight: "normal",
  style: "normal",
  color: "#333333",
  letterSpacing: 0,
  lineHeight: 1.6,
};

/**
 * Liefert die tatsächlich wirksamen Font-Einstellungen.
 * Reihenfolge:
 *   1. Defaults
 *   2. Section-Content / Section-Header
 *   3. Field-spezifische Einstellungen
 */
export function getEffectiveFontConfig(
  sectionId: string,
  fieldKey: string | null,
  type: "header" | "content" | "field",
  styleConfig: StyleConfig
): FontConfig {
  let effective: FontConfig = { ...defaultFont };

  const section = styleConfig.sections?.[sectionId];
  if (!section) return effective;

  if (type === "header" && section.header?.font) {
    effective = { ...effective, ...section.header.font };
  } else if (type === "content" && section.font) {
    effective = { ...effective, ...section.font };
  } else if (type === "field" && fieldKey && section.fields?.[fieldKey]?.font) {
    effective = { ...effective, ...section.fields[fieldKey].font };
  }

  return effective;
}

/**
 * Checkt, ob eine Font-Property explizit gesetzt wurde.
 */
export function isFontPropertyExplicit(
  sectionId: string,
  fieldKey: string | null,
  type: "header" | "content" | "field",
  property: keyof FontConfig,
  styleConfig: StyleConfig
): boolean {
  const section = styleConfig.sections?.[sectionId];
  if (!section) return false;

  if (type === "header") {
    return section.header?.font?.[property] !== undefined;
  } else if (type === "content") {
    return section.font?.[property] !== undefined;
  } else if (type === "field" && fieldKey) {
    return section.fields?.[fieldKey]?.font?.[property] !== undefined;
  }
  return false;
}

/**
 * Reset: setzt alle Werte zurück (→ erben Defaults).
 */
export function resetFontConfig(
  sectionId: string,
  fieldKey: string | null,
  type: "header" | "content" | "field"
): Partial<FontConfig> {
  return {
    family: undefined,
    size: undefined,
    weight: undefined,
    style: undefined,
    color: undefined,
    letterSpacing: undefined,
    lineHeight: undefined,
  };
}
