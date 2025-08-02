/**
 * CV-Designer Module - Section Types
 * Phase 1: Core type definitions for CV sections and layout elements
 */

export enum SectionType {
  PERSONAL_DATA = 'personal_data',
  EXPERIENCE = 'experience',
  EDUCATION = 'education',
  SKILLS = 'skills',
  LANGUAGES = 'languages',
  CERTIFICATIONS = 'certifications',
  PROJECTS = 'projects',
  REFERENCES = 'references',
  CUSTOM = 'custom'
}

export enum LayoutElementType {
  TEXT = 'text',
  LIST = 'list',
  TABLE = 'table',
  IMAGE = 'image',
  SPACER = 'spacer',
  DIVIDER = 'divider'
}

export interface LayoutElement {
  id: string;
  type: LayoutElementType;
  content: string | string[] | Record<string, unknown>;
  styles?: Record<string, string | number>;
  metadata?: Record<string, unknown>;
}

export interface Section {
  id: string;
  type: SectionType;
  title: string;
  isVisible: boolean;
  order: number;
  elements: LayoutElement[];
  sectionStyles?: Record<string, string | number>;
  metadata?: Record<string, unknown>;
}

export interface SectionConfig {
  type: SectionType;
  defaultTitle: string;
  isRequired: boolean;
  allowMultiple: boolean;
  defaultElements: Omit<LayoutElement, 'id'>[];
}