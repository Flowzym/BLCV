/**
 * Konsolidierte Layout-Templates mit Template-Registry Integration
 * 
 * Diese Datei konsolidiert alle Layout-Templates und integriert sie 
 * mit der neuen TemplateRegistry für zentrale Verwaltung.
 */

import { DesignTemplate, TemplateCategory } from '@/types/design_types';
import TemplateRegistry from '@/logic/template_registry';

// ============================================================================
// LAYOUT-TEMPLATES DEFINITION
// ============================================================================

/**
 * Vollständige Sammlung aller verfügbaren Layout-Templates
 * Konsolidiert aus layout_templates.ts und layout_templates_final.ts
 */
const layoutTemplates: DesignTemplate[] = [
  // KLASSISCHE TEMPLATES
  {
    id: 'klassisch-kompakt',
    title: 'Klassisch Kompakt',
    description: 'Traditionelles, platzsparendes Design für konservative Branchen und formelle Bewerbungen',
    category: 'klassisch',
    isPopular: true,
    config: {
      primaryColor: '#1f2937',
      accentColor: '#6b7280',
      fontFamily: 'Merriweather',
      fontSize: 'small',
      lineHeight: 1.4,
      margin: 'narrow'
    },
    metadata: {
      tags: ['konservativ', 'traditionell', 'kompakt', 'formell'],
      rating: 4.2
    }
  },

  {
    id: 'klar-klassisch',
    title: 'Klar & Klassisch',
    description: 'Zeitloses Design mit klarer Struktur und hoher Lesbarkeit für traditionelle Branchen',
    category: 'klassisch',
    config: {
      primaryColor: '#000000',
      accentColor: '#666666',
      fontFamily: 'Georgia',
      fontSize: 'medium',
      lineHeight: 1.6,
      margin: 'wide'
    },
    metadata: {
      tags: ['zeitlos', 'klassisch', 'lesbar', 'strukturiert'],
      rating: 4.5
    }
  },

  // MODERNE BUSINESS TEMPLATES
  {
    id: 'modern-business',
    title: 'Modern Business',
    description: 'Zeitgemäßes, professionelles Layout für Unternehmensumgebungen und Tech-Branchen',
    category: 'modern-business',
    isPopular: true,
    config: {
      primaryColor: '#1e40af',
      accentColor: '#3b82f6',
      fontFamily: 'Inter',
      fontSize: 'medium',
      lineHeight: 1.6,
      margin: 'normal'
    },
    metadata: {
      tags: ['modern', 'business', 'tech', 'professionell'],
      rating: 4.7
    }
  },

  {
    id: 'modern-blau',
    title: 'Modern Blau',
    description: 'Zeitgemäßes, professionelles Design in Blautönen für Business und Tech-Bereiche',
    category: 'modern-business',
    isPopular: true,
    config: {
      primaryColor: '#1e40af',
      accentColor: '#3b82f6',
      fontFamily: 'Inter',
      fontSize: 'medium',
      lineHeight: 1.5,
      margin: 'normal'
    },
    metadata: {
      tags: ['modern', 'blau', 'business', 'tech'],
      rating: 4.6
    }
  },

  {
    id: 'consulting-professional',
    title: 'Consulting Professional',
    description: 'Vertrauensvolles, strukturiertes Design für Beratung und professionelle Dienstleistungen',
    category: 'modern-business',
    config: {
      primaryColor: '#059669',
      accentColor: '#10b981',
      fontFamily: 'Source Sans Pro',
      fontSize: 'medium',
      lineHeight: 1.5,
      margin: 'normal'
    },
    metadata: {
      tags: ['beratung', 'professionell', 'vertrauensvoll', 'strukturiert'],
      rating: 4.4
    }
  },

  {
    id: 'business-gruen',
    title: 'Business Grün',
    description: 'Vertrauensvolles Design in Grüntönen für Beratung und professionelle Dienstleistungen',
    category: 'modern-business',
    config: {
      primaryColor: '#059669',
      accentColor: '#10b981',
      fontFamily: 'Open Sans',
      fontSize: 'medium',
      lineHeight: 1.5,
      margin: 'normal'
    },
    metadata: {
      tags: ['business', 'grün', 'beratung', 'vertrauen'],
      rating: 4.3
    }
  },

  // KREATIVE TEMPLATES
  {
    id: 'kreativ-fokus',
    title: 'Kreativ Fokus',
    description: 'Lebendiges, auffälliges Design für Designer, Künstler und kreative Berufe',
    category: 'kreativ',
    isPopular: true,
    config: {
      primaryColor: '#7c3aed',
      accentColor: '#f59e0b',
      fontFamily: 'Playfair Display',
      fontSize: 'large',
      lineHeight: 1.7,
      margin: 'wide'
    },
    metadata: {
      tags: ['kreativ', 'auffällig', 'design', 'künstlerisch'],
      rating: 4.8
    }
  },

  {
    id: 'kreativ-lila',
    title: 'Kreativ Lila',
    description: 'Lebendiges, modernes Design mit kreativen Akzenten für Designer und Kreative',
    category: 'kreativ',
    config: {
      primaryColor: '#7c3aed',
      accentColor: '#a855f7',
      fontFamily: 'Roboto',
      fontSize: 'large',
      lineHeight: 1.7,
      margin: 'wide'
    },
    metadata: {
      tags: ['kreativ', 'lila', 'modern', 'designer'],
      rating: 4.5
    }
  },

  {
    id: 'startup-dynamic',
    title: 'Startup Dynamic',
    description: 'Energiegeladenes, modernes Design für innovative Unternehmen und junge Branchen',
    category: 'kreativ',
    config: {
      primaryColor: '#dc2626',
      accentColor: '#f97316',
      fontFamily: 'Montserrat',
      fontSize: 'medium',
      lineHeight: 1.6,
      margin: 'normal'
    },
    metadata: {
      tags: ['startup', 'dynamisch', 'innovativ', 'energiegeladen'],
      rating: 4.6
    }
  },

  {
    id: 'startup-dynamisch',
    title: 'Startup Dynamisch',
    description: 'Modernes, energiegeladenes Design für innovative Unternehmen und junge Branchen',
    category: 'kreativ',
    config: {
      primaryColor: '#dc2626',
      accentColor: '#ef4444',
      fontFamily: 'Nunito',
      fontSize: 'large',
      lineHeight: 1.6,
      margin: 'normal'
    },
    metadata: {
      tags: ['startup', 'energiegeladen', 'modern', 'innovativ'],
      rating: 4.4
    }
  },

  {
    id: 'warm-orange',
    title: 'Warm Orange',
    description: 'Energiegeladenes Design mit warmen Farbtönen für Marketing und Kommunikation',
    category: 'kreativ',
    config: {
      primaryColor: '#ea580c',
      accentColor: '#f97316',
      fontFamily: 'Lato',
      fontSize: 'medium',
      lineHeight: 1.5,
      margin: 'normal'
    },
    metadata: {
      tags: ['warm', 'orange', 'marketing', 'kommunikation'],
      rating: 4.2
    }
  },

  // TECH & MINIMAL TEMPLATES
  {
    id: 'tech-minimalist',
    title: 'Tech Minimalist',
    description: 'Reduziertes, fokussiertes Design für IT, Software-Entwicklung und Start-ups',
    category: 'tech',
    config: {
      primaryColor: '#000000',
      accentColor: '#06b6d4',
      fontFamily: 'Roboto',
      fontSize: 'medium',
      lineHeight: 1.5,
      margin: 'normal'
    },
    metadata: {
      tags: ['tech', 'minimal', 'software', 'fokussiert'],
      rating: 4.5
    }
  },

  {
    id: 'tech-minimal',
    title: 'Tech Minimal',
    description: 'Reduziertes, fokussiertes Design für IT-Professionals und Tech-Start-ups',
    category: 'tech',
    config: {
      primaryColor: '#000000',
      accentColor: '#06b6d4',
      fontFamily: 'Source Code Pro',
      fontSize: 'small',
      lineHeight: 1.4,
      margin: 'narrow'
    },
    metadata: {
      tags: ['tech', 'minimal', 'it', 'startup'],
      rating: 4.3
    }
  },

  // EXECUTIVE & ELEGANT TEMPLATES
  {
    id: 'executive-elegant',
    title: 'Executive Elegant',
    description: 'Luxuriöses, hochwertiges Design für Führungskräfte und C-Level Positionen',
    category: 'executive',
    config: {
      primaryColor: '#7c2d12',
      accentColor: '#d97706',
      fontFamily: 'Playfair Display',
      fontSize: 'large',
      lineHeight: 1.6,
      margin: 'wide'
    },
    metadata: {
      tags: ['executive', 'elegant', 'luxuriös', 'führungskraft'],
      rating: 4.7
    }
  },

  {
    id: 'elegant-grau',
    title: 'Elegant Grau',
    description: 'Zurückhaltend elegantes Design für gehobene Positionen und Executive-Level',
    category: 'executive',
    config: {
      primaryColor: '#374151',
      accentColor: '#6b7280',
      fontFamily: 'Merriweather',
      fontSize: 'medium',
      lineHeight: 1.6,
      margin: 'wide'
    },
    metadata: {
      tags: ['elegant', 'grau', 'executive', 'zurückhaltend'],
      rating: 4.4
    }
  },

  // HEALTHCARE & SOZIAL TEMPLATES
  {
    id: 'healthcare-caring',
    title: 'Healthcare Caring',
    description: 'Vertrauensvolles, ruhiges Design für Gesundheitswesen und soziale Berufe',
    category: 'healthcare',
    config: {
      primaryColor: '#0f766e',
      accentColor: '#14b8a6',
      fontFamily: 'Open Sans',
      fontSize: 'medium',
      lineHeight: 1.6,
      margin: 'normal'
    },
    metadata: {
      tags: ['healthcare', 'sozial', 'vertrauensvoll', 'ruhig'],
      rating: 4.3
    }
  },

  {
    id: 'healthcare-blaugruen',
    title: 'Healthcare Blaugrün',
    description: 'Vertrauensvolles, beruhigendes Design für Gesundheitswesen und soziale Berufe',
    category: 'healthcare',
    config: {
      primaryColor: '#0f766e',
      accentColor: '#14b8a6',
      fontFamily: 'Source Sans Pro',
      fontSize: 'medium',
      lineHeight: 1.5,
      margin: 'normal'
    },
    metadata: {
      tags: ['healthcare', 'blaugrün', 'beruhigend', 'sozial'],
      rating: 4.2
    }
  },

  // AKADEMISCHE & WISSENSCHAFT TEMPLATES
  {
    id: 'academic-research',
    title: 'Academic Research',
    description: 'Seriöses, wissenschaftliches Design für Bildung, Forschung und akademische Laufbahnen',
    category: 'akademisch',
    config: {
      primaryColor: '#374151',
      accentColor: '#9ca3af',
      fontFamily: 'Merriweather',
      fontSize: 'medium',
      lineHeight: 1.7,
      margin: 'wide'
    },
    metadata: {
      tags: ['akademisch', 'wissenschaft', 'forschung', 'seriös'],
      rating: 4.3
    }
  },

  {
    id: 'academic-serif',
    title: 'Academic Serif',
    description: 'Wissenschaftliches Design mit Serifenschrift für Bildung und Forschung',
    category: 'akademisch',
    config: {
      primaryColor: '#1f2937',
      accentColor: '#4b5563',
      fontFamily: 'Crimson Text',
      fontSize: 'medium',
      lineHeight: 1.8,
      margin: 'wide'
    },
    metadata: {
      tags: ['akademisch', 'serif', 'wissenschaft', 'bildung'],
      rating: 4.1
    }
  },

  // FINANZ TEMPLATES
  {
    id: 'finance-trustworthy',
    title: 'Finance Trustworthy',
    description: 'Solides, zuverlässiges Design für Finanzwesen und Wirtschaftsprüfung',
    category: 'finanzen',
    config: {
      primaryColor: '#1e293b',
      accentColor: '#475569',
      fontFamily: 'Inter',
      fontSize: 'small',
      lineHeight: 1.5,
      margin: 'narrow'
    },
    metadata: {
      tags: ['finanzen', 'vertrauenswürdig', 'solid', 'wirtschaft'],
      rating: 4.2
    }
  }
];

