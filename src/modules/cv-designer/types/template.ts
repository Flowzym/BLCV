/**
 * CV-Designer Module - Template Types
 * Phase 1: Core type definitions for CV templates and saved configurations
 */

import { Section } from './section';
import { StyleConfig, SectionStyleOverride } from './styles';

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

export interface SavedTemplate {
  metadata: TemplateMetadata;
  sections: Section[];
  styleConfig: StyleConfig;
  styleOverrides: SectionStyleOverride[];
  globalSettings: {
    pageFormat: 'A4' | 'Letter' | 'Custom';
    orientation: 'portrait' | 'landscape';
    language: string;
    timezone?: string;
  };
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