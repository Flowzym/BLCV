/**
 * CV-Designer Module - Context Types
 * Phase 3: Type definitions for React Context integration
 */

import { SavedTemplate } from './template';

export interface CvContextType {
  // Template state
  templates: SavedTemplate[];
  isLoading: boolean;
  error: string | null;

  // Template actions
  saveTemplate: (
    template: Omit<SavedTemplate, 'id' | 'createdAt' | 'updatedAt'>
  ) => string;
  loadTemplate: (id: string) => SavedTemplate | null;
  deleteTemplate: (id: string) => boolean;
  updateTemplate: (
    id: string,
    updates: Partial<Omit<SavedTemplate, 'id' | 'createdAt'>>
  ) => boolean;

  // Export/Import operations
  exportAllTemplates: () => void;
  importTemplates: (file: File) => Promise<boolean>;
}

export interface CvProviderProps {
  children: React.ReactNode;
}