// ============================================================================
// TEMPLATE-KATEGORIEN
// ============================================================================

/**
 * Template-Kategorien für bessere Organisation
 */
const templateCategories: TemplateCategory[] = [
  {
    id: 'klassisch',
    name: 'Klassisch & Zeitlos',
    description: 'Traditionelle Designs für konservative Branchen und formelle Bewerbungen',
    templates: ['klassisch-kompakt', 'klar-klassisch'],
    order: 1,
    visible: true
  },
  {
    id: 'modern-business',
    name: 'Modern Business',
    description: 'Zeitgemäße Designs für Unternehmen, Beratung und Tech-Branchen',
    templates: ['modern-business', 'modern-blau', 'consulting-professional', 'business-gruen'],
    order: 2,
    visible: true
  },
  {
    id: 'kreativ',
    name: 'Kreativ & Auffällig',
    description: 'Lebendige Designs für kreative Berufe, Designer und Start-ups',
    templates: ['kreativ-fokus', 'kreativ-lila', 'startup-dynamic', 'startup-dynamisch', 'warm-orange'],
    order: 3,
    visible: true
  },
  {
    id: 'tech',
    name: 'Tech & IT',
    description: 'Minimalistische Designs für IT-Professionals und Software-Entwickler',
    templates: ['tech-minimalist', 'tech-minimal'],
    order: 4,
    visible: true
  },
  {
    id: 'executive',
    name: 'Executive & Elegant',
    description: 'Hochwertige Designs für Führungskräfte und C-Level Positionen',
    templates: ['executive-elegant', 'elegant-grau'],
    order: 5,
    visible: true
  },
  {
    id: 'healthcare',
    name: 'Gesundheit & Soziales',
    description: 'Vertrauensvolle Designs für Gesundheitswesen und soziale Berufe',
    templates: ['healthcare-caring', 'healthcare-blaugruen'],
    order: 6,
    visible: true
  },
  {
    id: 'akademisch',
    name: 'Akademisch & Wissenschaft',
    description: 'Seriöse Designs für Bildung, Forschung und akademische Laufbahnen',
    templates: ['academic-research', 'academic-serif'],
    order: 7,
    visible: true
  },
  {
    id: 'finanzen',
    name: 'Finanzen & Banking',
    description: 'Solide Designs für Finanzwesen und Wirtschaftsprüfung',
    templates: ['finance-trustworthy'],
    order: 8,
    visible: true
  }
];

