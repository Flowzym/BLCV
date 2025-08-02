/**
 * CV-Designer Module - Template Types
 * Phase 1-2: Core type definitions for CV templates and saved configurations
 */

import { Section } from './section';
import { StyleConfig } from './styles';

export interface SavedTemplate {
  id: string;
  name: string;
  sections: Section[];
  styles: StyleConfig;
  createdAt: string;
  updatedAt: string;
}

export interface TemplateMetadata {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  version: string;
  author?: string;
  isPublic: boolean;
}

export interface TemplatePreview {
  id: string;
  name: string;
  description?: string;
  category: string;
  tags: string[];
  thumbnailUrl?: string;
  previewData: {
    sectionsCount: number;
    hasCustomStyles: boolean;
    pageFormat: string;
  };
}

export interface TemplateCategory {
  id: string;
  name: string;
  description?: string;
  order: number;
  isDefault: boolean;
}

export interface TemplateFilter {
  categories?: string[];
  tags?: string[];
  searchTerm?: string;
  sortBy: 'name' | 'createdAt' | 'updatedAt' | 'popularity';
  sortOrder: 'asc' | 'desc';
}