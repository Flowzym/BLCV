/**
 * Font Utilities - Vereinfachte Font-Vererbung ohne globale Einstellungen
 */

import { StyleConfig, FontConfig, SectionStyleOverride } from "../types/styles";

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
 * Maps StyleConfig.fontSize enum to numeric px values
 */
export function mapFontSizeToPixels(fontSize?: string): number {
  switch (fontSize) {
    case 'small': return 10;
    case 'medium': return 12;
    case 'large': return 14;
    default: return 12;
  }
}

/**
 * 🎯 ZENTRALE UTILITY: Berechnet effektive Font-Konfiguration
 * Vereinfachte Vererbungsreihenfolge: default → section → field
 * Nur !== undefined Werte überschreiben vorherige Werte
 */
export function getEffectiveFontConfig(
  sectionId: string,
  fieldKey: string | null,
  type: "header" | "content" | "field",
  styleConfig: StyleConfig
): FontConfig {
  console.log(`🔍 getEffectiveFontConfig: calculating for ${sectionId}.${type}.${fieldKey || 'null'}`);
  
  // Step 1: Start with defaults
  let effective: FontConfig = { ...defaultFont };
  console.log('Step 1 - defaults:', effective);

  // Step 2: Apply section-specific font
  const sectionConfig = styleConfig.sections?.[sectionId];
  if (sectionConfig) {
    if (type === "header" && sectionConfig.header?.font) {
      effective = mergeFont(effective, sectionConfig.header.font);
      console.log('Step 2a - section header:', effective);
    } else if (type === "content" && sectionConfig.font) {
      effective = mergeFont(effective, sectionConfig.font);
      console.log('Step 2b - section content:', effective);
    }
  }

  // Step 3: Apply field-specific font
  if (fieldKey && sectionConfig?.fields?.[fieldKey]?.font) {
    effective = mergeFont(effective, sectionConfig.fields[fieldKey].font);
    console.log('Step 3 - field specific:', effective);
  }

  // Step 4: Apply color inheritance from styleConfig.colors
  if (!effective.color || effective.color === defaultFont.color) {
    if (type === "header") {
      effective.color = styleConfig.colors?.primary || styleConfig.primaryColor || defaultFont.color;
    } else {
      effective.color = styleConfig.colors?.text || styleConfig.textColor || defaultFont.color;
    }
    console.log('Step 4 - color inheritance:', effective);
  }

  // 🎯 WICHTIG: Sicherstellen, dass fontSize immer numerisch in px ist
  if (typeof effective.size === 'string') {
    effective.size = mapFontSizeToPixels(effective.size);
    console.log('Step 5 - fontSize conversion to px:', effective.size);
  }

  console.log(`✅ getEffectiveFontConfig: FINAL result for ${sectionId}.${type}.${fieldKey || 'null'}:`, effective);
  return effective;
}

/**
 * Merges font configurations, only overriding with !== undefined values
 */
function mergeFont(base: FontConfig, override: Partial<FontConfig>): FontConfig {
  const merged = { ...base };
  
  Object.keys(override).forEach(key => {
    const value = override[key as keyof FontConfig];
    if (value !== undefined) {
      (merged as any)[key] = value;
    }
  });
  
  return merged;
}

/**
 * Gets the local font config for a specific section/field (what's actually stored)
 */
export function getLocalFontConfig(
  sectionId: string,
  fieldKey: string | null,
  type: "header" | "content" | "field",
  styleConfig: StyleConfig
): Partial<FontConfig> | undefined {
  const sectionConfig = styleConfig.sections?.[sectionId];
  if (!sectionConfig) return undefined;

  if (type === "header") {
    return sectionConfig.header?.font;
  } else if (type === "content") {
    return sectionConfig.font;
  } else if (fieldKey) {
    return sectionConfig.fields?.[fieldKey]?.font;
  }

  return undefined;
}

/**
 * Checks if a font property is explicitly set (not inherited)
 */
export function isFontPropertyExplicit(
  sectionId: string,
  fieldKey: string | null,
  type: "header" | "content" | "field",
  property: keyof FontConfig,
  styleConfig: StyleConfig
): boolean {
  const localConfig = getLocalFontConfig(sectionId, fieldKey, type, styleConfig);
  return localConfig?.[property] !== undefined;
}

/**
 * Resets all font properties for a section/field to undefined (enables inheritance)
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