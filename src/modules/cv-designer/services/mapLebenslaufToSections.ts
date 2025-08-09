// src/modules/cv-designer/services/mapLebenslaufToSections.ts

export type SimpleSection = { title: string; content: string };

/**
 * Liefert alle sinnvollen Abschnitte aus einem Lebenslauf-Objekt:
 * Profil/Zusammenfassung, Kontakt, Skills, Erfahrung, Ausbildung, Projekte,
 * Sprachen, Zertifikate (heuristisch; robust gg. verschiedene Feldnamen).
 */
export function buildSectionsFromLebenslauf(lebenslauf: any): SimpleSection[] {
  if (!lebenslauf || typeof lebenslauf !== "object") return [];

  const out: SimpleSection[] = [];

  const summary = pickString(
    lebenslauf,
    ["summary", "about", "profil", "ueber_mich", "über_mich", "zusammenfassung", "objective"]
  );
  if (summary) {
    out.push({ title: "Profil", content: clean(summary) });
  }

  const contact = buildContact(lebenslauf);
  if (contact) out.push(contact);

  const skills = buildSkills(lebenslauf);
  if (skills) out.push(skills);

  const exp = buildExperience(lebenslauf);
  if (exp) out.push(exp);

  const edu = buildEducation(lebenslauf);
  if (edu) out.push(edu);

  const projects = buildProjects(lebenslauf);
  if (projects) out.push(projects);

  const languages = buildLanguages(lebenslauf);
  if (languages) out.push(languages);

  const certs = buildCertificates(lebenslauf);
  if (certs) out.push(certs);

  return out.filter((s) => s.content.trim().length > 0);
}

/** Alte API bleibt erhalten (für Backcompat): eine einzige Erfahrung-Section. */
export function buildSingleErfahrungSection(lebenslauf: any): SimpleSection[] {
  const exp = buildExperience(lebenslauf);
  return exp ? [exp] : [];
}

/**
 * Splittet eine Section heuristisch auf A4-Seiten, basierend auf FontSize, LineHeight und Rändern.
 * Bricht nur an Zeilenumbrüchen.
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
    const need = lineCost;
    if (need > remaining && bucket.length) {
      chunks.push(bucket);
      bucket = [];
      remaining = available - titleCost; // neue Seite
    }
    bucket.push(ln);
    remaining -= lineCost;
  }
  if (bucket.length) chunks.push(bucket);

  if (chunks.length <= 1) return [section];

  return chunks.map((chunk) => ({
    title: section.title,
    content: chunk.join("\n"),
  }));
}

/* ───────────────────────── helpers ───────────────────────── */

function buildContact(cv: any): SimpleSection | null {
  const p = cv.person || cv.kontakt || cv.contact || cv.profile || {};
  const fullName =
    p.name || [p.vorname || p.firstName, p.nachname || p.lastName].filter(Boolean).join(" ") || cv.name || "";
  const email = p.email || cv.email || "";
  const phone = p.phone || p.telefon || p.tel || cv.phone || "";
  const city = p.ort || p.stadt || p.city || "";
  const web = p.web || p.website || p.homepage || "";
  const linkedin = p.linkedin || p.linkedIn || "";
  const github = p.github || "";

  const lines = [
    fullName && `• ${fullName}`,
    email && `• ${email}`,
    phone && `• ${phone}`,
    city && `• ${city}`,
    web && `• ${web}`,
    linkedin && `• ${linkedin}`,
    github && `• ${github}`,
  ].filter(Boolean) as string[];

  if (!lines.length) return null;
  return { title: "Kontakt", content: lines.join("\n") };
}

function buildSkills(cv: any): SimpleSection | null {
  const pools = collectArrays(cv, [
    "skills",
    "faehigkeiten",
    "fähigkeiten",
    "kompetenzen",
    "kenntnisse",
    "tech",
    "technologien",
    "tools",
  ]);
  if (!pools.length) return null;

  const flat = pools.flatMap((v) => (typeof v === "string" ? v.split(/[;,]/).map(clean) : v.map(clean))).filter(Boolean);
  if (!flat.length) return null;

  // Gruppierung rudimentär (optional)
  const content = "• " + flat.join("\n• ");
  return { title: "Fähigkeiten", content };
}

function buildExperience(cv: any): SimpleSection | null {
  const pools = collectArraysFromCandidates(cv, [
    "erfahrungen",
    "berufserfahrung",
    "experience",
    "work",
    "jobs",
    "positionen",
  ]);
  // Fallback: sections.experience.items
  addSectionItems(cv, pools, ["erfahrung", "berufserfahrung", "experience", "work"]);

  if (!pools.length) return null;

  const bullets = pools.map(formatExperienceLine).filter(Boolean);
  if (!bullets.length) return null;

  return { title: "Erfahrung", content: bullets.join("\n") };
}

