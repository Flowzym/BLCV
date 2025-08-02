/**
 * CV-Designer Module - Services Exports
 * Phase 4: Export functionality for CV templates
 */

// DOCX Export
export {
  exportTemplateToDocx,
  validateTemplateForExport,
  type DocxExportOptions,
  type DocxExportResult
} from './exportLayoutDocx';

// PDF Export
export {
  exportTemplateToPdf,
  getPageDimensions,
  type PdfExportOptions,
  type PdfExportResult
} from './exportLayoutPdf';

// Re-export common types for convenience
export type { SavedTemplate } from '../types/template';
export type { StyleConfig } from '../types/styles';
export type { LayoutElement, Section, LayoutGroup } from '../types/section';