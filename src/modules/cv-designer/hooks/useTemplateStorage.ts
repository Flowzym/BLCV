import { useState, useEffect, useCallback } from 'react';
import { SavedTemplate } from '../types/template';
import { exportTemplatesToFile, importTemplatesFromFile, validateTemplateFile } from '../utils/fileHelpers';

const STORAGE_KEY = 'cv-templates';

interface UseTemplateStorageReturn {
  templates: SavedTemplate[];
  saveTemplate: (template: Omit<SavedTemplate, 'id' | 'createdAt' | 'updatedAt'>) => string;
  loadTemplate: (id: string) => SavedTemplate | null;
  deleteTemplate: (id: string) => boolean;
  updateTemplate: (id: string, updates: Partial<Omit<SavedTemplate, 'id' | 'createdAt'>>) => boolean;
  isLoading: boolean;
  error: string | null;
  exportAllTemplates: () => void;
  importTemplates: (file: File) => Promise<boolean>;
}

/**
 * Hook for managing CV template storage using localStorage
 * Provides CRUD operations for SavedTemplate objects
 */
export function useTemplateStorage(): UseTemplateStorageReturn {
  const [templates, setTemplates] = useState<SavedTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load templates from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as SavedTemplate[];
        if (Array.isArray(parsed)) {
          setTemplates(parsed);
        } else {
          setError('Invalid template data format in storage');
        }
      }
    } catch (err) {
      setError('Failed to load templates from storage');
      console.error('Template storage load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save templates to localStorage whenever templates change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
        setError(null);
      } catch (err) {
        setError('Failed to save templates to storage');
        console.error('Template storage save error:', err);
      }
    }
  }, [templates, isLoading]);

  const saveTemplate = useCallback((templateData: Omit<SavedTemplate, 'id' | 'createdAt' | 'updatedAt'>): string => {
    const now = new Date().toISOString();
    const newTemplate: SavedTemplate = {
      ...templateData,
      id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: now,
      updatedAt: now
    };

    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate.id;
  }, []);

  const loadTemplate = useCallback((id: string): SavedTemplate | null => {
    return templates.find(template => template.id === id) || null;
  }, [templates]);

  const deleteTemplate = useCallback((id: string): boolean => {
    const templateExists = templates.some(template => template.id === id);
    if (templateExists) {
      setTemplates(prev => prev.filter(template => template.id !== id));
      return true;
    }
    return false;
  }, [templates]);

  const updateTemplate = useCallback((
    id: string, 
    updates: Partial<Omit<SavedTemplate, 'id' | 'createdAt'>>
  ): boolean => {
    const templateIndex = templates.findIndex(template => template.id === id);
    if (templateIndex === -1) {
      return false;
    }

    setTemplates(prev => prev.map(template => 
      template.id === id 
        ? { 
            ...template, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          }
        : template
    ));
    return true;
  }, [templates]);

  const exportAllTemplates = useCallback(() => {
    try {
      setError(null);
      exportTemplatesToFile(templates);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown export error';
      setError(`Export failed: ${errorMessage}`);
      console.error('Template export error:', err);
    }
  }, [templates]);

  const importTemplates = useCallback(async (file: File): Promise<boolean> => {
    setError(null);
    
    try {
      // Validate file first
      const validation = validateTemplateFile(file);
      if (!validation.isValid) {
        setError(`Import failed: ${validation.error}`);
        return false;
      }

      // Import templates from file
      const importedTemplates = await importTemplatesFromFile(file);
      
      // Generate new IDs to avoid conflicts and update timestamps
      const templatesWithNewIds = importedTemplates.map(template => ({
        ...template,
        id: `template_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Add to existing templates
      const updatedTemplates = [...templates, ...templatesWithNewIds];
      setTemplates(updatedTemplates);
      
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown import error';
      setError(`Import failed: ${errorMessage}`);
      console.error('Template import error:', err);
      return false;
    }
  }, [templates]);

  return {
    templates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    updateTemplate,
    exportAllTemplates,
    importTemplates,
    isLoading,
    error
  };
}