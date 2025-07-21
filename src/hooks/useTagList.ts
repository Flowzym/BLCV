import { useState, useCallback } from 'react';

export interface UseTagListOptions {
  initialTags?: string[];
  allowDuplicates?: boolean;
  maxTags?: number;
  validateTag?: (tag: string) => boolean;
}

export interface UseTagListReturn {
  tags: string[];
  addTag: (tag: string) => boolean;
  removeTag: (tag: string) => void;
  updateTag: (oldTag: string, newTag: string) => boolean;
  clearTags: () => void;
  hasTag: (tag: string) => boolean;
}

/**
 * Generischer Hook für Tag-Verwaltung
 * Konsolidiert die gemeinsame Logik aus CompaniesTagInput, TasksTagInput, TagSelectorWithFavorites
 */
export function useTagList(options: UseTagListOptions = {}): UseTagListReturn {
  const {
    initialTags = [],
    allowDuplicates = false,
    maxTags,
    validateTag = () => true
  } = options;

  const [tags, setTags] = useState<string[]>(initialTags);

  const addTag = useCallback((tag: string): boolean => {
    const trimmedTag = tag.trim();
    
    // Validierung
    if (!trimmedTag || !validateTag(trimmedTag)) {
      return false;
    }
    
    // Duplikatsprüfung
    if (!allowDuplicates && tags.includes(trimmedTag)) {
      return false;
    }
    
    // Maximale Anzahl prüfen
    if (maxTags && tags.length >= maxTags) {
      return false;
    }
    
    setTags(prev => [...prev, trimmedTag]);
    return true;
  }, [tags, allowDuplicates, maxTags, validateTag]);

  const removeTag = useCallback((tag: string) => {
    setTags(prev => prev.filter(t => t !== tag));
  }, []);

  const updateTag = useCallback((oldTag: string, newTag: string): boolean => {
    const trimmedNewTag = newTag.trim();
    
    if (!trimmedNewTag || !validateTag(trimmedNewTag)) {
      return false;
    }
    
    if (!allowDuplicates && trimmedNewTag !== oldTag && tags.includes(trimmedNewTag)) {
      return false;
    }
    
    setTags(prev => prev.map(tag => tag === oldTag ? trimmedNewTag : tag));
    return true;
  }, [tags, allowDuplicates, validateTag]);

  const clearTags = useCallback(() => {
    setTags([]);
  }, []);

  const hasTag = useCallback((tag: string): boolean => {
    return tags.includes(tag);
  }, [tags]);

  return {
    tags,
    addTag,
    removeTag,
    updateTag,
    clearTags,
    hasTag
  };
}