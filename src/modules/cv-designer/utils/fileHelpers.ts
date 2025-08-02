/**
 * CV-Designer Module - File Helper Utilities
 * Phase 5: File export/import functionality for templates
 */

import { SavedTemplate } from '../types/template';

/**
 * Export data structure for template files
 */
interface TemplateExportData {
  version: string;
  exportedAt: string;
  templateCount: number;
  templates: SavedTemplate[];
}

/**
 * Export templates to JSON file
 * 
 * @param templates - Array of SavedTemplate objects to export
 * @param filename - Optional custom filename (defaults to timestamped name)
 */
export function exportTemplatesToFile(
  templates: SavedTemplate[], 
  filename?: string
): void {
  const exportData: TemplateExportData = {
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    templateCount: templates.length,
    templates
  };

  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename || `cv-templates-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Import templates from JSON file
 * 
 * @param file - File object containing template JSON data
 * @returns Promise<SavedTemplate[]> - Array of imported templates
 * @throws Error if file format is invalid or parsing fails
 */
export async function importTemplatesFromFile(file: File): Promise<SavedTemplate[]> {
  if (!file) {
    throw new Error('No file provided for import');
  }

  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    throw new Error('Invalid file type. Please provide a JSON file.');
  }

  try {
    const fileContent = await file.text();
    const parsed = JSON.parse(fileContent);

    // Validate export data structure
    if (!parsed.templates || !Array.isArray(parsed.templates)) {
      throw new Error('Invalid template export format. Missing or invalid templates array.');
    }

    // Validate each template structure
    const validatedTemplates: SavedTemplate[] = [];
    
    for (let i = 0; i < parsed.templates.length; i++) {
      const template = parsed.templates[i];
      
      // Basic validation
      if (!template.id || typeof template.id !== 'string') {
        throw new Error(`Template ${i + 1}: Invalid or missing ID`);
      }
      
      if (!template.name || typeof template.name !== 'string') {
        throw new Error(`Template ${i + 1}: Invalid or missing name`);
      }
      
      if (!template.category || typeof template.category !== 'string') {
        throw new Error(`Template ${i + 1}: Invalid or missing category`);
      }
      
      if (!Array.isArray(template.layout)) {
        throw new Error(`Template ${i + 1}: Invalid layout structure`);
      }
      
      if (!template.style || typeof template.style !== 'object') {
        throw new Error(`Template ${i + 1}: Invalid style configuration`);
      }
      
      if (!Array.isArray(template.sections)) {
        throw new Error(`Template ${i + 1}: Invalid sections structure`);
      }
      
      if (!Array.isArray(template.tags)) {
        throw new Error(`Template ${i + 1}: Invalid tags structure`);
      }

      // Ensure required metadata exists
      const validatedTemplate: SavedTemplate = {
        ...template,
        metadata: {
          version: '1.0.0',
          author: 'Imported',
          complexity: 'medium',
          usageCount: 0,
          tags: template.tags || [],
          isPublic: false,
          ...template.metadata
        },
        isFavorite: Boolean(template.isFavorite),
        createdAt: template.createdAt || new Date().toISOString(),
        updatedAt: template.updatedAt || new Date().toISOString()
      };

      validatedTemplates.push(validatedTemplate);
    }

    return validatedTemplates;

  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error('Invalid JSON format. Please check the file content.');
    }
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred during template import');
  }
}

/**
 * Validate file before import attempt
 * 
 * @param file - File to validate
 * @returns Object with validation result and error message if invalid
 */
export function validateTemplateFile(file: File): { isValid: boolean; error?: string } {
  if (!file) {
    return { isValid: false, error: 'No file provided' };
  }

  if (file.size === 0) {
    return { isValid: false, error: 'File is empty' };
  }

  if (file.size > 10 * 1024 * 1024) { // 10MB limit
    return { isValid: false, error: 'File is too large (maximum 10MB)' };
  }

  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    return { isValid: false, error: 'Invalid file type. Please provide a JSON file.' };
  }

  return { isValid: true };
}

/**
 * Generate a safe filename for template export
 * 
 * @param baseName - Base name for the file
 * @param templateCount - Number of templates being exported
 * @returns Safe filename string
 */
export function generateExportFilename(baseName?: string, templateCount?: number): string {
  const timestamp = new Date().toISOString().split('T')[0];
  const countSuffix = templateCount ? `-${templateCount}templates` : '';
  const safeName = baseName ? baseName.replace(/[^a-zA-Z0-9-_]/g, '-') : 'cv-templates';
  
  return `${safeName}${countSuffix}-${timestamp}.json`;
}