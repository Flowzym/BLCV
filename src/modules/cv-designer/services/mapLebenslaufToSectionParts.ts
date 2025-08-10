// Text-Mapping (Generator → einfache Text-Sektionen) + Chunking nach A4-Höhe.
// Wird u.a. vom (älteren) Import/Update-Flow genutzt.
//
// Exporte:
//   - buildSectionsFromLebenslauf(lebenslauf) => Array<{ title, content, group?, key? }>
//   - splitSectionByPage(section, fontSize, pageHeight, {top,bottom}, lineHeight)
//   - mapLebenslaufToSectionParts(ctx) => MappedSection[]

import type { GroupKey, PartKey } from "../store/designerStore";

export interface TextSection {
  title?: string;
  content: string;
  group?: GroupKey;
  key?: string;   // optional: stabiler Schlüssel (z. B. "experience:<id>")
}

export type MappedSection = {
  group: GroupKey;
  sourceKey: string;          // stabil: z.B. "exp:<id>"
  title?: string;
  parts: Array<{ key: PartKey; text?: string }>;
};

// helpers
function j(v: any, sep = " "): string {
  if (v == null) return "";
  if (Array.isArray(v)) {
    return v.map(item => String(item ?? "").trim()).filter(Boolean).join(sep);
  }
  return String(v ?? "").trim();
}

function lines(v: any): string[] {
  if (v == null) return [];
  return String(v).replace(/\r\n/g, "\n").split("\n");
}

function formatPeriod(sm: string|null, sy: string|null, em: string|null, ey: string|null, current: boolean): string {
  const fmt = (m?: string|null, y?: string|null) => {
    if (!y || y === 'null') return '';
    const month = m && m !== 'null' ? m.padStart(2, '0') : '';
    return month ? `${month}.${y}` : y;
  };
  const start = fmt(sm, sy);
  const end = current ? 'heute' : fmt(em, ey);
  if (!start && !end) return '';
  if (start && end) return `${start} – ${end}`;
  return start || end;
}

function norm(v: any): string {
  if (v == null) return "";
  if (Array.isArray(v)) {
    return v.map(item => String(item ?? "").trim()).filter(Boolean).join(", ");
  }
  return String(v ?? "").trim().replace(/\s+/g, " ");
}

