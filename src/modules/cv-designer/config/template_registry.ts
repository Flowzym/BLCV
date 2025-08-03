import { classicTemplate } from "./predefinedTemplates"

export const predefinedTemplates = [classicTemplate]

export function getTemplateCategories() {
  return ["classic"]
}

export function getTemplateById(id: string) {
  return predefinedTemplates.find((tpl) => tpl.id === id)
}