// ============================================================================
// REGISTRY-INITIALISIERUNG
// ============================================================================

/**
 * Initialisiert die Template-Registry mit allen verfügbaren Templates
 * Sollte beim App-Start aufgerufen werden
 */
function initializeTemplateRegistry(): void {
  try {
    // Registry leeren falls bereits initialisiert
    if (TemplateRegistry.isInitialized()) {
      console.log('[LayoutTemplates] Registry bereits initialisiert, überspringe...');
      return;
    }

    console.log('[LayoutTemplates] Initialisiere Template-Registry...');

    // Kategorien registrieren
    templateCategories.forEach(category => {
      try {
        TemplateRegistry.registerCategory(category);
      } catch (error) {
        console.warn(`[LayoutTemplates] Fehler beim Registrieren der Kategorie ${category.id}:`, error);
      }
    });

    // Templates registrieren
    TemplateRegistry.registerBatch(layoutTemplates);

    // Registry als initialisiert markieren
    TemplateRegistry.initialize();

    console.log(`[LayoutTemplates] Registry erfolgreich initialisiert mit ${layoutTemplates.length} Templates und ${templateCategories.length} Kategorien`);

    // Statistiken ausgeben
    const stats = TemplateRegistry.getStats();
    console.log('[LayoutTemplates] Registry-Statistiken:', stats);

  } catch (error) {
    console.error('[LayoutTemplates] Fehler bei Registry-Initialisierung:', error);
    throw error;
  }
}

