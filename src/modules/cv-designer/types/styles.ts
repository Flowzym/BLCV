/**
 * CV-Designer Module - Style Types
 * Core type definitions for styling and theming
 */

export interface FontConfig {
  /** Primäre Schriftfamilie (z. B. "Inter", "Georgia") */
  family: string;

  /** Schriftgröße in px */
  size: number;

  /** Gewicht – kann Zahl oder Keyword sein */
  weight?: number | "normal" | "bold" | "lighter" | "bolder";

  /** Stil – normal oder italic */
  style?: "normal" | "italic";

  /** Zeilenhöhe (z. B. 1.4, 1.6) */
  lineHeight?: number;

  /** Optionaler Buchstabenabstand in px */
  letterSpacing?: number;

  /** Schriftfarbe (Hex oder CSS-Farbwert) */
  color?: string;
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

  /** Beliebige Custom-Eigenschaften */
  customProperties?: Record<string, string | number>;

  /**
   * 🆕 Section-Level Overrides
   * z. B. andere Schriftarten oder Farben je Abschnitt
   */
  sections?: {
    [sectionKey: string]: SectionStyleOverride;
  };
}

export interface ElementStyleOverride {
  elementId: string;
  styles: Record<string, string | number>;
}

export interface SectionStyleOverride {
  sectionId: string;

  /** Allgemeiner Font für Sektionsinhalt */
  font?: FontConfig;

  /** Font für Überschrift */
  header?: {
    font?: FontConfig;
  };

  /** Zusätzliche Styles */
  styles?: Record<string, string | number>;

  /** Elementweise Overrides */
  elementOverrides?: ElementStyleOverride[];

  /** Feldweise Overrides */
  fields?: {
    [fieldKey: string]: {
      font?: FontConfig;
      styles?: Record<string, string | number>;
    };
  };
}
