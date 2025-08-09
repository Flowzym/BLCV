import type { GroupKey, PartKey } from "../store/designerStore";

/* ---------------- helpers ---------------- */

const isStr = (v: any) => typeof v === "string" && v.trim().length > 0;
const isArr = (v: any) => Array.isArray(v) && v.length > 0;
const j = (v: any, sep = " "): string => {
  if (v == null) return "";
  if (Array.isArray(v)) return v.filter(Boolean).join(sep);
  return String(v);
};
const nn = (...vals: any[]) =>
  vals
    .map((x) => (x == null ? "" : String(x).trim()))
    .filter((x) => x.length > 0)
    .join(" · ");

function pick<T = any>(obj: any, keys: string[], fallback?: T): T | undefined {
  if (!obj) return fallback;
  for (const k of keys) {
    const v = obj[k];
    if (v !== undefined && v !== null && (isStr(v) || typeof v === "number" || isArr(v) || typeof v === "object"))
      return v as T;
  }
  return fallback;
}

function parseDateToken(v: any): { y?: number; m?: number; raw?: string } {
  if (v == null) return {};
  if (typeof v === "number") return { y: v };
  const s = String(v).trim().toLowerCase();
  if (!s) return {};
  if (s === "heute" || s === "present" || s === "now") return { raw: "heute" };

  // 2020-03 | 03/2020 | 2020
  const m1 = s.match(/^(\d{4})[-/\.](\d{1,2})$/);
  if (m1) {
    const y = parseInt(m1[1], 10);
    const m = Math.max(1, Math.min(12, parseInt(m1[2], 10)));
    return { y, m };
  }
  const m2 = s.match(/^(\d{1,2})[-/\.](\d{4})$/);
  if (m2) {
    const y = parseInt(m2[2], 10);
    const m = Math.max(1, Math.min(12, parseInt(m2[1], 10)));
    return { y, m };
  }
  const m3 = s.match(/^(\d{4})$/);
  if (m3) return { y: parseInt(m3[1], 10) };
  return { raw: s };
}

function fmtMonthYear(d?: { y?: number; m?: number; raw?: string }): string {
  if (!d) return "";
  if (d.raw) return d.raw;
  if (d.y && d.m) return `${String(d.m).padStart(2, "0")}.${d.y}`;
  if (d.y) return `${d.y}`;
  return "";
}

function dateRangeFrom(item: any): string {
  const startRaw =
    pick(item, ["startDate", "start", "from", "von", "beginn"]) ??
    (pick(item, ["startYear"]) && `${pick(item, ["startYear"])}`) ??
    undefined;
  const endRaw =
    pick(item, ["endDate", "end", "to", "bis"]) ??
    (pick(item, ["endYear"]) && `${pick(item, ["endYear"])}`) ??
    undefined;

  const start =
    startRaw ??
    (pick(item, ["startMonth"]) || pick(item, ["fromMonth"])) && // combine month+year if split
      `${pick(item, ["startYear", "fromYear"], "")}-${String(pick(item, ["startMonth", "fromMonth"], 1)).toString().padStart(2, "0")}`;

  const end =
    endRaw ??
    (pick(item, ["endMonth"]) || pick(item, ["toMonth"])) &&
      `${pick(item, ["endYear", "toYear"], "")}-${String(pick(item, ["endMonth", "toMonth"], 1)).toString().padStart(2, "0")}`;

  const s = parseDateToken(start);
  const e = parseDateToken(end);

  const left = fmtMonthYear(s);
  let right = fmtMonthYear(e);
  if (!right && (endRaw === undefined || end === undefined)) right = "heute";

  return nn(left, "-", right).replace(/\s*-\s*$/, ""); // falls kein right
}

function bulletsFrom(item: any): string {
  const arr =
    (pick<string[]>(item, ["aufgabenbereiche", "tasks", "responsibilities", "bulletPoints"]) as any[]) || [];
  if (Array.isArray(arr) && arr.length > 0) {
    return arr.map((t: any) => `• ${String(t)}`).join("\n");
  }
  const txt = pick(item, ["beschreibung", "description", "summary", "details"], "");
  return j(txt);
}

function firstNonEmpty(obj: any, keys: string[]): string {
  const v = pick(obj, keys, "");
  return j(v).trim();
}

