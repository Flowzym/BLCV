// src/modules/cv-designer/services/mapLebenslaufToSectionParts.ts
import type { GroupKey, PartKey } from "../store/designerStore";

type UnknownObj = Record<string, any>;

export type MappedSection = {
  group: GroupKey;
  sourceKey: string;        // stabiler Schlüssel, damit Updates greifen
  title?: string;
  parts: Array<{ key: PartKey; text?: string }>;
};

/** Hilfsfunktionen */
function fmtSpan(a?: string, b?: string) {
  const s = [a, b].filter(Boolean).join(" – ");
  return s || "";
}
function joinLines(lines: (string | undefined | null)[]) {
  return lines.filter(Boolean).join("\n");
}
function normString(v: any) {
  if (v == null) return "";
  return String(v);
}
/** baut einen stabilen Key pro Eintrag */
function stableKey(prefix: string, o: UnknownObj, idx: number) {
  const id =
    o.id ??
    o.uuid ??
    `${o.company || o.unternehmen || o.school || o.schule || "n"}:${o.start || o.von || "?"}:${o.end || o.bis || "?"}`;
  return `${prefix}:${id}:${idx}`;
}

/**
 * Erwartete Felder (wir lesen deutsch + englische Varianten):
 * - Erfahrung: { position|titel|role, company|unternehmen, start|von, end|bis, city|ort, tasks|taetigkeiten|beschreibung[] }
 * - Ausbildung: { degree|abschluss, school|unternehmen|schule, start|von, end|bis, subject|titel }
 * - Kontakt: ll.personalData: { name, email, phone|telefon, city|ort, street|adresse, website, linkedin, github, ... }
 */
export function mapLebenslaufToSectionParts(ll: UnknownObj): MappedSection[] {
  const out: MappedSection[] = [];

  // Kontakt (rechte Spalte)
  const pd = ll?.personalData ?? ll?.person ?? {};
  const contactLines = [
    pd.name,
    pd.email,
    pd.phone ?? pd.telefon,
    joinLines([pd.street ?? pd.adresse, pd.postalCode, pd.city ?? pd.ort].filter(Boolean)).replace(/\n+/g, " "),
    pd.website,
    pd.linkedin,
    pd.github,
  ]
    .filter(Boolean)
    .join("\n");
  if (contactLines) {
    out.push({
      group: "kontakt",
      sourceKey: "contact:main",
      title: "Kontakt",
      parts: [
        { key: "titel", text: "Kontakt" },
        { key: "kontakt", text: contactLines },
      ],
    });
  }

  // Berufserfahrung (linke Spalte)
  const expArr: UnknownObj[] =
    ll?.berufserfahrung ?? ll?.workExperience ?? ll?.experience ?? [];
  expArr.forEach((e, i) => {
    const position = e.position ?? e.titel ?? e.role;
    const company = e.unternehmen ?? e.company;
    const span = fmtSpan(normString(e.von ?? e.start), normString(e.bis ?? e.end));
    const ort = normString(e.ort ?? e.city);

    // Tätigkeiten als Aufzählung
    let tasks = e.taetigkeiten ?? e.tasks ?? e.beschreibung ?? e.description;
    if (Array.isArray(tasks)) {
      tasks = tasks.map(normString).filter(Boolean).join("\n• ");
      tasks = tasks ? `• ${tasks}` : "";
    } else {
      tasks = normString(tasks);
    }

    out.push({
      group: "erfahrung",
      sourceKey: stableKey("exp", e, i),
      title: position || company || "Erfahrung",
      parts: [
        { key: "titel",        text: normString(position || company || "") },
        { key: "zeitraum",     text: joinLines([span, ort ? `· ${ort}` : ""].filter(Boolean)) },
        { key: "unternehmen",  text: normString(company) },
        { key: "position",     text: normString(position) },
        { key: "taetigkeiten", text: normString(tasks) },
      ],
    });
  });

  // Ausbildung (linke Spalte)
  const eduArr: UnknownObj[] = ll?.ausbildung ?? ll?.education ?? [];
  eduArr.forEach((e, i) => {
    const degree = e.abschluss ?? e.degree;
    const school = e.unternehmen ?? e.school ?? e.schule;
    const title  = e.titel ?? e.subject ?? degree ?? school ?? "Ausbildung";
    const span   = fmtSpan(normString(e.von ?? e.start), normString(e.bis ?? e.end));

    out.push({
      group: "ausbildung",
      sourceKey: stableKey("edu", e, i),
      title,
      parts: [
        { key: "titel",       text: normString(title) },
        { key: "zeitraum",    text: span },
        { key: "unternehmen", text: normString(school) }, // WICHTIG: key heißt "unternehmen"
        { key: "abschluss",   text: normString(degree) },
      ],
    });
  });

  return out;
}