// ============================================================================
// HELPER-FUNKTIONEN (RÜCKWÄRTSKOMPATIBILITÄT)
// ============================================================================

/**
 * Ruft ein Template anhand der ID ab
 * @deprecated Verwende TemplateRegistry.getById() direkt
 */
const getTemplateById = (id: string): DesignTemplate | undefined => {
  console.warn('[LayoutTemplates] getTemplateById ist deprecated. Verwende TemplateRegistry.getById()');
  return TemplateRegistry.getById(id);
};

/**
 * Ruft alle Templates ab
 * @deprecated Verwende TemplateRegistry.getAll() direkt
 */
const getAllTemplates = (): DesignTemplate[] => {
  console.warn('[LayoutTemplates] getAllTemplates ist deprecated. Verwende TemplateRegistry.getAll()');
  return TemplateRegistry.getAll();
};

/**
 * Ruft Templates nach Kategorie ab
 * @deprecated Verwende TemplateRegistry.getByCategory() direkt
 */
const getTemplatesByCategory = (categoryId: string): DesignTemplate[] => {
  console.warn('[LayoutTemplates] getTemplatesByCategory ist deprecated. Verwende TemplateRegistry.getByCategory()');
  return TemplateRegistry.getByCategory(categoryId);
};

/**
 * Ruft beliebte Templates ab
 * @deprecated Verwende TemplateRegistry.getPopular() direkt
 */