export function mapLebenslaufToSectionParts(ll: any): MappedSection[] {
  const out: MappedSection[] = [];
  
  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.debug('[mapLebenslaufToSectionParts] Input data:', {
      personalData: ll?.personalData ? Object.keys(ll.personalData) : 'none',
      berufserfahrung: ll?.berufserfahrung?.length || 0,
      ausbildung: ll?.ausbildung?.length || 0
    });
  }

  // ---- Kontakt / PersonalData
  const pd = ll?.personalData ?? {};
  if (pd && Object.keys(pd).length) {
    const fullName = [norm(pd.titel), norm(pd.vorname), norm(pd.nachname)].filter(Boolean).join(" ").trim() || norm(pd.name);
    const phone = [norm(pd.telefonVorwahl), norm(pd.telefon)].filter(Boolean).join(" ").trim() || norm(pd.phone);
    const website = Array.isArray(pd.socialMedia) ? pd.socialMedia.map(norm).filter(Boolean).join(", ") : norm(pd.website);

    const contact = [fullName, norm(pd.email), phone, norm(pd.city ?? pd.ort), norm(pd.street ?? pd.adresse), website, norm(pd.linkedin), norm(pd.github)].filter(Boolean).join(" · ");

    if (contact) {
      out.push({
        group: "kontakt",
        sourceKey: "contact:main",
        title: "Kontakt",
        parts: [{ key: "kontakt", text: contact }],
      });
    }

    // ProfileInput aggregated data
    if (pd.summary?.trim()) {
      out.push({
        group: "profil",
        sourceKey: "profile:summary",
        title: "Profil",
        parts: [{ key: "titel", text: pd.summary.trim() }],
      });
    }

    if (pd.skillsSummary?.trim()) {
      out.push({
        group: "kenntnisse",
        sourceKey: "profile:skills",
        title: "Fachliche Kompetenzen",
        parts: [{ key: "skills", text: pd.skillsSummary.trim() }],
      });
    }

    if (pd.softSkillsSummary?.trim()) {
      out.push({
        group: "softskills",
        sourceKey: "profile:softskills",
        title: "Persönliche Kompetenzen",
        parts: [{ key: "skills", text: pd.softSkillsSummary.trim() }],
      });
    }

    if (pd.taetigkeitenSummary?.trim()) {
      out.push({
        group: "erfahrung",
        sourceKey: "profile:taetigkeiten",
        title: "Tätigkeitsbereiche",
        parts: [{ key: "taetigkeiten", text: pd.taetigkeitenSummary.trim() }],
      });
    }
  }

  // ---- Berufserfahrung
  const erfArr = Array.isArray(ll?.berufserfahrung) ? ll.berufserfahrung : [];
  erfArr.forEach((exp, i) => {
    const positionLine = Array.isArray(exp.position) ? exp.position.join(" / ") : (exp.position || "");
    const companyLine = [
      Array.isArray(exp.companies) ? exp.companies.join(" // ") : (exp.companies || ""),
      (exp.leasingCompaniesList?.length ? `(über ${exp.leasingCompaniesList.join(", ")})` : "")
    ].filter(Boolean).join(" ");
    const period = formatPeriod(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, !!exp.isCurrent);
    const tasks = Array.isArray(exp.aufgabenbereiche) ? exp.aufgabenbereiche.map(t => `• ${t}`).join('\n') : '';

    const parts: Array<{ key: PartKey; text: string }> = [
      { key: "position", text: positionLine || "Position" },
      { key: "unternehmen", text: companyLine || "Unternehmen" },
      { key: "zeitraum", text: period || "Zeitraum" },
    ];
    
    if (tasks) {
      parts.push({ key: "taetigkeiten", text: tasks });
    }

    out.push({
      group: "erfahrung",
      sourceKey: `exp:${exp.id}`,
      title: positionLine || companyLine || "Berufserfahrung",
      parts,
    });
    
    if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
      console.debug(`[mapLebenslaufToSectionParts] Experience ${i}:`, {
        id: exp.id,
        positionLine,
        companyLine,
        period,
        tasksCount: exp.aufgabenbereiche?.length || 0
      });
    }
  });

  // ---- Ausbildung
  const eduArr = Array.isArray(ll?.ausbildung) ? ll.ausbildung : [];
  eduArr.forEach((edu, i) => {
    const titleLine = [
      Array.isArray(edu.ausbildungsart) ? edu.ausbildungsart.join(" / ") : (edu.ausbildungsart || ""),
      Array.isArray(edu.abschluss) ? edu.abschluss.join(" / ") : (edu.abschluss || "")
    ].filter(Boolean).join(" - ").trim();
    const institution = Array.isArray(edu.institution) ? edu.institution.join(", ") : (edu.institution || "");
    const period = formatPeriod(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, !!edu.isCurrent);

    const parts: Array<{ key: PartKey; text: string }> = [
      { key: "titel", text: titleLine || "Ausbildung" },
      { key: "unternehmen", text: institution || "Institution" },
      { key: "zeitraum", text: period || "Zeitraum" },
    ];
    
    if (edu.zusatzangaben?.trim()) {
      parts.push({ key: "abschluss", text: edu.zusatzangaben.trim() });
    }

    out.push({
      group: "ausbildung",
      sourceKey: `edu:${edu.id}`,
      title: titleLine || institution || "Ausbildung",
      parts,
    });
    
    if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
      console.debug(`[mapLebenslaufToSectionParts] Education ${i}:`, {
        id: edu.id,
        titleLine,
        institution,
        period
      });
    }
  });

  if (import.meta.env.VITE_DEBUG_DESIGNER_SYNC === 'true') {
    console.debug('[mapLebenslaufToSectionParts] Final output:', {
      sectionsCount: out.length,
      sections: out.map(s => ({
        group: s.group,
        sourceKey: s.sourceKey,
        title: s.title,
        partsCount: s.parts.length,
        firstPartText: s.parts[0]?.text?.substring(0, 50) + '...'
      }))
    });
  }

  return out;
}