/**
 * CV-Designer Module - Type Exports
 * Phase 1: Central export point for all module types
 */

// Section types
export type {
  Section,
  LayoutElement,
  SectionConfig
} from './section';

export {
  SectionType,
  LayoutElementType
} from './section';

// Style types
export type {
  StyleConfig,
  FontConfig,
  ColorConfig,
  SpacingConfig,
  BorderConfig,
  LayoutConfig,
  ElementStyleOverride,
  SectionStyleOverride
} from './styles';

// Template types
export type {
  SavedTemplate,
  TemplateMetadata,
  TemplatePreview,
  TemplateCategory,
  TemplateFilter
} from './template';

// Context types
export type {
  CvContextType,
  CvProviderProps
} from './context';