/* ---------------- public API ---------------- */

export interface MappedSection {
  group: GroupKey;
  sourceKey: string; // z. B. "experience:<id>"
  title: string;     // Box-Überschrift
  parts: Array<{ key: PartKey; text: string }>;
}

export function mapLebenslaufToSectionParts(lebenslauf: any): MappedSection[] {
  const out: MappedSection[] = [];

  /* ---- Kontakt / Profil ---- */
  const pd = lebenslauf?.personalData ?? lebenslauf?.personaldaten ?? {};
  const firstName = firstNonEmpty(pd, ["firstName", "vorname"]);
  const lastName = firstNonEmpty(pd, ["lastName", "nachname"]);
  const profession = firstNonEmpty(pd, ["profession", "beruf", "position"]);
  const email = firstNonEmpty(pd, ["email", "mail"]);
  const phone = firstNonEmpty(pd, ["phone", "telefon", "tel"]);
  const address = firstNonEmpty(pd, ["address", "adresse", "ort", "location"]);

  const contactLines = [nn(firstName, lastName), profession, nn(email, phone), address]
    .filter(Boolean)
    .join("\n");

  out.push({
    group: "kontakt",
    sourceKey: "contact:main",
    title: "Kontakt",
    parts: [
      { key: "titel", text: "Kontakt" },
      { key: "kontakt", text: contactLines },
    ],
  });

  /* ---- Berufserfahrung ---- */
  const erf =
    (Array.isArray(lebenslauf?.berufserfahrung) && lebenslauf.berufserfahrung) ||
    (Array.isArray(lebenslauf?.workExperience) && lebenslauf.workExperience) ||
    (Array.isArray(lebenslauf?.experience) && lebenslauf.experience) ||
    [];

  for (const item of erf) {
    const id = firstNonEmpty(item, ["id"]) || Math.random().toString(36).slice(2, 8);
    const zeitraum = dateRangeFrom(item);
    const unternehmen = firstNonEmpty(item, ["companies", "company", "unternehmen", "firma", "institution"]);
    const position = firstNonEmpty(item, ["position", "rolle", "title"]);
    const taetigkeiten = bulletsFrom(item);

    out.push({
      group: "erfahrung",
      sourceKey: `experience:${id}`,
      title: "Berufserfahrung",
      parts: [
        { key: "titel", text: "Berufserfahrung" },
        { key: "zeitraum", text: zeitraum },
        { key: "unternehmen", text: unternehmen },
        { key: "position", text: position },
        { key: "taetigkeiten", text: taetigkeiten },
      ],
    });
  }

  /* ---- Ausbildung ---- */
  const edu =
    (Array.isArray(lebenslauf?.ausbildung) && lebenslauf.ausbildung) ||
    (Array.isArray(lebenslauf?.education) && lebenslauf.education) ||
    [];

  for (const item of edu) {
    const id = firstNonEmpty(item, ["id"]) || Math.random().toString(36).slice(2, 8);
    const zeitraum = dateRangeFrom(item);
    const institution = firstNonEmpty(item, ["institution", "school", "schule", "hochschule", "uni"]);
    const abschluss = firstNonEmpty(item, ["degree", "abschluss", "title"]);
    out.push({
      group: "ausbildung",
      sourceKey: `education:${id}`,
      title: "Ausbildung",
      parts: [
        { key: "titel", text: "Ausbildung" },
        { key: "zeitraum", text: zeitraum },
        { key: "unternehmen", text: institution }, // Template erwartet "unternehmen"-Feldposition
        { key: "abschluss", text: abschluss },
      ],
    });
  }

  /* ---- Skills (optional, falls du später Parts brauchst) ----
  const skills =
    (Array.isArray(lebenslauf?.skills) && lebenslauf.skills) ||
    (Array.isArray(lebenslauf?.faehigkeiten) && lebenslauf.faehigkeiten) ||
    [];
  if (skills.length) {
    out.push({
      group: "kenntnisse",
      sourceKey: "skills:main",
      title: "Fähigkeiten",
      parts: [
        { key: "titel", text: "Fähigkeiten" },
        { key: "skills", text: Array.isArray(skills) ? skills.map((s:any)=> (s?.name ?? s)).join(", ") : j(skills) },
      ],
    });
  }
  ------------------------------------------------------------ */

  return out;
}
