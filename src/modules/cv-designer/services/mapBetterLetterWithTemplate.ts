import { LayoutElement } from "../types/section"
import { getTemplateById } from "../templates/index"

export function mapBetterLetterToDesignerWithTemplate(cvData: any, templateId: string): LayoutElement[] {
  const template = getTemplateById(templateId)
  if (!template) return []

  return template.layout.map((el) => {
    try {
      switch (el.type) {
        case "profil":
          return {
            ...el,
            content: [
              cvData.personalData?.vorname || cvData.personalData?.firstName || "",
              cvData.personalData?.nachname || cvData.personalData?.lastName || "",
              cvData.personalData?.email || "",
              cvData.personalData?.telefon || cvData.personalData?.phone || "",
              cvData.personalData?.adresse || cvData.personalData?.address || "",
              cvData.personalData?.profession || "",
              cvData.personalData?.summary || ""
            ].filter(Boolean).join("\n")
          }
        case "erfahrung":
          return {
            ...el,
            content: (cvData.workExperience || cvData.erfahrung || [])
              .map((exp: any) =>
                `${exp.position || ""} @ ${exp.company || ""} (${exp.startDate || ""} – ${exp.endDate || "heute"})`
              )
              .join("\n")
          }
        case "ausbildung":
          return {
            ...el,
            content: (cvData.education || cvData.ausbildung || [])
              .map((edu: any) =>
                `${edu.degree || ""} - ${edu.institution || ""} (${edu.startDate || ""} – ${edu.endDate || ""})`
              )
              .join("\n")
          }
        case "kenntnisse":
          return {
            ...el,
            content: (cvData.skills || cvData.kenntnisse || []).join(", ")
          }
        case "softskills":
          return {
            ...el,
            content: (cvData.softskills || []).join(", ")
          }
        case "portfolio":
          return {
            ...el,
            content: (cvData.portfolio || []).map((p: any) => p.title || "").join(", ")
          }
        default:
          return { ...el, content: "" }
      }
    } catch (err) {
      console.error("❌ Fehler beim Mapping Element:", el, err)
      return { ...el, content: "" }
    }
  })
}
