import { useLebenslauf } from "@/components/LebenslaufContext";

export interface ExperienceVM {
  id: string;
  positionLine: string;     // "Position1 / Position2"
  companyLine: string;      // "Company1 // Company2" (+ leasing if present)
  period: string;           // "MM.YYYY – heute" or "YYYY – YYYY"
  tasks: string[];          // aufgabenbereiche[]
}

export interface EducationVM {
  id: string;
  titleLine: string;        // ausbildungsart + abschluss joined
  institution: string;      // institution joined
  period: string;
  note?: string;            // zusatzangaben
}

export function useDesignerCvSnapshot() {
  const { personalData, berufserfahrung, ausbildung } = useLebenslauf();

  const exps: ExperienceVM[] = (berufserfahrung ?? []).map(exp => ({
    id: exp.id,
    positionLine: Array.isArray(exp.position) ? exp.position.join(" / ") : (exp.position || ""),
    companyLine: [
      Array.isArray(exp.companies) ? exp.companies.join(" // ") : (exp.companies || ""),
      (exp.leasingCompaniesList?.length ? `(über ${exp.leasingCompaniesList.join(", ")})` : "")
    ].filter(Boolean).join(" "),
    period: formatPeriod(exp.startMonth, exp.startYear, exp.endMonth, exp.endYear, !!exp.isCurrent),
    tasks: Array.isArray(exp.aufgabenbereiche) ? exp.aufgabenbereiche : [],
  }));

  const edus: EducationVM[] = (ausbildung ?? []).map(edu => ({
    id: edu.id,
    titleLine: [
      Array.isArray(edu.ausbildungsart) ? edu.ausbildungsart.join(" / ") : (edu.ausbildungsart || ""),
      Array.isArray(edu.abschluss) ? edu.abschluss.join(" / ") : (edu.abschluss || "")
    ].filter(Boolean).join(" - ").trim(),
    institution: Array.isArray(edu.institution) ? edu.institution.join(", ") : (edu.institution || ""),
    period: formatPeriod(edu.startMonth, edu.startYear, edu.endMonth, edu.endYear, !!edu.isCurrent),
    note: edu.zusatzangaben || "",
  }));

  return {
    personalData,
    experiences: exps,
    educations: edus,
    // use this to force memo deps if needed
    __dep__: JSON.stringify({ exps, edus, pd: personalData }),
  };
}

function formatPeriod(sm: string|null, sy: string|null, em: string|null, ey: string|null, current: boolean) {
  const fmt = (m?: string|null, y?: string|null) => (y ? (m ? `${m}.${y}` : y) : "");
  const start = fmt(sm, sy);
  const end = current ? "heute" : fmt(em, ey);
  if (!start && !end) return "";
  if (start && end) return `${start} – ${end}`;
  return start || end;
}