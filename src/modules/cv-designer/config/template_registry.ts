import { LayoutTemplate } from '../types/design_types'

class TemplateRegistryClass {
  private templates: LayoutTemplate[] = []
  private initialized = false

  register(template: LayoutTemplate) {
    this.templates.push(template)
  }

  registerBatch(templates: LayoutTemplate[]) {
    templates.forEach(template => this.register(template))
  }

  registerTemplate(template: LayoutTemplate) {
    this.register(template)
  }

  getAllTemplates(): LayoutTemplate[] {
    return [...this.templates]
  }

  getTemplateById(id: string): LayoutTemplate | undefined {
    return this.templates.find(template => template.id === id)
  }

  remove(id: string): boolean {
    const index = this.templates.findIndex(template => template.id === id)
    if (index !== -1) {
      this.templates.splice(index, 1)
      return true
    }
    return false
  }

  validate(template: LayoutTemplate): boolean {
    // Basic validation
    return !!(template.id && template.name && template.layout)
  }

  isInitialized(): boolean {
    return this.initialized
  }

  initialize() {
    this.initialized = true
  }

  clear() {
    this.templates = []
    this.initialized = false
  }

  getTemplatesByCategory(category: string): LayoutTemplate[] {
    return this.templates.filter(template => template.category === category)
  }

  getTemplatesByFont(font: string): LayoutTemplate[] {
    return this.templates.filter(template => 
      template.styleConfig?.typography?.fontFamily === font
    )
  }

  getTemplatesByColorRange(colorRange: string): LayoutTemplate[] {
    return this.templates.filter(template => 
      template.styleConfig?.colors?.primary?.includes(colorRange)
    )
  }

  getStats() {
    const totalTemplates = this.templates.length
    const popularTemplates = this.templates.filter(template => 
      (template as any).isPopular === true
    ).length
    const premiumTemplates = this.templates.filter(template => 
      (template as any).isPremium === true
    ).length
    
    return {
      totalTemplates,
      totalCategories: new Set(this.templates.map(t => t.category)).size,
      popularTemplates,
      premiumTemplates,
      averageUsage: 0 // Placeholder since usage tracking isn't implemented
    }
  }
}

// Create singleton instance
const TemplateRegistry = new TemplateRegistryClass()

// Named exports for backward compatibility
export function registerTemplate(template: LayoutTemplate) {
  TemplateRegistry.registerTemplate(template)
}

export function getAllTemplates(): LayoutTemplate[] {
  return TemplateRegistry.getAllTemplates()
}

// Default export
export default TemplateRegistry