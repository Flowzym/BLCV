// src/modules/cv-designer/services/mapLebenslaufToSections.ts
export type SimpleSection = { title: string; content: string };

export function buildSectionsFromLebenslauf(lebenslauf: any): SimpleSection[] {
  if (!lebenslauf || typeof lebenslauf !== "object") return [];
  const out: SimpleSection[] = [];

  // Profil/Zusammenfassung (falls vorhanden)
  const summary = pickString(lebenslauf, ["summary", "about", "profil", "ueber_mich", "über_mich", "zusammenfassung", "objective"]);
  if (summary) out.push({ title: "Profil", content: clean(summary) });

  // Kontakt aus personalData
  const contact = buildContactFromPersonalData(lebenslauf.personalData);
  if (contact) out.push(contact);

  // Erfahrung (aus berufserfahrung[])
  const exp = buildExperience(lebenslauf.berufserfahrung);
  if (exp) out.push(exp);

  // Ausbildung (aus ausbildung[])
  const edu = buildEducation(lebenslauf.ausbildung);
  if (edu) out.push(edu);

  // (Optional) Skills/Sprachen/Zertifikate, falls du Felder pflegst – Hooks hier leicht erweiterbar.

  return out.filter(s => s.content.trim().length > 0);
}

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
    const need = lineCost;
    if (need > remaining && bucket.length) {
      chunks.push(bucket);
      bucket = [];
      remaining = available - titleCost;
    }
    bucket.push(ln);
    remaining -= lineCost;
  }
  if (bucket.length) chunks.push(bucket);
  if (chunks.length <= 1) return [section];
  return chunks.map(chunk => ({ title: section.title, content: chunk.join("\n") }));
}

/* ── helpers ── */
function buildContactFromPersonalData(pd: any): SimpleSection | null {
  if (!pd) return null;
  const vor = pd.vorname || pd.firstName || "";
  const nach = pd.nachname || pd.lastName || "";
  const name = [vor, nach].filter(Boolean).join(" ");
  const email = pd.email || pd.eMail || "";
  const phone = pd.telefon || pd.phone || [pd.telefonVorwahl, pd.telefonNummer].filter(Boolean).join(" ") || "";
  const city = pd.ort || pd.city || "";
  const addr = [pd.strasse, pd.hausnummer].filter(Boolean).join(" ") || pd.adresse || "";

  const lines = [
    name && `• ${name}`,
    email && `• ${email}`,
    phone && `• ${phone}`,
    addr && `• ${addr}${city ? ", " + city : ""}`,
    !addr && city && `• ${city}`,
  ].filter(Boolean) as string[];

  return lines.length ? { title: "Kontakt", content: lines.join("\n") } : null;
}

function buildExperience(list: any[]): SimpleSection | null {
  if (!Array.isArray(list) || !list.length) return null;
  const bullets = list.map((it: any) => {
    const role = firstNonEmpty([it.position?.[0], it.position, it.role, it.titel, it.title]);
    const company = firstNonEmpty([it.companies?.[0], it.company, it.firma, it.employer]);
    const range = formatRange(it.startMonth, it.startYear, it.endMonth, it.endYear, it.isCurrent);
    const city = firstNonEmpty([it.city, it.ort, it.location]);
    const tasks = Array.isArray(it.aufgabenbereiche) ? it.aufgabenbereiche.filter(Boolean) : [];
    const head = [role, company].filter(Boolean).join(" · ");
    const tail = [range, city].filter(Boolean).join(" · ");
    const base = [head, tail].filter(Boolean).join(" — ");
    const details = tasks.length ? `: ${tasks.join("; ")}` : "";
    return base ? `• ${base}${details}` : "";
  }).filter(Boolean);
  return bullets.length ? { title: "Erfahrung", content: bullets.join("\n") } : null;
}

function buildEducation(list: any[]): SimpleSection | null {
  if (!Array.isArray(list) || !list.length) return null;
  const bullets = list.map((it: any) => {
    const inst = firstNonEmpty([it.institution?.[0], it.institution, it.uni, it.school]);
    const art = firstNonEmpty([it.ausbildungsart?.[0], it.ausbildungsart, it.studyType]);
    const degree = firstNonEmpty([it.abschluss?.[0], it.abschluss, it.degree, it.title]);
    const range = formatRange(it.startMonth, it.startYear, it.endMonth, it.endYear, it.isCurrent);
    const city = firstNonEmpty([it.city, it.ort]);
    const head = [degree || art, inst].filter(Boolean).join(" · ");
    const tail = [range, city].filter(Boolean).join(" · ");
    return (head || tail) ? `• ${[head, tail].filter(Boolean).join(" — ")}` : "";
  }).filter(Boolean);
  return bullets.length ? { title: "Ausbildung", content: bullets.join("\n") } : null;
}

function firstNonEmpty(arr: any[]): string {
  for (const v of arr) {
    const s = Array.isArray(v) ? v.find((x) => !!x)?.toString() : v?.toString();
    if (s && s.trim()) return s.trim();
  }
  return "";
}
function clean(s: string) { return (s || "").replace(/\s+/g, " ").trim(); }
function formatRange(sM: any, sY: any, eM: any, eY: any, current?: boolean) {
  const start = [safeMonth(sM), safeYear(sY)].filter(Boolean).join("/");
  const end = current ? "heute" : ([safeMonth(eM), safeYear(eY)].filter(Boolean).join("/") || "");
  if (!start && !end) return "";
  return `${start || "?"} – ${end || "?"}`;
}
function safeYear(y: any) { const s = String(y ?? "").trim(); return s && /^\d{4}$/.test(s) ? s : undefined; }
function safeMonth(m: any) { const s = String(m ?? "").trim(); return s && /^\d{1,2}$/.test(s) ? s.padStart(2, "0") : undefined; }
function pickString(obj: any, keys: string[]) { for (const k of keys) { const v = (obj || {})[k]; if (typeof v === "string" && v.trim()) return v; } return ""; }
