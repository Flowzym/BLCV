// Robust Mapping vom Lebenslauf-Generator → CV-Designer Sections/Parts.
// Unterstützt Arrays (companies[], position[], institution[], abschluss[])
// sowie Monat/Jahr-Felder (startMonth/Year, endMonth/Year, isCurrent).

import type { GroupKey, PartKey } from "../store/designerStore";

type AnyObj = Record<string, any>;

export type MappedSection = {
  group: GroupKey;
  sourceKey: string;          // stabil: z.B. "exp:<id>:<startYear>:<endYear>"
  title?: string;
  parts: Array<{ key: PartKey; text?: string }>;
};

function pickString(v: any): string {
  if (v == null) return "";
  if (Array.isArray(v)) {
    const first = v.find((s) => typeof s === "string" && s.trim());
    return typeof first === "string" ? first.trim() : "";
  }
  if (typeof v === "string") return v.trim();
  return String(v ?? "").trim();
}

function norm(v: any) {
  if (v == null) return "";
  if (Array.isArray(v)) {
    return v.map(item => String(item ?? "").trim()).filter(Boolean).join(", ");
  }
  return String(v ?? "").trim().replace(/\s+/g, " ");
}

function bullets(v: any) {
  const arr = Array.isArray(v) ? v : [v];
  const items = arr.map(pickString).filter(Boolean);
  return items.length ? items.map((s) => `• ${s}`).join("\n") : "";
}

function spanFromMY(
  sm?: string | null,
  sy?: string | null,
  em?: string | null,
  ey?: string | null,
  cur?: boolean
) {
  const fmt = (m?: string | null, y?: string | null) => {
    const mm = (m ?? "").toString().replace(/^null$/, "").padStart(2, "0").replace(/^0{2}$/, "");
    const yy = (y ?? "").toString().replace(/^null$/, "");
    if (!yy || yy === "null") return "";
    return mm ? `${mm}/${yy}` : yy;
  };
  const from = fmt(sm, sy);
  const to = cur ? "heute" : fmt(em, ey);
  if (from && to) return `${from} – ${to}`;
  return from || to || "";
}

function spanFallback(o: AnyObj) {
  const s = pickString(o.start ?? o.von);
  const e = pickString(o.end ?? o.bis);
  if (s && e) return `${s} – ${e}`;
  return s || e || "";
}
function stableKey(prefix: string, o: AnyObj, idx: number) {
  const id = pickString(o.id) || pickString(o.uuid) || `auto-${idx}`;
  const sy = pickString(o.startYear);
  const ey = pickString(o.endYear);
  return `${prefix}:${id}:${sy}:${ey}`;
}

