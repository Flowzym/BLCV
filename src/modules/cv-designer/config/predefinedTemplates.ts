import { Template } from "../types/template"

export const classicTemplate: Template = {
  id: "classic",
  name: "Classic",
  category: "classic",
  description: "Ein klassisches, schlichtes Lebenslauf-Template.",
  sections: [
    { type: "profile", title: "Profil" },
    { type: "experience", title: "Berufserfahrung" },
    { type: "education", title: "Ausbildung" },
    { type: "skills", title: "Fähigkeiten" },
  ],
  defaultStyle: {
    fontFamily: "Arial",
    fontSize: 12,
    color: "#000000",
    backgroundColor: "#ffffff",
    padding: "12px",
    borderRadius: "4px",
  },
}
