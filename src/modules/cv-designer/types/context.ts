// 📄 src/modules/cv-designer/types/context.ts

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
}

export interface CvProviderProps {
  children: React.ReactNode;
}
