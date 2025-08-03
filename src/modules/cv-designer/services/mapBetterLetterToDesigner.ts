import { LayoutElement } from "../types/section";
import { PersonalData, Experience, Education } from "@/components/LebenslaufContext";

/**
 * Adapter: BetterLetter CV-Daten -> CV-Designer Sections
 */
export function mapBetterLetterToDesigner(cv: {
  personalData: PersonalData;
  berufserfahrung: Experience[];
  ausbildung: Education[];
  skills: string[];
  softskills: string[];
}): LayoutElement[] {
  return [
    {
      id: "profile",
      type: "profil",
      title: "Persönliche Daten",
      content: Object.entries(cv.personalData || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n"),
    },
    {
      id: "experience",
      type: "erfahrung",
      title: "Berufserfahrung",
      content: (cv.berufserfahrung || [])
        .map(
          (e) =>
            `${e.position} @ ${e.companies?.join(", ") || ""} (${e.startMonth}.${e.startYear} - ${
              e.endMonth && e.endYear ? `${e.endMonth}.${e.endYear}` : "heute"
            })
${e.aufgabenbereiche?.join(", ")}`
        )
        .join("\n\n"),
    },
    {
      id: "education",
      type: "ausbildung",
      title: "Ausbildung",
      content: (cv.ausbildung || [])
        .map(
          (a) =>
            `${a.ausbildungsart} – ${a.institution} (${a.startMonth}.${a.startYear} - ${a.endMonth}.${a.endYear})`
        )
        .join("\n\n"),
    },
    {
      id: "skills",
      type: "kenntnisse",
      title: "Fachkompetenzen",
      content: (cv.skills || []).join(", "),
    },
    {
      id: "softskills",
      type: "softskills",
      title: "Soft Skills",
      content: (cv.softskills || []).join(", "),
    },
  ];
}
