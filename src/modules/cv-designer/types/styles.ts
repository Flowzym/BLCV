/**
 * CV-Designer Module - Style Types
 * Phase 1: Core type definitions for styling and theming
 */

export interface FontConfig {
  family: string;
  size: number;
  weight: number | "normal" | "bold";  // Gewicht nur für Stärke
  style?: "normal" | "italic";         // 🆕 Kursiv-Support
  lineHeight: number;
  letterSpacing?: number;
}

export interface ColorConfig {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
  textSecondary: string;
  background: string;
  border: string;
}

export interface SpacingConfig {
  xs: number;
  sm: number;
  md: number;
  lg: number;
  xl: number;
}

export interface BorderConfig {
  width: number;
  style: "solid" | "dashed" | "dotted" | "none";
  radius: number;
}

export interface LayoutConfig {
  pageWidth: number;
  pageHeight: number;
  margins: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
  columns: number;
  columnGap: number;
}

export interface StyleConfig {
  id: string;
  name: string;
  fonts: {
    heading: FontConfig;
    body: FontConfig;
    caption: FontConfig;
  };
  colors: ColorConfig;
  spacing: SpacingConfig;
  borders: BorderConfig;
  layout: LayoutConfig;
  customProperties?: Record<string, string | number>;
}

export interface ElementStyleOverride {
  elementId: string;
  styles: Record<string, string | number>;
}

export interface SectionStyleOverride {
  sectionId: string;
  font?: FontConfig; // Allgemeiner Font für den Sektionsinhalt
  header?: { // Spezifischer Font für Sektionsüberschriften
    font?: FontConfig;
  };
  styles: Record<string, string | number>;
  elementOverrides?: ElementStyleOverride[];
}
