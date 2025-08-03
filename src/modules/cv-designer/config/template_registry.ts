// Template Registry – zentrale Sammlung aller verfügbaren Templates
import { Template } from "../types/template"
import { classicTemplate } from "./predefinedTemplates"

// 👉 Liste aller Templates, erweiterbar
export const predefinedTemplates: Template[] = [
  classicTemplate,
  // weitere Templates hier hinzufügen
]

// 👉 Hole Template anhand der ID
export function getTemplateById(id: string): Template | undefined {
  return predefinedTemplates.find(t => t.id === id)
}

// 👉 Hole alle verfügbaren Kategorien (z. B. "classic", "modern")
export function getTemplateCategories(): string[] {
  return Array.from(
    new Set(predefinedTemplates.map(t => t.category || "default"))
  )
}
