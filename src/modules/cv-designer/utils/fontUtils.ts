// 📄 src/modules/cv-designer/utils/fontUtils.ts

// ✅ Zentrale Font-Liste – basiert auf deinem Panel
export const FONT_FAMILIES: { value: string; label: string }[] = [
  { value: "Inter", label: "Inter" },
  { value: "Roboto", label: "Roboto" },
  { value: "Open Sans", label: "Open Sans" },
  { value: "Lato", label: "Lato" },
  { value: "Montserrat", label: "Montserrat" },
  { value: "Source Sans Pro", label: "Source Sans Pro" },
  { value: "Arial", label: "Arial" },
  { value: "Helvetica", label: "Helvetica" },
  { value: "Georgia", label: "Georgia" },
  { value: "Times New Roman", label: "Times New Roman" },
  { value: "Verdana", label: "Verdana" },
  { value: "Tahoma", label: "Tahoma" },
  { value: "Trebuchet MS", label: "Trebuchet MS" },
  { value: "Segoe UI", label: "Segoe UI" },
  { value: "system-ui", label: "System UI" },
  { value: "Courier Prime", label: "Courier Prime" },
];

// ✅ Einheitliche Fallback-Kette
const FALLBACKS =
  'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, Helvetica, sans-serif';

// ✅ Utility: FontName + Fallbacks zurückgeben
export function getFontFamilyWithFallback(fontName?: string): string {
  if (!fontName) return `"Inter", ${FALLBACKS}`;

  // sicherstellen, dass keine doppelten Fallbacks entstehen
  return `"${fontName}", ${FALLBACKS}`;
}
