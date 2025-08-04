/**
 * CV-Designer - Font Utils
 * Provides consistent font fallback handling across Preview, DOCX, and PDF
 */

/**
 * Returns a safe font-family string with fallbacks.
 * Ensures that multi-word fonts like "Times New Roman" are quoted correctly.
 */
export function getFontFamilyWithFallback(fontFamily?: string): string {
  const FALLBACKS =
    '"Inter", "Roboto", Arial, Helvetica, Georgia, Verdana, Tahoma, "Times New Roman", "Courier New", sans-serif';

  if (!fontFamily || fontFamily.trim() === "") {
    return FALLBACKS;
  }

  // ensure quotes for multi-word names
  const needsQuotes = /\s/.test(fontFamily) && !/^["'].*["']$/.test(fontFamily);
  const safeFont = needsQuotes ? `"${fontFamily}"` : fontFamily;

  return `${safeFont}, ${FALLBACKS}`;
}
