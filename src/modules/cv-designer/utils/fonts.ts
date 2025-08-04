// 📄 src/modules/cv-designer/utils/fonts.ts

/**
 * Gibt eine sichere font-family Definition zurück – inkl. Fallbacks.
 * - Wenn leer → Standardstack ("Inter", "Roboto", Arial, Helvetica, sans-serif)
 * - Systemfonts → nur sich selbst + generische Familie
 * - Webfonts → + Fallback-Kette
 */
export function getFontFamilyWithFallback(fontFamily?: string): string {
  if (!fontFamily || fontFamily.trim() === "") {
    return `"Inter", "Roboto", Arial, Helvetica, sans-serif`;
  }

  // Bekannte Systemfonts mit festen Fallbacks
  const systemFonts: Record<string, string> = {
    "Times New Roman": '"Times New Roman", serif',
    Verdana: "Verdana, sans-serif",
    Tahoma: "Tahoma, sans-serif",
    Arial: "Arial, sans-serif",
    Helvetica: "Helvetica, sans-serif",
    Georgia: "Georgia, serif",
    "Trebuchet MS": '"Trebuchet MS", sans-serif',
    "Segoe UI": '"Segoe UI", sans-serif',
    Courier: "Courier, monospace",
    "Courier New": '"Courier New", monospace',
  };

  if (systemFonts[fontFamily]) {
    return systemFonts[fontFamily];
  }

  // Für Webfonts: Name ggf. in Anführungszeichen + Fallbacks
  const needsQuotes =
    /\s/.test(fontFamily) && !/^["'].*["']$/.test(fontFamily);
  const safeFont = needsQuotes ? `"${fontFamily}"` : fontFamily;

  return `${safeFont}, "Inter", "Roboto", Arial, Helvetica, sans-serif`;
}
