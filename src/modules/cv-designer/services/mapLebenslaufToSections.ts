import type { GroupKey, PartKey } from "../store/designerStore";

// Robust gegen unterschiedliche Feldformen (Array/String/Null).
function j(v: any, sep = " "): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.filter(Boolean).join(sep);
  return String(v);
}
function nn(...vals: any[]): string {
  return vals.filter((x) => !!x && String(x).trim().length > 0).join(" · ");
}

export interface MappedSection {
  group: GroupKey;
  sourceKey: string; // z. B. "experience:<id>"
  title: string;     // Überschrift in der Box (z. B. "Berufserfahrung")
  parts: Array<{ key: PartKey; text: string }>;
}

export function mapLebenslaufToSectionParts(lebenslauf: any): MappedSection[] {
  const out: MappedSection[] = [];

  // Kontakt/Profil (vereinfachte Variante)
  const pd = lebenslauf?.personalData ?? {};
  const contactLines = [
    nn(j(pd.firstName), j(pd.lastName)),
    pd.profession ? `${pd.profession}` : "",
    nn(pd.email, pd.phone),
    j(pd.address),
  ]
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

  // Berufserfahrung
  const erf = Array.isArray(lebenslauf?.berufserfahrung) ? lebenslauf.berufserfahrung : [];
  for (const item of erf) {
    const id = item?.id ?? Math.random().toString(36).slice(2, 8);
    const zeitraum = nn(j(item.startMonth, "."), j(item.startYear), "-", j(item.endMonth, "."), j(item.endYear)).replace(/\s*-\s*$/, "- heute");
    const unternehmen = j(item.companies || item.company || "");
    const position = j(item.position || "");
    const taetigkeiten = Array.isArray(item.aufgabenbereiche)
      ? item.aufgabenbereiche.map((t: string) => `• ${t}`).join("\n")
      : j(item.aufgabenbereiche || item.description || "");

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

  // Ausbildung
  const edu = Array.isArray(lebenslauf?.ausbildung) ? lebenslauf.ausbildung : [];
  for (const item of edu) {
    const id = item?.id ?? Math.random().toString(36).slice(2, 8);
    const zeitraum = nn(j(item.startMonth, "."), j(item.startYear), "-", j(item.endMonth, "."), j(item.endYear)).replace(/\s*-\s*$/, "- heute");
    const institution = j(item.institution || item.school || "");
    const abschluss = j(item.degree || item.abschluss || "");
    const titel = "Ausbildung";

    out.push({
      group: "ausbildung",
      sourceKey: `education:${id}`,
      title: titel,
      parts: [
        { key: "titel", text: titel },
        { key: "zeitraum", text: zeitraum },
        { key: "unternehmen", text: institution }, // für Template: „institution“ mappt hier auf „unternehmen“
        { key: "abschluss", text: abschluss },
      ],
    });
  }

  return out;
}
