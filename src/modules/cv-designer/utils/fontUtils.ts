/**
 * Font Utilities - Central font inheritance and effective config calculation
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
 * Central function to calculate effective font configuration
 * Implements inheritance chain: defaults → global → allHeaders → name → section → field
 * Only !== undefined values override previous values
 */
export function getEffectiveFontConfig(
  sectionId: string,
  fieldKey: string | null,
  type: "header" | "content" | "field",
  styleConfig: StyleConfig
): FontConfig {
  console.log(`getEffectiveFontConfig: calculating for ${sectionId}.${type}.${fieldKey || 'null'}`);
  
  // Step 1: Start with defaults
  let effective: FontConfig = { ...defaultFont };
  console.log('Step 1 - defaults:', effective);

  // Step 2: Apply global base font (if exists)
  if (styleConfig.font) {
    effective = mergeFont(effective, styleConfig.font);
    console.log('Step 2 - global font:', effective);
  }

  // Step 3: Apply global fontSize enum mapping
  if (styleConfig.fontSize) {
    const mappedSize = mapFontSizeToPixels(styleConfig.fontSize);
    effective = mergeFont(effective, { size: mappedSize });
    console.log('Step 3 - global fontSize mapping:', effective);
  }

  // Step 4: Apply allHeaders (for header types only)
  if (type === "header" && styleConfig.sections?.allHeaders?.header?.font) {
    effective = mergeFont(effective, styleConfig.sections.allHeaders.header.font);
    console.log('Step 4 - allHeaders:', effective);
  }

  // Step 5: Apply global name (for name field only)
  if (sectionId === "profil" && fieldKey === "name" && styleConfig.sections?.name?.font) {
    effective = mergeFont(effective, styleConfig.sections.name.font);
    console.log('Step 5 - global name:', effective);
  }

  // Step 6: Apply section-specific font
  const sectionConfig = styleConfig.sections?.[sectionId];
  if (sectionConfig) {
    if (type === "header" && sectionConfig.header?.font) {
      effective = mergeFont(effective, sectionConfig.header.font);
      console.log('Step 6a - section header:', effective);
    } else if (type === "content" && sectionConfig.font) {
      effective = mergeFont(effective, sectionConfig.font);
      console.log('Step 6b - section content:', effective);
    }
  }

  // Step 7: Apply field-specific font
  if (fieldKey && sectionConfig?.fields?.[fieldKey]?.font) {
    effective = mergeFont(effective, sectionConfig.fields[fieldKey].font);
    console.log('Step 7 - field specific:', effective);
  }

  // Step 8: Apply color inheritance from styleConfig.colors
  if (!effective.color || effective.color === defaultFont.color) {
    if (type === "header") {
      effective.color = styleConfig.colors?.primary || styleConfig.primaryColor || defaultFont.color;
    } else {
      effective.color = styleConfig.colors?.text || styleConfig.textColor || defaultFont.color;
    }
    console.log('Step 8 - color inheritance:', effective);
  }

  console.log(`getEffectiveFontConfig: final result for ${sectionId}.${type}.${fieldKey || 'null'}:`, effective);
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
  if (sectionId === "allHeaders" && type === "header") {
    return styleConfig.sections?.allHeaders?.header?.font;
  }
  
  if (sectionId === "name") {
    return styleConfig.sections?.name?.font;
  }

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