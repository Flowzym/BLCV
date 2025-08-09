// src/modules/cv-designer/services/mapLebenslaufToSections.ts

export type SimpleSection = { title: string; content: string };

/**
 * Baut eine einzige "Erfahrung"-Section aus dem Lebenslauf-Objekt.
 * Heuristisch: akzeptiert verschiedene Feldnamen (erfahrungen, berufserfahrung, experience, work, jobs).
 * Formatiert Einträge als Bullet-Points.
 */
export function buildSingleErfahrungSection(lebenslauf: any): SimpleSection[] {
  if (!lebenslauf || typeof lebenslauf !== "object") return [];

  const pools: any[] = [];
  const candidates = [
    lebenslauf.erfahrungen,
    lebenslauf.berufserfahrung,
    lebenslauf.experience,
    lebenslauf.work,
    lebenslauf.jobs,
    lebenslauf.positionen,
  ].filter(Boolean);

  for (const c of candidates) {
    if (Array.isArray(c)) pools.push(...c);
  }

  // Fallback: manchmal liegen Einträge unter lebenslauf.sections?.experience?.items
  const sections = (lebenslauf.sections || {}) as Record<string, any>;
  for (const key of Object.keys(sections)) {
    const sec = sections[key];
    if (!sec) continue;
    const name = (sec.title || key || "").toString().toLowerCase();
    const isExp =
      ["erfahrung", "erfahrungen", "berufserfahrung", "experience", "work"].some((k) => name.includes(k)) ||
      key.toLowerCase().includes("exp");
    if (isExp && Array.isArray(sec.items)) pools.push(...sec.items);
  }

  if (!pools.length) return [];

  const bullets = pools.map(formatExperienceLine).filter(Boolean);
  const content = bullets.join("\n");
  return [{ title: "Erfahrung", content }];
}

function formatExperienceLine(item: any): string {
  if (!item) return "";

  const role =
    item.role || item.position || item.titel || item.title || item.job || item.bezeichnung || item.function || "";
  const company = item.company || item.firma || item.employer || item.arbeitgeber || "";
  const range =
    item.zeitraum ||
    item.range ||
    item.period ||
    [item.start, item.ende || item.end].filter(Boolean).join(" – ") ||
    "";

  const city = item.ort || item.location || "";
  const tasks = toFlatList(item.tasks || item.taetigkeiten || item.aufgaben || item.responsibilities);

  const head = [role, company].filter(Boolean).join(" · ");
  const tail = [range, city].filter(Boolean).join(" · ");

  const lineBase = head || tail ? [head, tail].filter(Boolean).join(" — ") : stringifyShort(item);
  const details = tasks.length ? `: ${tasks.join("; ")}` : "";

  return `• ${lineBase}${details}`;
}

function toFlatList(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(clean).filter(Boolean);
  if (typeof val === "string") return [clean(val)].filter(Boolean);
  return [];
}

function clean(s: string): string {
  return (s || "").replace(/\s+/g, " ").trim();
}

function stringifyShort(obj: any, max = 120): string {
  try {
    const s = JSON.stringify(obj);
    return s.length > max ? s.slice(0, max - 1) + "…" : s;
  } catch {
    return String(obj ?? "");
  }
}

/**
 * Splittet eine Section heuristisch auf A4-Seiten, basierend auf FontSize, LineHeight und Rändern.
 * - Schätzt Zeilenhöhe: fontSize * lineHeight
 * - Rechnet Titel mit ~1.6 * fontSize
 * - Bricht nur an Zeilenumbrüchen (keine Silbentrennung)
 */
export function splitSectionByPage(
  section: SimpleSection,
  fontSize: number,
  pageHeight: number,
  margins: { top: number; bottom: number },
  lineHeight = 1.4
): SimpleSection[] {
  const lines = (section.content || "").toString().split("\n");
  const available = Math.max(0, pageHeight - margins.top - margins.bottom);

  const titleCost = section.title ? Math.ceil(fontSize * 1.6) : 0;
  const lineCost = Math.max(1, Math.ceil(fontSize * lineHeight));

  const chunks: string[][] = [];
  let bucket: string[] = [];
  let remaining = Math.max(0, available - titleCost);

  for (const ln of lines) {
    const need = lineCost + (bucket.length ? 0 : 0); // einfacher Ansatz, kein Absatzabstand
    if (need > remaining && bucket.length) {
      chunks.push(bucket);
      bucket = [];
      remaining = available - titleCost; // neue Seite
    }
    // falls einzelne Zeile länger als Seite -> hart in leere Seite pressen
    bucket.push(ln);
    remaining = remaining - lineCost;
  }
  if (bucket.length) chunks.push(bucket);

  // Sections mit identischem Titel, aber content gechunked
  if (chunks.length <= 1) return [section];

  return chunks.map((chunk, i) => ({
    title: section.title,
    content: chunk.join("\n"),
  }));
}
