// src/modules/cv-designer/services/mapLebenslaufToSections.ts
export type SimpleSection = { title: string; content: string };

export function buildSectionsFromLebenslauf(lebenslauf: any): SimpleSection[] {
  if (!lebenslauf || typeof lebenslauf !== "object") return [];
  const out: SimpleSection[] = [];

  // ── Kontakt (aus personalData wie in deiner Preview)
  const pd = lebenslauf.personalData || {};
  const name = [pd.vorname, pd.nachname].filter(Boolean).join(" ");
  const telefon =
    [pd.telefonVorwahl, pd.telefon].filter(Boolean).join(" ").trim() ||
    pd.telefon ||
    "";
  const adresse = pd.adresse || [pd.strasse, pd.hausnummer].filter(Boolean).join(" ");
  const cityLine = [pd.plz, pd.ort].filter(Boolean).join(" ");
  const geburt = pd.geburtsdatum;

  const kontaktLines = [
    name && `• ${name}`,
    pd.email && `• ${pd.email}`,
    telefon && `• ${telefon}`,
    (adresse || cityLine) && `• ${[adresse, cityLine].filter(Boolean).join(", ")}`,
    !adresse && cityLine && `• ${cityLine}`,
    geburt && `• Geburtsdatum: ${geburt}`,
  ].filter(Boolean) as string[];

  if (kontaktLines.length) out.push({ title: "Kontakt", content: kontaktLines.join("\n") });

  // ── Erfahrung (gemäß Experience-Interface in LebenslaufContext.tsx)
  const expList: any[] = Array.isArray(lebenslauf.berufserfahrung) ? lebenslauf.berufserfahrung : [];
  if (expList.length) {
    const bullets = expList
      .map((it) => {
        const role = firstNonEmpty([arrHead(it.position), it.position, it.role, it.titel, it.title]);
        const company = firstNonEmpty([arrHead(it.companies), it.company, it.firma, it.employer]);
        const range = formatRange(it.startMonth, it.startYear, it.endMonth, it.endYear, it.isCurrent);
        const city = firstNonEmpty([it.city, it.ort, it.location]);
        const tasks = Array.isArray(it.aufgabenbereiche) ? it.aufgabenbereiche.filter(Boolean) : [];
        const head = [role, company].filter(Boolean).join(" · ");
        const tail = [range, city].filter(Boolean).join(" · ");
        const base = [head, tail].filter(Boolean).join(" — ");
        const details = tasks.length ? `: ${tasks.join("; ")}` : "";
        return base ? `• ${base}${details}` : "";
      })
      .filter(Boolean);

    if (bullets.length) out.push({ title: "Erfahrung", content: bullets.join("\n") });
  }

  // ── Ausbildung (gemäß Education-Interface)
  const eduList: any[] = Array.isArray(lebenslauf.ausbildung) ? lebenslauf.ausbildung : [];
  if (eduList.length) {
    const bullets = eduList
      .map((it) => {
        const inst = firstNonEmpty([arrHead(it.institution), it.institution, it.uni, it.school]);
        const art = firstNonEmpty([arrHead(it.ausbildungsart), it.ausbildungsart, it.studyType]);
        const degree = firstNonEmpty([arrHead(it.abschluss), it.abschluss, it.degree, it.title]);
        const range = formatRange(it.startMonth, it.startYear, it.endMonth, it.endYear, it.isCurrent);
        const city = firstNonEmpty([it.city, it.ort]);
        const head = [degree || art, inst].filter(Boolean).join(" · ");
        const tail = [range, city].filter(Boolean).join(" · ");
        return (head || tail) ? `• ${[head, tail].filter(Boolean).join(" — ")}` : "";
      })
      .filter(Boolean);

    if (bullets.length) out.push({ title: "Ausbildung", content: bullets.join("\n") });
  }

  return out;
}

/**
 * Heuristisches Seiten-Splitting an Zeilenumbrüchen.
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
    if (lineCost > remaining && bucket.length) {
      chunks.push(bucket); bucket = []; remaining = available - titleCost;
    }
    bucket.push(ln);
    remaining -= lineCost;
  }
  if (bucket.length) chunks.push(bucket);
  if (chunks.length <= 1) return [section];
  return chunks.map((chunk) => ({ title: section.title, content: chunk.join("\n") }));
}

/* ── utils ─────────────────────────────────────────────────────────────── */
function arrHead(v: any): string | undefined {
  return Array.isArray(v) ? v.find((x) => !!x)?.toString() : undefined;
}
function firstNonEmpty(arr: any[]): string {
  for (const v of arr) {
    const s = Array.isArray(v) ? v.find((x) => !!x)?.toString() : v?.toString();
    if (s && s.trim()) return s.trim();
  }
  return "";
}
function safeYear(y: any) { const s = String(y ?? "").trim(); return s && /^\d{4}$/.test(s) ? s : undefined; }
function safeMonth(m: any) { const s = String(m ?? "").trim(); return s && /^\d{1,2}$/.test(s) ? s.padStart(2, "0") : undefined; }
function formatRange(sM: any, sY: any, eM: any, eY: any, current?: boolean) {
  const start = [safeMonth(sM), safeYear(sY)].filter(Boolean).join("/");
  const end = current ? "heute" : [safeMonth(eM), safeYear(eY)].filter(Boolean).join("/");
  if (!start && !end) return "";
  return `${start || "?"} – ${end || "?"}`;
}
