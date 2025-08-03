import { classicTemplate } from "./predefinedTemplates"

export const predefinedTemplates = [classicTemplate]

export function getTemplateCategories() {
  return ["classic"]
}

export function getTemplateById(id: string) {
  // Sicherstellen, dass immer ein Template zurückkommt
  return predefinedTemplates.find((tpl) => tpl.id === id) || classicTemplate
}