const getPopularTemplates = (): DesignTemplate[] => {
  console.warn('[LayoutTemplates] getPopularTemplates ist deprecated. Verwende TemplateRegistry.getPopular()');
  return TemplateRegistry.getPopular();
};

// ============================================================================
// ERWEITERTE UTILITY-FUNKTIONEN
// ============================================================================

/**
 * Sucht Templates nach Schriftart
 */
function getTemplatesByFont(fontFamily: string): DesignTemplate[] {
  return TemplateRegistry.search({ fontFamily });
}

/**
 * Sucht Templates nach Farbbereich
 */
function getTemplatesByColorRange(colorType: 'blue' | 'green' | 'purple' | 'orange' | 'neutral'): DesignTemplate[] {
  const colorRanges = {
    blue: ['#1e40af', '#3b82f6', '#06b6d4', '#0f766e', '#14b8a6'],
    green: ['#059669', '#10b981', '#0f766e', '#14b8a6'],
    purple: ['#7c3aed', '#a855f7', '#a855f7'],
    orange: ['#ea580c', '#f97316', '#dc2626', '#ef4444', '#d97706'],
    neutral: ['#000000', '#666666', '#374151', '#6b7280', '#1f2937', '#4b5563', '#9ca3af', '#475569']
  };

  const targetColors = colorRanges[colorType];
  return TemplateRegistry.getAll().filter(template =>
    targetColors.includes(template.config.primaryColor) ||
    targetColors.includes(template.config.accentColor)
  );
}

/**
 * Sucht Templates nach Tags
 */
function getTemplatesByTags(tags: string[]): DesignTemplate[] {
  return TemplateRegistry.search({ tags });
}

/**
 * Empfiehlt Templates basierend auf Beruf/Branche
 */
function getRecommendedTemplates(profession?: string, industry?: string): DesignTemplate[] {
  const recommendations: DesignTemplate[] = [];
  
  if (!profession && !industry) {
    return TemplateRegistry.getPopular(3);
  }

  const professionLower = profession?.toLowerCase() || '';
  const industryLower = industry?.toLowerCase() || '';

  // Tech/IT Empfehlungen
  if (professionLower.includes('developer') || professionLower.includes('engineer') || 
      professionLower.includes('programmer') || industryLower.includes('tech') || 
      industryLower.includes('software')) {
    recommendations.push(...TemplateRegistry.getByCategory('tech'));
    recommendations.push(...TemplateRegistry.search({ tags: ['tech', 'modern'] }));
  }

  // Design/Kreativ Empfehlungen
  else if (professionLower.includes('design') || professionLower.includes('creative') || 
           professionLower.includes('artist') || industryLower.includes('design')) {
    recommendations.push(...TemplateRegistry.getByCategory('kreativ'));
  }

  // Business/Consulting Empfehlungen
  else if (professionLower.includes('manager') || professionLower.includes('consultant') || 
           professionLower.includes('analyst') || industryLower.includes('consulting')) {
    recommendations.push(...TemplateRegistry.getByCategory('modern-business'));
  }

  // Healthcare Empfehlungen
  else if (professionLower.includes('doctor') || professionLower.includes('nurse') || 
           professionLower.includes('therapist') || industryLower.includes('healthcare')) {
    recommendations.push(...TemplateRegistry.getByCategory('healthcare'));
  }

  // Finance Empfehlungen
  else if (professionLower.includes('finance') || professionLower.includes('accountant') || 
           professionLower.includes('banker') || industryLower.includes('finance')) {
    recommendations.push(...TemplateRegistry.getByCategory('finanzen'));
  }

  // Academic Empfehlungen
  else if (professionLower.includes('professor') || professionLower.includes('researcher') || 
           professionLower.includes('scientist') || industryLower.includes('education')) {
    recommendations.push(...TemplateRegistry.getByCategory('akademisch'));
  }

  // Executive Empfehlungen
  else if (professionLower.includes('director') || professionLower.includes('ceo') || 
           professionLower.includes('executive') || professionLower.includes('president')) {
    recommendations.push(...TemplateRegistry.getByCategory('executive'));
  }

  // Fallback: Business Templates
  else {
    recommendations.push(...TemplateRegistry.getByCategory('modern-business'));
  }

  // Duplikate entfernen und auf 5 begrenzen
  const uniqueRecommendations = recommendations.filter((template, index, self) =>
    index === self.findIndex(t => t.id === template.id)
  );

  return uniqueRecommendations.slice(0, 5);
}

