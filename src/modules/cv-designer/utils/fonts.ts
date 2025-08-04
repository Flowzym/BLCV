/**
 * CV-Designer - Font Utils
 * Provides consistent font fallback handling across Preview, DOCX, and PDF
 */

/**
 * Returns a safe font-family string with fallbacks.
 * - Systemfonts: nur sich selbst + generische Familie
 * - Webfonts: mit Fallback-Kette
 */
export function getFontFamilyWithFallback(fontFamily?: string): string {
  if (!fontFamily || fontFamily.trim() === "") {
    return `"Inter", "Roboto", Arial, Helvetica, sans-serif`;
  }

  // Systemfonts → keine zusätzlichen Fallbacks davor
  const systemFonts: Record<string, string> = {
    "Times New Roman": '"Times New Roman", serif',
    Verdana: "Verdana, sans-serif",
    Tahoma: "Tahoma, sans-serif",
    Arial: "Arial, sans-serif",
    Helvetica: "Helvetica, sans-serif",
    Georgia: "Georgia, serif",
    "Trebuchet MS": '"Trebuchet MS", sans-serif',
    "Segoe UI": '"Segoe UI", sans-serif',
  };

  if (systemFonts[fontFamily]) {
    return systemFonts[fontFamily];
  }

  // Webfonts → mit generischen Fallbacks
  const needsQuotes =
    /\s/.test(fontFamily) && !/^["'].*["']$/.test(fontFamily);
  const safeFont = needsQuotes ? `"${fontFamily}"` : fontFamily;

  return `${safeFont}, "Inter", "Roboto", Arial, Helvetica, sans-serif`;
}
