// Text-Mapping (Generator → einfache Text-Sektionen) + Chunking nach A4-Höhe.
// Wird u.a. vom (älteren) Import/Update-Flow genutzt.
//
// Exporte:
//   - buildSectionsFromLebenslauf(lebenslauf) => Array<{ title, content, group?, key? }>
//   - splitSectionByPage(section, fontSize, pageHeight, {top,bottom}, lineHeight)

export interface TextSection {
  title?: string;
  content?: string;
  group?: string; // optional: "erfahrung" | "ausbildung" | ...
  key?: string;   // optional: stabiler Schlüssel (z. B. "experience:<id>")
}

// helpers
function j(v: any, sep = " "): string {
  if (v == null) return "";
  if (Array.isArray(v)) return v.filter(Boolean).join(sep);
  return String(v);
}
function nn(...vals: any[]): string {
  return vals
    .map((x) => (x == null ? "" : String(x).trim()))
    .filter((x) => x.length > 0)
    .join(" · ");
}
function linesOf(s?: string): string[] {
  if (!s) return [];
  return String(s).replace(/\r\n/g, "\n").split("\n");
}

// ---------- Mapping: Lebenslauf -> flache Text-Sektionen ----------
export function buildSectionsFromLebenslauf(lebenslauf: any): TextSection[] {
  const out: TextSection[] = [];

  // Personal / Profil
  const pd = lebenslauf?.personalData ?? lebenslauf?.personaldaten ?? {};
  const summary = pd.summary || pd.zusammenfassung || "";
  const profession = pd.profession || pd.beruf || "";
  const name = nn(j(pd.firstName), j(pd.lastName));
  const contact = [
    name,
    profession,
    nn(pd.email, pd.phone),
    j(pd.address),
  ]
    .filter(Boolean)
    .join("\n");

  if (summary) {
    out.push({
      title: "Profil",
      content: summary,
      group: "profil",
      key: "profile:main",
    });
  }

  if (contact) {
    out.push({
      title: "Kontakt",
      content: contact,
      group: "kontakt",
      key: "contact:main",
    });
  }

  // Berufserfahrung
  const erf =
    Array.isArray(lebenslauf?.berufserfahrung)
      ? lebenslauf.berufserfahrung
      : Array.isArray(lebenslauf?.workExperience)
        ? lebenslauf.workExperience
        : [];

  for (const item of erf) {
    const id = item?.id ?? Math.random().toString(36).slice(2, 8);
    const zeitraum = nn(
      j(item.startMonth, "."),
      j(item.startYear),
      "-",
      j(item.endMonth, "."),
      j(item.endYear)
    ).replace(/\s*-\s*$/, "- heute");

    const unternehmen = j(item.companies || item.company || "");
    const position = j(item.position || "");
    const location = j(item.location || item.ort || "");
    const bulletSrc = Array.isArray(item.aufgabenbereiche)
      ? item.aufgabenbereiche
      : Array.isArray(item.tasks)
        ? item.tasks
        : [];
    const bullets =
      bulletSrc.length > 0
        ? bulletSrc.map((t: string) => `• ${t}`).join("\n")
        : j(item.description || "");

    const content = [
      position && unternehmen ? `${position} @ ${unternehmen}` : (position || unternehmen),
      nn(zeitraum, location),
      bullets,
    ]
      .filter(Boolean)
      .join("\n");

    out.push({
      title: "Berufserfahrung",
      content,
      group: "erfahrung",
      key: `experience:${id}`,
    });
  }

  // Ausbildung
  const edu =
    Array.isArray(lebenslauf?.ausbildung)
      ? lebenslauf.ausbildung
      : Array.isArray(lebenslauf?.education)
        ? lebenslauf.education
        : [];

  for (const item of edu) {
    const id = item?.id ?? Math.random().toString(36).slice(2, 8);
    const zeitraum = nn(
      j(item.startMonth, "."),
      j(item.startYear),
      "-",
      j(item.endMonth, "."),
      j(item.endYear)
    ).replace(/\s*-\s*$/, "- heute");

    const institution = j(item.institution || item.school || "");
    const abschluss = j(item.degree || item.abschluss || "");
    const ort = j(item.location || item.ort || "");
    const fach = j(item.fieldOfStudy || item.studienfach || "");
    const grade = j(item.grade || item.abschlussnote || "");

    const content = [
      abschluss && institution ? `${abschluss} @ ${institution}` : (abschluss || institution),
      nn(zeitraum, ort, fach),
      grade,
    ]
      .filter(Boolean)
      .join("\n");

    out.push({
      title: "Ausbildung",
      content,
      group: "ausbildung",
      key: `education:${id}`,
    });
  }

  // Skills (optional)
  const skills =
    Array.isArray(lebenslauf?.skills) ? lebenslauf.skills : Array.isArray(lebenslauf?.faehigkeiten) ? lebenslauf.faehigkeiten : [];
  if (skills.length) {
    const content =
      typeof skills[0] === "string"
        ? (skills as string[]).join(", ")
        : (skills as any[])
            .map((s) => s?.name || s?.label || s)
            .filter(Boolean)
            .join(", ");
    out.push({
      title: "Fähigkeiten",
      content,
      group: "kenntnisse",
      key: "skills:main",
    });
  }

  return out;
}

// ---------- Chunking: Sektion → Seiten-Segmente ----------
export function splitSectionByPage(
  section: TextSection,
  fontSize: number,
  pageHeight: number,
  margins: { top: number; bottom: number },
  lineHeight: number
): TextSection[] {
  const title = section.title?.trim() || "";
  const allLines = [
    ...(title ? [title] : []),
    ...linesOf(section.content),
  ];

  // grobe Zeilenhöhe in px
  const linePx = Math.max(8, Number(fontSize) || 11) * (Number(lineHeight) || 1.4);
  const usable = Math.max(50, pageHeight - (margins?.top || 0) - (margins?.bottom || 0));

  // Max-Lines pro Seite; wir ziehen minimal 1 für Titel ab, wenn vorhanden
  const maxLines = Math.max(5, Math.floor(usable / linePx));
  const perPage = Math.max(1, maxLines); // wir lassen Titel als ganz normale erste Zeile drin

  const chunks: string[][] = [];
  for (let i = 0; i < allLines.length; i += perPage) {
    chunks.push(allLines.slice(i, i + perPage));
  }

  // Jede Seite bekommt denselben Title in der ersten Zeile (ist schon in allLines enthalten),
  // damit bestehende Titel-Matches funktionieren.
  const results: TextSection[] = chunks.map((chunk) => {
    const t = title || (chunk.length ? chunk[0] : "");
    // entferne die erste Zeile nur dann, wenn sie exakt der Titel war und doppelt wäre
    const contentLines =
      title && chunk[0] === title ? chunk.slice(1) : chunk;
    return {
      title: t,
      content: contentLines.join("\n"),
      group: section.group,
      key: section.key, // Key bleibt identisch; wenn das nicht gewünscht ist, hier erweitern
    };
  });

  return results.length ? results : [{ ...section }];
}
