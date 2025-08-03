import { LayoutElement } from "../types/section"
import { getTemplateById } from "../templates"

export function mapBetterLetterToDesignerWithTemplate(cvData: any, templateId: string): LayoutElement[] {
  const template = getTemplateById(templateId)
  if (!template) return []

  return template.layout.map((el) => {
    const safeElement: LayoutElement = {
      ...el,
      id: el.id || `el-${Math.random().toString(36).substr(2, 9)}`,
      type: el.type || "profil",
      title: el.title || "",
      x: typeof el.x === "number" ? el.x : 0,
      y: typeof el.y === "number" ? el.y : 0,
      width: typeof el.width === "number" ? el.width : 200,
      height: typeof el.height === "number" ? el.height : 100,
      content: "" // setzen wir unten
    }

    switch (el.type) {
      case "profil":
        safeElement.content = [
          cvData.personalData?.vorname || cvData.personalData?.firstName || "",
          cvData.personalData?.nachname || cvData.personalData?.lastName || "",
          cvData.personalData?.email || "",
          cvData.personalData?.telefon || cvData.personalData?.phone || "",
          cvData.personalData?.adresse || cvData.personalData?.address || "",
          cvData.personalData?.profession || "",
          cvData.personalData?.summary || ""
        ].filter(Boolean).join("\n")
        break
      case "erfahrung":
        safeElement.content = (cvData.workExperience || cvData.erfahrung || [])
          .map((exp: any) =>
            `${exp.position || ""} @ ${exp.company || ""} (${exp.startDate || ""} – ${exp.endDate || "heute"})`
          )
          .join("\n")
        break
      case "ausbildung":
        safeElement.content = (cvData.education || cvData.ausbildung || [])
          .map((edu: any) =>
            `${edu.degree || ""} - ${edu.institution || ""} (${edu.startDate || ""} – ${edu.endDate || ""})`
          )
          .join("\n")
        break
      case "kenntnisse":
        safeElement.content = (cvData.skills || cvData.kenntnisse || []).join(", ")
        break
      case "softskills":
        safeElement.content = (cvData.softskills || []).join(", ")
        break
      case "portfolio":
        safeElement.content = (cvData.portfolio || []).map((p: any) => p.title || "").join(", ")
        break
      default:
        safeElement.content = String(el.content || "")
    }

    return safeElement
  })
}