/**
 * Validiert alle Templates und gibt Bericht zurück
 */
function validateAllTemplates(): {
  valid: number;
  invalid: Array<{ id: string; errors: string[] }>;
  warnings: Array<{ id: string; warnings: string[] }>;
} {
  const results = {
    valid: 0,
    invalid: [] as Array<{ id: string; errors: string[] }>,
    warnings: [] as Array<{ id: string; warnings: string[] }>
  };

  layoutTemplates.forEach(template => {
    const validation = TemplateRegistry.validate(template);
    
    if (validation.isValid) {
      results.valid++;
    } else {
      results.invalid.push({
        id: template.id,
        errors: validation.errors
      });
    }

    if (validation.warnings && validation.warnings.length > 0) {
      results.warnings.push({
        id: template.id,
        warnings: validation.warnings
      });
    }
  });

  return results;
}

/**
 * Exportiert Template-Konfiguration als JSON
 */
function exportTemplateConfig(): string {
  return JSON.stringify({
    templates: layoutTemplates,
    categories: templateCategories,
    exportedAt: new Date().toISOString(),
    version: '1.0.0',
    stats: TemplateRegistry.getStats()
  }, null, 2);
}

/**
 * Lädt Template-Konfiguration aus JSON
 */
function importTemplateConfig(jsonData: string): void {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.templates && Array.isArray(data.templates)) {
      TemplateRegistry.clear();
      
      // Kategorien zuerst laden
      if (data.categories && Array.isArray(data.categories)) {
        data.categories.forEach((category: TemplateCategory) => {
          TemplateRegistry.registerCategory(category);
        });
      }
      
      // Templates laden
      TemplateRegistry.registerBatch(data.templates);
      TemplateRegistry.markInitialized();
      
      console.log('[LayoutTemplates] Konfiguration erfolgreich importiert');
    } else {
      throw new Error('Ungültiges JSON-Format: templates Array fehlt');
    }
  } catch (error) {
    console.error('[LayoutTemplates] Fehler beim Importieren der Konfiguration:', error);
    throw error;
  }
}

// ============================================================================
// AUTO-INITIALISIERUNG
// ============================================================================

// Registry automatisch beim Modul-Import initialisieren
if (typeof window !== 'undefined') {
  // Nur im Browser initialisieren
  try {
    initializeTemplateRegistry();
  } catch (error) {
    console.error('[LayoutTemplates] Fehler bei Auto-Initialisierung:', error);
  }
}

// ============================================================================
// EXPORTS
// ============================================================================

// Haupt-Exports
export {
  layoutTemplates,
  templateCategories,
  initializeTemplateRegistry
};

// Utility-Exports
export {
  getTemplatesByFont,
  getTemplatesByColorRange,
  getTemplatesByTags,
  getRecommendedTemplates,
  validateAllTemplates,
  exportTemplateConfig,
  importTemplateConfig
};

// Deprecated Exports (für Rückwärtskompatibilität)
export {
  getTemplateById,
  getAllTemplates,
  getTemplatesByCategory,
  getPopularTemplates
};

// Default Export
export default {
  templates: layoutTemplates,
  categories: templateCategories,
  initialize: initializeTemplateRegistry,
  registry: TemplateRegistry
};