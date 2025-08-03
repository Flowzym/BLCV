/**
 * CV Designer Types
 * Core type definitions for the CV Designer module
 */

// Basic CV Data Structure
export interface CVData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    profession?: string;
    summary?: string;
    profileImage?: string;
  };
  workExperience: WorkExperience[];
  education: Education[];
  skills: Skill[];
  languages?: Language[];
  projects?: Project[];
  certifications?: Certification[];
}

export interface WorkExperience {
  id: string;
  position: string;
  company: string;
  location?: string;
  startDate: string;
  endDate: string;
  description: string;
  responsibilities?: string[];
  achievements?: string[];
  technologies?: string[];
}

export interface Education {
  id: string;
  degree: string;
  institution: string;
  location?: string;
  startDate: string;
  endDate: string;
  description?: string;
  grade?: string;
  fieldOfStudy?: string;
}

export interface Skill {
  id: string;
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category?: string;
}

export interface Language {
  id: string;
  name: string;
  level: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  technologies?: string[];
  url?: string;
  startDate?: string;
  endDate?: string;
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  url?: string;
}

// Style Configuration
export interface StyleConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: number;
  margin: 'compact' | 'normal' | 'wide';
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  sectionSpacing?: number;
  snapSize?: number;
  widthPercent?: number;
}

// Design Template
export interface DesignTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  tags: string[];
  layout: any[];
  style: StyleConfig;
  preview?: string;
}

// Mapped Section for Preview
export interface MappedSection {
  id: string;
  type: string;
  title: string;
  content?: string;
  data?: any;
  props?: {
    priority?: number;
    isFallback?: boolean;
  };
}

// Export Format
export type ExportFormat = 'pdf' | 'docx' | 'json' | 'html';

// Design Config (alias for StyleConfig for compatibility)
export type DesignConfig = StyleConfig;

// Add StyleConfig interface if not already present
export interface StyleConfig {
  primaryColor: string;
  accentColor: string;
  fontFamily: string;
  fontSize: 'small' | 'medium' | 'large';
  lineHeight: number;
  margin: 'compact' | 'normal' | 'wide';
  backgroundColor?: string;
  textColor?: string;
  borderRadius?: string;
  sectionSpacing?: number;
  snapSize?: number;
  widthPercent?: number;
  padding?: string;
  border?: string;
  boxShadow?: string;
}