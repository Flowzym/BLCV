// src/modules/cv-designer/services/mapLebenslaufToSections.ts
// Erzeugt aus den Lebenslauf-Daten EINE große "Erfahrung"-Sektion
// und splittet beim Import in seitenverträgliche Blöcke.
// Splitting basiert auf Fontgröße & Seitenrändern (heuristisch).

export type LebenslaufData = {
  personalData?: Record<string, any>;
  berufserfahrung?: Array<Record<string, any>>;
  ausbildung?: Array<Record<string, any>>;
};

export type SimpleSection = { title: string; content: string };

/**
 * Baut eine einzige "Erfahrung"-Section (mit Bullets), aus allen Einträgen.
 * Falls keine Erfahrung vorliegt, gibt es ein leeres Array zurück.
 */
export function buildSingleErfahrungSection(ll: LebenslaufData): SimpleSection[] {
  const exp = Array.isArray(ll?.berufserfahrung) ? ll!.berufserfahrung! : [];
  if (!exp.length) return [];

  const lines: string[] = [];
  lines.push("Erfahrung");

  for (const e of exp) {
    const companies = (e?.companies || e?.company || e?.firma || [])
      ? arrToLine(e.companies ?? e.company ?? e.firma)
      : undefined;

    const positions = (e?.position || e?.title || [])
      ? arrToLine(e.position ?? e.title)
      : undefined;

    const range = formatRange(e?.startMonth, e?.startYear, e?.endMonth, e?.endYear);

    // Kopfzeile
    const headerParts = [positions, companies, range].filter(Boolean);
    if (headerParts.length) lines.push(headerParts.join(" – "));

    // Bullets
    const aufgaben: string[] =
      Array.isArray(e?.aufgabenbereiche) ? e!.aufgabenbereiche! :
      Array.isArray(e?.tasks) ? e!.tasks! : [];

    for (const a of aufgaben) {
      const t = String(a ?? "").trim();
      if (t) lines.push(`• ${t}`);
    }

    // Zusatz
    const extra = (e?.zusatzangaben ?? e?.notes ?? "").toString().trim();
    if (extra) lines.push(extra);

    // Abstand nach Station
    if (headerParts.length || aufgaben.length || extra) lines.push("");
  }

  const content = lines.join("\n").trim();
  if (!content) return [];
  return [{ title: "Erfahrung", content }];
}

/**
 * Splittet eine Section in mehrere, sodass jede Box in die Seite passt.
 * Heuristik: Zeilen pro Seite = floor(usableHeight / (fontSize * 1.35))
 * @returns mehrere SimpleSections (Erfahrung (1), (2), ...)
 */
export function splitSectionByPage(
  section: SimpleSection,
  fontSizePx: number,
  pageHeightPx: number,
  margins: { top: number; bottom: number }
): SimpleSection[] {
  const usable = Math.max(0, pageHeightPx - (margins.top + margins.bottom));
  const lineHeight = Math.max(1, fontSizePx * 1.35);
  const linesPerPage = Math.max(4, Math.floor(usable / lineHeight));

  const allLines = section.content.split("\n");
  const chunks: string[][] = [];
  for (let i = 0; i < allLines.length; i += linesPerPage) {
    chunks.push(allLines.slice(i, i + linesPerPage));
  }

  if (chunks.length <= 1) return [section];

  return chunks.map((chunk, idx) => ({
    title: idx === 0 ? section.title : `${section.title} (${idx + 1})`,
    content: chunk.join("\n").trim(),
  }));
}

// ===== helpers =====

function arrToLine(v: any): string | undefined {
  if (Array.isArray(v)) {
    const s = v.map(x => String(x ?? "").trim()).filter(Boolean).join(" · ");
    return s || undefined;
  }
  const s = String(v ?? "").trim();
  return s || undefined;
}

function formatRange(
  startMonth?: string | null,
  startYear?: string | null,
  endMonth?: string | null,
  endYear?: string | null
): string | undefined {
  const sY = safeYear(startYear);
  const eY = safeYear(endYear);
  const sM = safeMonth(startMonth);
  const eM = safeMonth(endMonth);

  if (!sY && !eY) return undefined;
  const start = [sM, sY].filter(Boolean).join("/");
  const end = [eM, eY].filter(Boolean).join("/") || "heute";
  if (!start && end === "heute") return undefined;
  return `${start || "?"} – ${end}`;
}

function safeYear(y: any): string | undefined {
  const s = String(y ?? "").trim();
  return s && /^\d{4}$/.test(s) ? s : undefined;
}
function safeMonth(m: any): string | undefined {
  const s = String(m ?? "").trim();
  return s && /^\d{1,2}$/.test(s) ? s.padStart(2, "0") : undefined;
}