export function mapLebenslaufToSectionParts(ll: AnyObj): MappedSection[] {
  const out: MappedSection[] = [];

  // ---- Kontakt / rechte Spalte
  const pd = ll?.personalData ?? ll?.person ?? {};
  if (pd && Object.keys(pd).length) {
    const fullName =
      [norm(pd.titel), norm(pd.vorname), norm(pd.nachname)]
        .filter(Boolean)
        .join(" ")
        .trim() || norm(pd.name);
    const phone =
      [norm(pd.telefonVorwahl), norm(pd.telefon)]
        .filter(Boolean)
        .join(" ")
        .trim() || norm(pd.phone);
    const website =
      Array.isArray(pd.socialMedia)
        ? pd.socialMedia.map(norm).filter(Boolean).join(", ")
        : norm(pd.website);

    const contact = [
      fullName,
      norm(pd.email),
      phone,
      norm(pd.city ?? pd.ort),
      norm(pd.street ?? pd.adresse),
      website,
      norm(pd.linkedin),
      norm(pd.github),
    ]
      .filter(Boolean)
      .join(" · ");

    if (contact) {
      out.push({
        group: "kontakt",
        sourceKey: "contact:main",
        title: "Kontakt",
        parts: [{ key: "kontakt", text: contact }],
      });
    }

    // Add ProfileInput aggregated data as separate sections
    if (pd.summary?.trim()) {
      out.push({
        group: "profil",
        sourceKey: "profile:summary",
        title: "Profil",
        parts: [{ key: "titel", text: pd.summary }],
      });
    }

    if (pd.skillsSummary?.trim()) {
      out.push({
        group: "kenntnisse",
        sourceKey: "profile:skills",
        title: "Fachliche Kompetenzen",
        parts: [{ key: "skills", text: pd.skillsSummary }],
      });
    }

    if (pd.softSkillsSummary?.trim()) {
      out.push({
        group: "softskills",
        sourceKey: "profile:softskills",
        title: "Persönliche Kompetenzen",
        parts: [{ key: "skills", text: pd.softSkillsSummary }],
      });
    }

    if (pd.taetigkeitenSummary?.trim()) {
      out.push({
        group: "erfahrung",
        sourceKey: "profile:taetigkeiten",
        title: "Tätigkeitsbereiche",
        parts: [{ key: "taetigkeiten", text: pd.taetigkeitenSummary }],
      });
    }
  }

  // ---- Erfahrung / linke Spalte
  const erfArr: AnyObj[] =
    Array.isArray(ll?.berufserfahrung) ? ll.berufserfahrung
    : Array.isArray(ll?.workExperience) ? ll.workExperience
    : Array.isArray(ll?.experience) ? ll.experience
    : [];

  erfArr.forEach((e, i) => {
    const company  = norm(e.company ?? e.unternehmen ?? e.companies);
    const position = norm(e.position ?? e.titel ?? e.role);
    const city     = norm(e.city ?? e.ort);
    const spanMY   = spanFromMY(e.startMonth, e.startYear, e.endMonth, e.endYear, e.isCurrent);
    const spanFB   = spanMY || spanFallback(e);
    const tasks    = bullets(e.tasks ?? e.aufgabenbereiche ?? e.beschreibung);

    const title = [position, company].filter(Boolean).join(" @ ");

    const parts: Array<{ key: PartKey; text?: string }> = [
      { key: "titel",       text: title || position || company || "Berufserfahrung" },
      { key: "zeitraum",    text: spanFB },
      { key: "unternehmen", text: company },
    ];
    if (position) parts.push({ key: "position", text: position });
    if (city)     parts.push({ key: "ort",      text: city });
    if (tasks)    parts.push({ key: "taetigkeiten", text: tasks });

    out.push({
      group: "erfahrung",
      sourceKey: stableKey("exp", e, i),
      title,
      parts,
    });
  });

  // ---- Ausbildung / linke Spalte
  const eduArr: AnyObj[] =
    Array.isArray(ll?.ausbildung) ? ll.ausbildung
    : Array.isArray(ll?.education) ? ll.education
    : [];

  eduArr.forEach((e, i) => {
    const institution = norm(e.institution ?? e.school ?? e.schule);
    const degree      = norm(e.degree ?? e.abschluss);
    const subject     = norm(e.subject ?? e.titel ?? e.ausbildungsart);
    const spanMY      = spanFromMY(e.startMonth, e.startYear, e.endMonth, e.endYear, e.isCurrent);
    const spanFB      = spanMY || spanFallback(e);

    const title = [degree || subject, institution].filter(Boolean).join(" · ");
    const parts: Array<{ key: PartKey; text?: string }> = [
      { key: "titel",       text: title || subject || degree || "Ausbildung" },
      { key: "zeitraum",    text: spanFB },
      { key: "unternehmen", text: institution }, // Designer-PartKey heißt "unternehmen"
    ];
    if (degree) parts.push({ key: "abschluss", text: degree });

    out.push({
      group: "ausbildung",
      sourceKey: stableKey("edu", e, i),
      title,
      parts,
    });
  });

  return out;
}