function buildEducation(cv: any): SimpleSection | null {
  const pools = collectArraysFromCandidates(cv, ["education", "ausbildung", "studium"]);
  addSectionItems(cv, pools, ["ausbildung", "bildung", "education", "study", "studium"]);

  if (!pools.length) return null;

  const bullets = pools
    .map((it: any) => {
      const degree = it.degree || it.abschluss || it.titel || it.title || "";
      const school = it.school || it.uni || it.university || it.hochschule || "";
      const range = it.range || it.zeitraum || [it.start, it.end || it.ende].filter(Boolean).join(" – ");
      const city = it.city || it.ort || "";
      const line = [degree, school].filter(Boolean).join(" · ");
      const tail = [range, city].filter(Boolean).join(" · ");
      return `• ${[line, tail].filter(Boolean).join(" — ")}`;
    })
    .filter(Boolean);
  if (!bullets.length) return null;

  return { title: "Ausbildung", content: bullets.join("\n") };
}

function buildProjects(cv: any): SimpleSection | null {
  const pools = collectArraysFromCandidates(cv, ["projects", "projekte"]);
  addSectionItems(cv, pools, ["projects", "projekte"]);

  if (!pools.length) return null;

  const bullets = pools
    .map((it: any) => {
      const name = it.name || it.title || it.titel || "";
      const desc = firstNonEmpty([it.description, it.beschreibung, it.summary]);
      const tech = listToLine(it.tech || it.technologien || it.stack);
      const line = [name, tech ? `(${tech})` : ""].filter(Boolean).join(" ");
      const tail = desc ? `: ${clean(desc)}` : "";
      return `• ${line}${tail}`;
    })
    .filter(Boolean);

  if (!bullets.length) return null;
  return { title: "Projekte", content: bullets.join("\n") };
}

function buildLanguages(cv: any): SimpleSection | null {
  const pools = collectArraysFromCandidates(cv, ["languages", "sprachen"]);
  if (!pools.length) return null;

  const bullets = pools
    .map((it: any) => {
      const lang = it.name || it.sprache || it.language || it.lang || it.code || "";
      const level = it.level || it.niveau || it.proficiency || "";
      return lang ? `• ${lang}${level ? ` — ${level}` : ""}` : "";
    })
    .filter(Boolean);

  if (!bullets.length) return null;
  return { title: "Sprachen", content: bullets.join("\n") };
}

function buildCertificates(cv: any): SimpleSection | null {
  const pools = collectArraysFromCandidates(cv, ["certificates", "zertifikate", "certs"]);
  if (!pools.length) return null;

  const bullets = pools
    .map((it: any) => {
      const name = it.name || it.title || it.titel || "";
      const org = it.org || it.issuer || it.aussteller || "";
      const year = it.year || it.jahr || (it.date ? String(it.date).slice(0, 4) : "");
      const tail = [org, year].filter(Boolean).join(" · ");
      return name ? `• ${[name, tail].filter(Boolean).join(" — ")}` : "";
    })
    .filter(Boolean);

  if (!bullets.length) return null;
  return { title: "Zertifikate", content: bullets.join("\n") };
}

/* small utils */

function pickString(obj: any, keys: string[]): string | "" {
  for (const k of keys) {
    const v = (obj || {})[k];
    if (typeof v === "string" && v.trim()) return v;
  }
  return "";
}

function collectArrays(obj: any, keys: string[]): any[] {
  const out: any[] = [];
  for (const k of keys) {
    const v = (obj || {})[k];
    if (Array.isArray(v)) out.push(v);
  }
  return out.flat();
}

function collectArraysFromCandidates(cv: any, keys: string[]) {
  const arr = collectArrays(cv, keys);
  return Array.isArray(arr) ? arr : [];
}

function addSectionItems(cv: any, dest: any[], names: string[]) {
  const sections = (cv.sections || {}) as Record<string, any>;
  for (const key of Object.keys(sections)) {
    const sec = sections[key];
    const name = (sec?.title || key || "").toString().toLowerCase();
    const match = names.some((n) => name.includes(n));
    if (match && Array.isArray(sec?.items)) dest.push(...sec.items);
  }
}

function formatExperienceLine(item: any): string {
  if (!item) return "";
  const role =
    item.role || item.position || item.titel || item.title || item.job || item.bezeichnung || item.function || "";
  const company = item.company || item.firma || item.employer || item.arbeitgeber || "";
  const range =
    item.zeitraum || item.range || item.period || [item.start, item.ende || item.end].filter(Boolean).join(" – ") || "";
  const city = item.ort || item.location || "";
  const tasks = toFlatList(item.tasks || item.taetigkeiten || item.aufgaben || item.responsibilities);

  const head = [role, company].filter(Boolean).join(" · ");
  const tail = [range, city].filter(Boolean).join(" · ");
  const base = head || tail ? [head, tail].filter(Boolean).join(" — ") : stringifyShort(item);
  const details = tasks.length ? `: ${tasks.join("; ")}` : "";
  return `• ${base}${details}`;
}

function toFlatList(val: any): string[] {
  if (!val) return [];
  if (Array.isArray(val)) return val.map(clean).filter(Boolean);
  if (typeof val === "string") return [clean(val)].filter(Boolean);
  return [];
}

function listToLine(val: any): string {
  const arr = toFlatList(val);
  return arr.join(", ");
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
