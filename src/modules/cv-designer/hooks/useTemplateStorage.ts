import { useState, useEffect, useCallback } from 'react';
import { SavedTemplate } from '../types/template';

const STORAGE_KEY = 'cv-templates';

interface UseTemplateStorageReturn {
  templates: SavedTemplate[];
  saveTemplate: (template: Omit<SavedTemplate, 'id' | 'createdAt' | 'updatedAt'>) => string;
  loadTemplate: (id: string) => SavedTemplate | null;
  deleteTemplate: (id: string) => boolean;
  updateTemplate: (id: string, updates: Partial<Omit<SavedTemplate, 'id' | 'createdAt'>>) => boolean;
  isLoading: boolean;
  error: string | null;
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

  return {
    templates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    updateTemplate,
    isLoading,
    error
  };
}