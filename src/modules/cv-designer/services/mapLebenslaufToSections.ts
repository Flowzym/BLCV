// src/modules/cv-designer/services/mapLebenslaufToSections.ts
export type SimpleSection = { title: string; content: string };

export function buildSectionsFromLebenslauf(lebenslauf: any): SimpleSection[] {
  if (!lebenslauf || typeof lebenslauf !== "object") return [];
  const out: SimpleSection[] = [];

  const pd = lebenslauf.personalData || {};
  const name = [pd.vorname, pd.nachname].filter(Boolean).join(" ");
  const telefon = [pd.telefonVorwahl, pd.telefon].filter(Boolean).join(" ") || pd.telefon || "";
  const adresse = pd.adresse || [pd.strasse, pd.hausnummer].filter(Boolean).join(" ");
  const cityLine = [pd.plz, pd.ort].filter(Boolean).join(" ");
  const geburt = pd.geburtsdatum;

  const kontakt = [
    name && `• ${name}`,
    pd.email && `• ${pd.email}`,
    telefon && `• ${telefon}`,
    (adresse || cityLine) && `• ${[adresse, cityLine].filter(Boolean).join(", ")}`,
    !adresse && cityLine && `• ${cityLine}`,
    geburt && `• Geburtsdatum: ${geburt}`,
  ].filter(Boolean) as string[];

  if (kontakt.length) out.push({ title: "Kontakt", content: kontakt.join("\n") });

  const expList: any[] = Array.isArray(lebenslauf.berufserfahrung) ? lebenslauf.berufserfahrung : [];
  if (expList.length) {
    const bullets = expList
      .map((it) => {
        const role = head(it.position) || it.role || it.titel || it.title;
        const company = head(it.companies) || it.company || it.firma || it.employer;
        const range = rangeFmt(it.startMonth, it.startYear, it.endMonth, it.endYear, it.isCurrent);
        const city = it.city || it.ort || it.location || "";
        const tasks = Array.isArray(it.aufgabenbereiche) ? it.aufgabenbereiche.filter(Boolean) : [];
        const headLine = [role, company].filter(Boolean).join(" · ");
        const tail = [range, city].filter(Boolean).join(" · ");
        const base = [headLine, tail].filter(Boolean).join(" — ");
        const details = tasks.length ? `: ${tasks.join("; ")}` : "";
        return base ? `• ${base}${details}` : "";
      })
      .filter(Boolean);
    if (bullets.length) out.push({ title: "Erfahrung", content: bullets.join("\n") });
  }

  const eduList: any[] = Array.isArray(lebenslauf.ausbildung) ? lebenslauf.ausbildung : [];
  if (eduList.length) {
    const bullets = eduList
      .map((it) => {
        const inst = head(it.institution) || it.uni || it.school || "";
        const art = head(it.ausbildungsart) || it.studyType || "";
        const degree = head(it.abschluss) || it.degree || it.title || "";
        const range = rangeFmt(it.startMonth, it.startYear, it.endMonth, it.endYear, it.isCurrent);
        const city = it.city || it.ort || "";
        const headLine = [degree || art, inst].filter(Boolean).join(" · ");
        const tail = [range, city].filter(Boolean).join(" · ");
        return (headLine || tail) ? `• ${[headLine, tail].filter(Boolean).join(" — ")}` : "";
      })
      .filter(Boolean);
    if (bullets.length) out.push({ title: "Ausbildung", content: bullets.join("\n") });
  }

  return out;
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
    if (lineCost > remaining && bucket.length) {
      chunks.push(bucket);
      bucket = [];
      remaining = available - titleCost;
    }
    bucket.push(ln);
    remaining -= lineCost;
  }
  if (bucket.length) chunks.push(bucket);
  if (chunks.length <= 1) return [section];
  return chunks.map((chunk) => ({ title: section.title, content: chunk.join("\n") }));
}

function head(v: any): string | undefined {
  return Array.isArray(v) ? v.find(Boolean)?.toString() : undefined;
}
function rangeFmt(sM: any, sY: any, eM: any, eY: any, cur?: boolean) {
  const sm = m2(sM), sy = y4(sY), em = m2(eM), ey = y4(eY);
  const start = [sm, sy].filter(Boolean).join("/");
  const end = cur ? "heute" : [em, ey].filter(Boolean).join("/");
  return start || end ? `${start || "?"} – ${end || "?"}` : "";
}
const y4 = (x: any) => (String(x ?? "").match(/^\d{4}$/) ? String(x) : undefined);
const m2 = (x: any) => (String(x ?? "").match(/^\d{1,2}$/) ? String(x).padStart(2, "0") : undefined);
