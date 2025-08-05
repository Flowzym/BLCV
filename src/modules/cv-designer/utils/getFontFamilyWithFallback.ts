// 📄 src/modules/cv-designer/utils/getFontFamilyWithFallback.ts

/**
 * Liefert einen robusten font-family String mit Fallbacks.
 * Deckt Systemfonts wie Times New Roman, Tahoma, Segoe UI, Verdana, Trebuchet MS, Georgia, Helvetica ab.
 * Alle Multi-Word Fonts werden korrekt in Quotes gesetzt.
 */
export function getFontFamilyWithFallback(font?: string): string {
  if (!font) {
    return `"Inter", Arial, sans-serif`;
  }

  switch (font) {
    case "Times New Roman":
      return `"Times New Roman", Times, serif`;

    case "Georgia":
      return `Georgia, Times, serif`;

    case "Verdana":
      return `Verdana, Geneva, sans-serif`;

    case "Tahoma":
      return `Tahoma, Geneva, sans-serif`;

    case "Trebuchet MS":
      return `"Trebuchet MS", Helvetica, sans-serif`;

    case "Segoe UI":
      return `"Segoe UI", Arial, sans-serif`;

    case "Helvetica":
      return `Helvetica, Arial, sans-serif`;

    // Bekannte Google/Webfonts – bleiben so, aber mit Fallback
    case "Inter":
      return `"Inter", Arial, sans-serif`;

    case "Roboto":
      return `"Roboto", Arial, sans-serif`;

    case "Open Sans":
      return `"Open Sans", Arial, sans-serif`;

    case "Lato":
      return `"Lato", Arial, sans-serif`;

    case "Montserrat":
      return `"Montserrat", Arial, sans-serif`;

    case "Source Sans Pro":
      return `"Source Sans Pro", Arial, sans-serif`;

    case "Merriweather":
      return `"Merriweather", Georgia, serif`;

    case "Playfair Display":
      return `"Playfair Display", Georgia, serif`;

    case "Lora":
      return `"Lora", Georgia, serif`;

    case "Crimson Text":
      return `"Crimson Text", Georgia, serif`;

    case "Nunito":
      return `"Nunito", Arial, sans-serif`;

    default:
      // Generischer Fallback: Quote wenn nötig
      return font.includes(" ")
        ? `"${font}", Arial, sans-serif`
        : `${font}, Arial, sans-serif`;
  }
}
