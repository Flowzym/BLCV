/**
 * Typography Context
 * Dedicated context for managing typography settings across CV sections and fields
 */

import React, { createContext, useContext, useReducer, useCallback, useEffect, ReactNode } from 'react';
import { loadCVSuggestions, CVSuggestionConfig, ProfileSourceMapping } from '../services/supabaseService';
import { deepMerge } from '@/lib/utils';

// Types
interface PersonalData {
  [key: string]: any;
}

interface Experience {
  id: string;
  companies: string[];
  position: string[];
  startMonth: string | null;
  startYear: string | null;
  endMonth: string | null;
  endYear: string | null;
  isCurrent: boolean;
  aufgabenbereiche: string[];
  zusatzangaben: string;
  leasingCompaniesList?: string[];
}

interface Education {
  id: string;
  institution: string[];
  ausbildungsart: string[];
  abschluss: string[];
  startMonth: string | null;
  startYear: string | null;
  endMonth: string | null;
  endYear: string | null;
  isCurrent: boolean;
  zusatzangaben: string;
}

type PreviewTab = 'gesamt' | 'profil' | 'erfahrung' | 'ausbildung' | 'kenntnisse' | 'softskills';
type ActiveTab = 'personal' | 'experience' | 'education' | 'skills' | 'softskills';

const INPUT_TO_PREVIEW_TAB_MAP: Record<ActiveTab, PreviewTab> = {
  'personal': 'profil',
  'experience': 'erfahrung',
  'education': 'ausbildung',
  'skills': 'kenntnisse',
  'softskills': 'softskills'
};

const PREVIEW_TO_INPUT_TAB_MAP: Record<PreviewTab, ActiveTab> = {
  'gesamt': 'personal',
  'profil': 'personal',
  'erfahrung': 'experience',
  'ausbildung': 'education',
  'kenntnisse': 'skills',
  'softskills': 'softskills'
};

interface LebenslaufContextType {
  personalData: PersonalData;
  berufserfahrung: Experience[];
  ausbildung: Education[];
  selectedExperienceId: string;
  selectedEducationId: string;
  multiSelectedExperienceIds: string[];
  favoriteTasks: string[];
  favoriteCompanies: string[];
  favoritePositions: string[];
  favoriteInstitutions: string[];
  favoriteAusbildungsarten: string[];
  favoriteAbschluesse: string[];
  favoriteCities: string[];
  favoriteLeasingCompanies: string[];
  isBisTranslatorActive: boolean;
  selectedBisTasks: string[];
  bisTranslatorResults: Record<string, string[]>;
  previewTab: PreviewTab;
  activeTab: ActiveTab;
  cvSuggestions: any;
  
  // Personal data methods
  updatePersonalData: (data: PersonalData) => void;
  
  // Experience methods
  addExperience: (experience: Partial<Experience>) => void;
  updateExperience: (id: string, experience: Partial<Experience>) => void;
  selectExperience: (id: string) => void;
  toggleMultiExperienceSelection: (id: string) => void;
  deleteExperience: (id: string) => void;
  updateExperienceField: (id: string, field: string, value: any) => void;
  updateExperienceTask: (id: string, taskIndex: number, newTask: string) => void;
  updateExperienceTasksOrder: (id: string, newTasks: string[]) => void;
  addExperienceTask: (id: string, task: string) => void;
  updateExperienceZeitraum: (id: string, zeitraumData: any) => void;
  
  // Education methods
  addEducation: (education: Partial<Education>) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  selectEducation: (id: string) => void;
  deleteEducation: (id: string) => void;
  updateEducationField: (id: string, field: string, value: any) => void;
  updateEducationZeitraum: (id: string, zeitraumData: any) => void;
  
  // Task methods
  toggleFavoriteTask: (task: string) => void;
  toggleFavoriteCompany: (company: string) => void;
  toggleFavoritePosition: (position: string) => void;
  toggleFavoriteInstitution: (institution: string) => void;
  toggleFavoriteAusbildungsart: (ausbildungsart: string) => void;
  toggleFavoriteAbschluss: (abschluss: string) => void;
  toggleFavoriteCity: (city: string) => void;
  toggleFavoriteLeasingCompany: (company: string) => void;
  
  // BIS methods
  setIsBisTranslatorActive: (active: boolean) => void;
  toggleBisTaskSelection: (task: string) => void;
  setBisTranslatorResults: (results: Record<string, string[]>) => void;
  
  // Preview tab methods
  setPreviewTab: (tab: PreviewTab) => void;
  
  // Active tab methods
  setActiveTab: (tab: ActiveTab) => void;
  
  // Tab synchronization methods
  setActiveTabWithSync: (tab: ActiveTab) => void;
  setPreviewTabWithSync: (tab: PreviewTab) => void;
  
  // Helper methods to ensure valid entries exist
  ensureSelectedExperienceExists: () => string;
  ensureSelectedEducationExists: () => string;
  isEmptyExperience: (exp: Experience) => boolean;
  isEmptyEducation: (edu: Education) => boolean;
}

const LebenslaufContext = createContext<LebenslaufContextType | undefined>(undefined);

// ============================================================================
// TYPOGRAPHY TYPES
// ============================================================================

export interface TypographyConfig {
  fontFamily?: string;
  fontSize?: number; // in px
  fontWeight?: 'normal' | 'bold' | number;
  italic?: boolean;
  letterSpacing?: number; // in px
  lineHeight?: number; // multiplier (e.g., 1.6)
  textColor?: string; // hex color
}

export interface SectionTypography {
  [fieldKey: string]: TypographyConfig;
}

export interface TypographyState {
  sections: {
    [sectionId: string]: SectionTypography;
  };
  batchedUpdates: Array<{
    sectionId: string;
    fieldKey: string;
    config: Partial<TypographyConfig>;
    timestamp: number;
  }>;
}

// ============================================================================
// TYPOGRAPHY ACTIONS
// ============================================================================

type TypographyAction =
  | {
      type: 'UPDATE_TYPOGRAPHY';
      payload: {
        sectionId: string;
        fieldKey: string;
        config: Partial<TypographyConfig>;
      };
    }
  | {
      type: 'BATCH_UPDATE_TYPOGRAPHY';
      payload: {
        updates: Array<{
          sectionId: string;
          fieldKey: string;
          config: Partial<TypographyConfig>;
        }>;
      };
    }
  | {
      type: 'RESET_TYPOGRAPHY';
      payload: {
        sectionId: string;
        fieldKey?: string;
      };
    }
  | {
      type: 'BULK_UPDATE';
      payload: Partial<TypographyState>;
    }
  | {
      type: 'RESET_ALL';
    }
  | {
      type: 'FLUSH_BATCH';
    };

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const defaultTypographyConfig: TypographyConfig = {
  fontFamily: 'Inter',
  fontSize: 12,
  fontWeight: 'normal',
  italic: false,
  letterSpacing: 0,
  lineHeight: 1.6,
  textColor: '#333333'
};

const defaultSectionConfigs: Record<string, SectionTypography> = {
  profil: {
    header: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 'bold',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#1e40af'
    },
    name: {
      fontFamily: 'Inter',
      fontSize: 20,
      fontWeight: 'bold',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.2,
      textColor: '#1e40af'
    },
    content: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 'normal',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.6,
      textColor: '#333333'
    }
  },
  erfahrung: {
    header: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 'bold',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#1e40af'
    },
    position: {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 'bold',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#333333'
    },
    company: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 'normal',
      italic: true,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#6b7280'
    },
    content: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 'normal',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.6,
      textColor: '#333333'
    }
  },
  ausbildung: {
    header: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 'bold',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#1e40af'
    },
    degree: {
      fontFamily: 'Inter',
      fontSize: 14,
      fontWeight: 'bold',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#333333'
    },
    institution: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 'normal',
      italic: true,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#6b7280'
    },
    content: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 'normal',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.6,
      textColor: '#333333'
    }
  },
  kenntnisse: {
    header: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 'bold',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#1e40af'
    },
    skillname: {
      fontFamily: 'Inter',
      fontSize: 11,
      fontWeight: 'normal',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#ffffff'
    },
    content: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 'normal',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.6,
      textColor: '#333333'
    }
  },
  softskills: {
    header: {
      fontFamily: 'Inter',
      fontSize: 16,
      fontWeight: 'bold',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#1e40af'
    },
    skillname: {
      fontFamily: 'Inter',
      fontSize: 11,
      fontWeight: 'normal',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.4,
      textColor: '#ffffff'
    },
    content: {
      fontFamily: 'Inter',
      fontSize: 12,
      fontWeight: 'normal',
      italic: false,
      letterSpacing: 0,
      lineHeight: 1.6,
      textColor: '#333333'
    }
  }
};

const initialTypographyState: TypographyState = {
  sections: defaultSectionConfigs,
  batchedUpdates: []
};

// ============================================================================
// TYPOGRAPHY REDUCER WITH BATCHING
// ============================================================================

function typographyReducer(state: TypographyState, action: TypographyAction): TypographyState {
  switch (action.type) {
    case 'UPDATE_TYPOGRAPHY': {
      const { sectionId, fieldKey, config } = action.payload;
      
      // Add to batch for potential batching
      const batchedUpdate = {
        sectionId,
        fieldKey,
        config,
        timestamp: Date.now()
      };
      
      // Ensure section exists
      const currentSection = state.sections[sectionId] || {};
      const currentField = currentSection[fieldKey] || {};
      
      // Deep merge the typography config for this specific field
      const updatedField = { ...currentField, ...config };
      
      return {
        ...state,
        sections: {
          ...state.sections,
          [sectionId]: {
            ...currentSection,
            [fieldKey]: updatedField
          }
        },
        batchedUpdates: [...state.batchedUpdates, batchedUpdate]
      };
    }

    case 'BATCH_UPDATE_TYPOGRAPHY': {
      const { updates } = action.payload;
      let newSections = { ...state.sections };
      
      updates.forEach(({ sectionId, fieldKey, config }) => {
        const currentSection = newSections[sectionId] || {};
        const currentField = currentSection[fieldKey] || {};
        const updatedField = { ...currentField, ...config };
        
        newSections = {
          ...newSections,
          [sectionId]: {
            ...currentSection,
            [fieldKey]: updatedField
          }
        };
      });
      
      return {
        ...state,
        sections: newSections,
        batchedUpdates: []
      };
    }

    case 'RESET_TYPOGRAPHY': {
      const { sectionId, fieldKey } = action.payload;
      
      if (fieldKey) {
        // Reset specific field to default
        const defaultConfig = defaultSectionConfigs[sectionId]?.[fieldKey] || defaultTypographyConfig;
        
        return {
          ...state,
          sections: {
            ...state.sections,
            [sectionId]: {
              ...state.sections[sectionId],
              [fieldKey]: { ...defaultConfig }
            }
          }
        };
      } else {
        // Reset entire section to defaults
        const defaultSection = defaultSectionConfigs[sectionId] || {};
        
        return {
          ...state,
          sections: {
            ...state.sections,
            [sectionId]: { ...defaultSection }
          }
        };
      }
    }

    case 'BULK_UPDATE': {
      return { ...state, ...action.payload };
    }

    case 'RESET_ALL': {
      return {
        sections: JSON.parse(JSON.stringify(defaultSectionConfigs)),
        batchedUpdates: []
      };
    }

    case 'FLUSH_BATCH': {
      return {
        ...state,
        batchedUpdates: []
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// TYPOGRAPHY CONTEXT
// ============================================================================

interface TypographyContextValue {
  state: TypographyState;
  updateTypography: (sectionId: string, fieldKey: string, config: Partial<TypographyConfig>) => void;
  batchUpdateTypography: (updates: Array<{
    sectionId: string;
    fieldKey: string;
    config: Partial<TypographyConfig>;
  }>) => void;
  resetTypography: (sectionId: string, fieldKey?: string) => void;
  bulkUpdate: (updates: Partial<TypographyState>) => void;
  resetAll: () => void;
  getTypography: (sectionId: string, fieldKey: string) => TypographyConfig;
  getEffectiveTypography: (sectionId: string, fieldKey: string) => TypographyConfig;
  hasCustomTypography: (sectionId: string, fieldKey: string) => boolean;
  flushBatch: () => void;
}

const TypographyContext = createContext<TypographyContextValue | undefined>(undefined);

// ============================================================================
// TYPOGRAPHY PROVIDER
// ============================================================================

interface TypographyProviderProps {
  children: ReactNode;
  initialTypography?: Partial<TypographyState>;
}

export const TypographyProvider: React.FC<TypographyProviderProps> = ({
  children,
  initialTypography
}) => {
  const [state, dispatch] = useReducer(
    typographyReducer,
    initialTypography ? { ...initialTypographyState, ...initialTypography } : initialTypographyState
  );

  // Batch processing with debouncing
  useEffect(() => {
    if (state.batchedUpdates.length === 0) return;
    
    const timer = setTimeout(() => {
      dispatch({ type: 'FLUSH_BATCH' });
    }, 100); // 100ms debounce
    
    return () => clearTimeout(timer);
  }, [state.batchedUpdates]);

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const updateTypography = useCallback((
    sectionId: string,
    fieldKey: string,
    config: Partial<TypographyConfig>
  ) => {
    console.log(`🔧 TypographyContext: updateTypography ${sectionId}.${fieldKey}`, config);
    dispatch({
      type: 'UPDATE_TYPOGRAPHY',
      payload: { sectionId, fieldKey, config }
    });
  }, []);

  const batchUpdateTypography = useCallback((updates: Array<{
    sectionId: string;
    fieldKey: string;
    config: Partial<TypographyConfig>;
  }>) => {
    console.log('🔧 TypographyContext: batchUpdateTypography', updates);
    dispatch({
      type: 'BATCH_UPDATE_TYPOGRAPHY',
      payload: { updates }
    });
  }, []);

  const resetTypography = useCallback((sectionId: string, fieldKey?: string) => {
    console.log(`🔄 TypographyContext: resetTypography ${sectionId}.${fieldKey || 'all'}`);
    dispatch({
      type: 'RESET_TYPOGRAPHY',
      payload: { sectionId, fieldKey }
    });
  }, []);

  const bulkUpdate = useCallback((updates: Partial<TypographyState>) => {
    console.log('🔧 TypographyContext: bulkUpdate', updates);
    dispatch({
      type: 'BULK_UPDATE',
      payload: updates
    });
  }, []);

  const resetAll = useCallback(() => {
    console.log('🔄 TypographyContext: resetAll');
    dispatch({ type: 'RESET_ALL' });
  }, []);

  const flushBatch = useCallback(() => {
    dispatch({ type: 'FLUSH_BATCH' });
  }, []);

  // ============================================================================
  // GETTERS
  // ============================================================================

  const getTypography = useCallback((sectionId: string, fieldKey: string): TypographyConfig => {
    return state.sections[sectionId]?.[fieldKey] || defaultTypographyConfig;
  }, [state.sections]);

  const getEffectiveTypography = useCallback((sectionId: string, fieldKey: string): TypographyConfig => {
    const sectionConfig = state.sections[sectionId];
    if (!sectionConfig) {
      return defaultTypographyConfig;
    }

    const fieldConfig = sectionConfig[fieldKey];
    if (!fieldConfig) {
      // Try to inherit from section's content config
      const contentConfig = sectionConfig.content;
      if (contentConfig) {
        return { ...defaultTypographyConfig, ...contentConfig };
      }
      return defaultTypographyConfig;
    }

    // Merge with defaults to ensure all properties are defined
    return { ...defaultTypographyConfig, ...fieldConfig };
  }, [state.sections]);

  const hasCustomTypography = useCallback((sectionId: string, fieldKey: string): boolean => {
    const config = state.sections[sectionId]?.[fieldKey];
    if (!config) return false;

    const defaultConfig = defaultSectionConfigs[sectionId]?.[fieldKey] || defaultTypographyConfig;
    
    // Check if any property differs from default
    return Object.keys(config).some(key => {
      const configKey = key as keyof TypographyConfig;
      return config[configKey] !== defaultConfig[configKey];
    });
  }, [state.sections]);

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: TypographyContextValue = {
    state,
    updateTypography,
    batchUpdateTypography,
    resetTypography,
    bulkUpdate,
    resetAll,
    getTypography,
    getEffectiveTypography,
    hasCustomTypography,
    flushBatch
  };

  return (
    <TypographyContext.Provider value={contextValue}>
      {children}
    </TypographyContext.Provider>
  );
};

// ============================================================================
// TYPOGRAPHY HOOKS
// ============================================================================

export function useTypography(
  sectionId: string,
  fieldKey?: string
): [TypographyConfig, (config: Partial<TypographyConfig>) => void] {
  const context = useContext(TypographyContext);
  
  if (!context) {
    throw new Error('useTypography must be used within a TypographyProvider');
  }

  const { getEffectiveTypography, updateTypography } = context;
  
  // Use 'content' as default fieldKey if not provided
  const effectiveFieldKey = fieldKey || 'content';
  
  // Get current typography config
  const currentConfig = getEffectiveTypography(sectionId, effectiveFieldKey);
  
  // Create update function
  const updateConfig = useCallback((config: Partial<TypographyConfig>) => {
    updateTypography(sectionId, effectiveFieldKey, config);
  }, [sectionId, effectiveFieldKey, updateTypography]);

  return [currentConfig, updateConfig];
}

export function useTypographyContext(): TypographyContextValue {
  const context = useContext(TypographyContext);
  
  if (!context) {
    throw new Error('useTypographyContext must be used within a TypographyProvider');
  }
  
  return context;
}

export function useHasCustomTypography(sectionId: string, fieldKey: string): boolean {
  const { hasCustomTypography } = useTypographyContext();
  return hasCustomTypography(sectionId, fieldKey);
}

export function useResetTypography() {
  const { resetTypography, resetAll } = useTypographyContext();
  
  return {
    resetField: (sectionId: string, fieldKey: string) => resetTypography(sectionId, fieldKey),
    resetSection: (sectionId: string) => resetTypography(sectionId),
    resetAll
  };
}

export function useBulkTypography() {
  const { bulkUpdate, state, batchUpdateTypography } = useTypographyContext();
  
  const importTypography = useCallback((typographyData: Partial<TypographyState>) => {
    bulkUpdate(typographyData);
  }, [bulkUpdate]);
  
  const exportTypography = useCallback((): TypographyState => {
    return JSON.parse(JSON.stringify(state));
  }, [state]);
  
  const applyTypographyPreset = useCallback((preset: Partial<TypographyState>) => {
    bulkUpdate(preset);
  }, [bulkUpdate]);
  
  const batchUpdate = useCallback((updates: Array<{
    sectionId: string;
    fieldKey: string;
    config: Partial<TypographyConfig>;
  }>) => {
    batchUpdateTypography(updates);
  }, [batchUpdateTypography]);
  
  return {
    importTypography,
    exportTypography,
    applyTypographyPreset,
    batchUpdate
  };
}

export function LebenslaufProvider({ children }: { children: ReactNode }) {
  const [profileSourceMappings] = useState<ProfileSourceMapping[]>(() => {
    try {
      const saved = localStorage.getItem('profileSourceMappings');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading profileSourceMappings:', error);
      return [];
    }
  });

  const [personalData, setPersonalData] = useState<PersonalData>({});
  const [berufserfahrung, setBerufserfahrung] = useState<Experience[]>([]);
  const [ausbildung, setAusbildung] = useState<Education[]>([]);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>('');
  const [selectedEducationId, setSelectedEducationId] = useState<string>('');
  const [multiSelectedExperienceIds, setMultiSelectedExperienceIds] = useState<string[]>([]);
  const [favoriteTasks, setFavoriteTasks] = useState<string[]>([]);
  const [favoriteCompanies, setFavoriteCompanies] = useState<string[]>([]);
  const [favoritePositions, setFavoritePositions] = useState<string[]>([]);
  const [favoriteInstitutions, setFavoriteInstitutions] = useState<string[]>([]);
  const [favoriteAusbildungsarten, setFavoriteAusbildungsarten] = useState<string[]>([]);
  const [favoriteAbschluesse, setFavoriteAbschluesse] = useState<string[]>([]);
  const [favoriteCities, setFavoriteCities] = useState<string[]>([]);
  const [favoriteLeasingCompanies, setFavoriteLeasingCompanies] = useState<string[]>([]);
  const [isBisTranslatorActive, setIsBisTranslatorActive] = useState<boolean>(false);
  const [selectedBisTasks, setSelectedBisTasks] = useState<string[]>([]);
  const [bisTranslatorResults, setBisTranslatorResults] = useState<Record<string, string[]>>({});
  const [previewTab, setPreviewTab] = useState<PreviewTab>('gesamt');
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
  const [cvSuggestions, setCvSuggestions] = useState<CVSuggestionConfig>({
    companies: [],
    positions: [],
    aufgabenbereiche: []
  });

  // Zeitraum update methods - moved to top to avoid ReferenceError
  const updateExperienceZeitraum = useCallback((id: string, zeitraumData: {
    startMonth?: string;
    startYear?: string;
    endMonth?: string;
    endYear?: string;
    isCurrent?: boolean;
  }) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id ? {
        ...exp,
        startMonth: zeitraumData.startMonth !== undefined ? zeitraumData.startMonth : exp.startMonth,
        startYear: zeitraumData.startYear !== undefined ? zeitraumData.startYear : exp.startYear,
        endMonth: zeitraumData.endMonth !== undefined ? zeitraumData.endMonth : exp.endMonth,
        endYear: zeitraumData.endYear !== undefined ? zeitraumData.endYear : exp.endYear,
        isCurrent: zeitraumData.isCurrent !== undefined ? zeitraumData.isCurrent : exp.isCurrent,
      } : exp
    ));
  }, []);

  const updateEducationZeitraum = useCallback((id: string, zeitraumData: {
    startMonth?: string;
    startYear?: string;
    endMonth?: string;
    endYear?: string;
    isCurrent?: boolean;
  }) => {
    setAusbildung(prev => prev.map(edu => 
      edu.id === id ? {
        ...edu,
        startMonth: zeitraumData.startMonth !== undefined ? zeitraumData.startMonth : edu.startMonth,
        startYear: zeitraumData.startYear !== undefined ? zeitraumData.startYear : edu.startYear,
        endMonth: zeitraumData.endMonth !== undefined ? zeitraumData.endMonth : edu.endMonth,
        endYear: zeitraumData.endYear !== undefined ? zeitraumData.endYear : edu.endYear,
        isCurrent: zeitraumData.isCurrent !== undefined ? zeitraumData.isCurrent : edu.isCurrent,
      } : edu
    ));
  }, []);

  // Load CV suggestions from Supabase
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const suggestions = await loadCVSuggestions(profileSourceMappings);
        setCvSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load CV suggestions:', error);
        // Keep default empty suggestions on error
      }
    };

    loadSuggestions();
  }, [profileSourceMappings]);

  // Tab synchronization methods
  const setActiveTabWithSync = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    const correspondingPreviewTab = INPUT_TO_PREVIEW_TAB_MAP[tab];
    setPreviewTab(correspondingPreviewTab);
  }, []);
  
  const setPreviewTabWithSync = useCallback((tab: PreviewTab) => {
    setPreviewTab(tab);
    const correspondingInputTab = PREVIEW_TO_INPUT_TAB_MAP[tab];
    setActiveTab(correspondingInputTab);
  }, []);

  // Personal data methods
  const updatePersonalData = (data: PersonalData) => {
    setPersonalData(data);
  };

  // Experience methods
  const addExperience = (experience: Partial<Experience>) => {
    // Check if there's already an empty experience that's not selected
    const existingEmptyExp = berufserfahrung.find(exp => 
      isEmptyExperience(exp) && exp.id !== selectedExperienceId
    );
    
    // If there's an existing empty experience, select it instead of creating a new one
    if (existingEmptyExp) {
      setSelectedExperienceId(existingEmptyExp.id);
      return existingEmptyExp.id;
    }
    
    const newExperience: Experience = {
      id: Date.now().toString(),
      companies: experience.companies || [],
      position: experience.position || [],
      startMonth: experience.startMonth || null,
      startYear: experience.startYear || null,
      endMonth: experience.endMonth || null,
      endYear: experience.endYear || null,
      isCurrent: experience.isCurrent || false,
      aufgabenbereiche: experience.aufgabenbereiche || [],
      zusatzangaben: experience.zusatzangaben || '',
      leasingCompaniesList: experience.leasingCompaniesList || []
    };
    setBerufserfahrung(prev => [...prev, newExperience]);
    setSelectedExperienceId(newExperience.id); // Immediately select the new entry
    return newExperience.id;
  };

  const updateExperience = (id: string, experience: Partial<Experience>) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id ? { ...exp, ...experience } : exp
    ));
  };

  const selectExperience = (id: string) => {
    // If switching away from a currently selected empty experience, delete it
    if (selectedExperienceId && selectedExperienceId !== id) {
      const currentExp = berufserfahrung.find(exp => exp.id === selectedExperienceId);
      if (currentExp && isEmptyExperience(currentExp)) {
        setBerufserfahrung(prev => prev.filter(exp => exp.id !== selectedExperienceId));
        setMultiSelectedExperienceIds(prev => prev.filter(expId => expId !== selectedExperienceId));
      }
    }
    
    setSelectedExperienceId(id);
  };

  const toggleMultiExperienceSelection = (id: string) => {
    setMultiSelectedExperienceIds(prev => 
      prev.includes(id) 
        ? prev.filter(expId => expId !== id)
        : [...prev, id]
    );
  };

  const deleteExperience = (id: string) => {
    setBerufserfahrung(prev => prev.filter(exp => exp.id !== id));
    setMultiSelectedExperienceIds(prev => prev.filter(expId => expId !== id));
  };

  const updateExperienceField = (id: string, field: string, value: any) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const updateExperienceTask = (id: string, taskIndex: number, newTask: string) => {
    setBerufserfahrung(prev => prev.map(exp => {
      if (exp.id === id && exp.aufgabenbereiche) {
        const newTasks = [...exp.aufgabenbereiche];
        newTasks[taskIndex] = newTask;
        return { ...exp, aufgabenbereiche: newTasks };
      }
      return exp;
    }));
  };

  const updateExperienceTasksOrder = (id: string, newTasks: string[]) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id ? { ...exp, aufgabenbereiche: newTasks } : exp
    ));
  };

  const addExperienceTask = (id: string, task: string) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id 
        ? { ...exp, aufgabenbereiche: [...(exp.aufgabenbereiche || []), task] }
        : exp
    ));
  };

  // Education methods
  const addEducation = (education: Partial<Education>) => {
    // Check if there's already an empty education that's not selected
    const existingEmptyEdu = ausbildung.find(edu => 
      isEmptyEducation(edu) && edu.id !== selectedEducationId
    );
    
    // If there's an existing empty education, select it instead of creating a new one
    if (existingEmptyEdu) {
      setSelectedEducationId(existingEmptyEdu.id);
      return existingEmptyEdu.id;
    }
    
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: education.institution || [],
      ausbildungsart: education.ausbildungsart || [],
      abschluss: education.abschluss || [],
      startMonth: education.startMonth || null,
      startYear: education.startYear || null,
      endMonth: education.endMonth || null,
      endYear: education.endYear || null,
      isCurrent: education.isCurrent || false,
      zusatzangaben: education.zusatzangaben || ''
    };
    setAusbildung(prev => [...prev, newEducation]);
    setSelectedEducationId(newEducation.id); // Immediately select the new entry
    return newEducation.id;
  };

  const updateEducation = (id: string, education: Partial<Education>) => {
    setAusbildung(prev => prev.map(edu => 
      edu.id === id ? { ...edu, ...education } : edu
    ));
  };

  const selectEducation = (id: string) => {
    // If switching away from a currently selected empty education, delete it
    if (selectedEducationId && selectedEducationId !== id) {
      const currentEdu = ausbildung.find(edu => edu.id === selectedEducationId);
      if (currentEdu && isEmptyEducation(currentEdu)) {
        setAusbildung(prev => prev.filter(edu => edu.id !== selectedEducationId));
      }
    }
    
    setSelectedEducationId(id);
  };

  const deleteEducation = (id: string) => {
    setAusbildung(prev => prev.filter(edu => edu.id !== id));
  };

  const updateEducationField = (id: string, field: string, value: any) => {
    setAusbildung(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  // Task methods
  const toggleFavoriteTask = (task: string) => {
    setFavoriteTasks(prev => 
      prev.includes(task)
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const toggleFavoriteCompany = (company: string) => {
    setFavoriteCompanies(prev => 
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const toggleFavoritePosition = (position: string) => {
    setFavoritePositions(prev => 
      prev.includes(position)
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  const toggleFavoriteInstitution = (institution: string) => {
    setFavoriteInstitutions(prev => 
      prev.includes(institution)
        ? prev.filter(i => i !== institution)
        : [...prev, institution]
    );
  };

  const toggleFavoriteAusbildungsart = (ausbildungsart: string) => {
    setFavoriteAusbildungsarten(prev => 
      prev.includes(ausbildungsart)
        ? prev.filter(a => a !== ausbildungsart)
        : [...prev, ausbildungsart]
    );
  };

  const toggleFavoriteAbschluss = (abschluss: string) => {
    setFavoriteAbschluesse(prev => 
      prev.includes(abschluss)
        ? prev.filter(a => a !== abschluss)
        : [...prev, abschluss]
    );
  };

  const toggleFavoriteCity = (city: string) => {
    setFavoriteCities(prev => 
      prev.includes(city)
        ? prev.filter(c => c !== city)
        : [...prev, city]
    );
  };

  const toggleFavoriteLeasingCompany = (company: string) => {
    setFavoriteLeasingCompanies(prev => 
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  // BIS methods
  const toggleBisTaskSelection = (task: string) => {
    setSelectedBisTasks(prev => 
      prev.includes(task)
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  // Helper functions to ensure a valid entry exists for editing
  const ensureSelectedExperienceExists = useCallback(() => {
    // If we have a valid selected experience, return its ID
    if (selectedExperienceId && berufserfahrung.some(exp => exp.id === selectedExperienceId)) {
      return selectedExperienceId;
    }
    
    // No valid selection - create a new entry
    const newExp = {
      companies: [],
      position: [],
      startMonth: null,
      startYear: "",
      endMonth: null,
      endYear: null,
      isCurrent: false,
      aufgabenbereiche: [],
      zusatzangaben: ""
    };
    
    return addExperience(newExp);
  }, [selectedExperienceId, berufserfahrung, addExperience]);

  const ensureSelectedEducationExists = useCallback(() => {
    // If we have a valid selected education, return its ID
    if (selectedEducationId && ausbildung.some(edu => edu.id === selectedEducationId)) {
      return selectedEducationId;
    }
    
    // No valid selection - create a new entry
    const newEdu = {
      institution: [],
      ausbildungsart: [],
      abschluss: [],
      startMonth: null,
      startYear: "",
      endMonth: null,
      endYear: null,
      isCurrent: false,
      zusatzangaben: ""
    };
    
    return addEducation(newEdu);
  }, [selectedEducationId, ausbildung, addEducation]);

  const contextValue: LebenslaufContextType = {
    personalData,
    berufserfahrung,
    ausbildung,
    selectedExperienceId,
    selectedEducationId,
    multiSelectedExperienceIds,
    favoriteTasks,
    favoriteCompanies,
    favoritePositions,
    favoriteInstitutions,
    favoriteAusbildungsarten,
    favoriteAbschluesse,
    favoriteCities,
    favoriteLeasingCompanies,
    isBisTranslatorActive,
    selectedBisTasks,
    bisTranslatorResults,
    previewTab,
    activeTab,
    cvSuggestions,
    
    updatePersonalData,
    
    addExperience,
    updateExperience,
    selectExperience,
    toggleMultiExperienceSelection,
    deleteExperience,
    updateExperienceField,
    updateExperienceTask,
    updateExperienceTasksOrder,
    addExperienceTask,
    updateExperienceZeitraum,
    
    addEducation,
    updateEducation,
    selectEducation,
    deleteEducation,
    updateEducationField,
    updateEducationZeitraum,
    
    toggleFavoriteTask,
    toggleFavoriteCompany,
    toggleFavoritePosition,
    toggleFavoriteInstitution,
    toggleFavoriteAusbildungsart,
    toggleFavoriteAbschluss,
    toggleFavoriteCity,
    toggleFavoriteLeasingCompany,
    
    setIsBisTranslatorActive,
    toggleBisTaskSelection,
    setBisTranslatorResults,
    
    setPreviewTab,
    setActiveTab,
    
    setActiveTabWithSync,
    setPreviewTabWithSync,
    
    ensureSelectedExperienceExists,
    ensureSelectedEducationExists,
    isEmptyExperience,
    isEmptyEducation,
  };

  return (
    <LebenslaufContext.Provider value={contextValue}>
      {children}
    </LebenslaufContext.Provider>
  );
}

export function useLebenslauf() {
  const context = useContext(LebenslaufContext);
  if (context === undefined) {
    throw new Error('useLebenslauf must be used within a LebenslaufProvider');
  }
  return context;
}

// Helper functions to check if entries are empty
const isEmptyExperience = (exp: Experience): boolean => {
  return (!exp.companies || exp.companies.length === 0) && 
         (!exp.position || exp.position.length === 0) && 
         (!exp.aufgabenbereiche || exp.aufgabenbereiche.length === 0) &&
         (!exp.startYear || exp.startYear.trim() === '') &&
         (!exp.zusatzangaben || exp.zusatzangaben.trim() === '') &&
         (!exp.leasingCompaniesList || exp.leasingCompaniesList.length === 0);
};

const isEmptyEducation = (edu: Education): boolean => {
  return (!edu.institution || edu.institution.length === 0) && 
         (!edu.ausbildungsart || edu.ausbildungsart.length === 0) && 
         (!edu.abschluss || edu.abschluss.length === 0) &&
         (!edu.startYear || edu.startYear.trim() === '') &&
         (!edu.zusatzangaben || edu.zusatzangaben.trim() === '');
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a typography config with only defined values
 */
export const createTypographyConfig = (config: Partial<TypographyConfig>): TypographyConfig => {
  const result: TypographyConfig = {};
  
  Object.keys(config).forEach(key => {
    const value = config[key as keyof TypographyConfig];
    if (value !== undefined) {
      (result as any)[key] = value;
    }
  });
  
  return result;
};

/**
 * Merges typography configs with inheritance
 */
export const mergeTypographyConfigs = (
  base: TypographyConfig,
  override: Partial<TypographyConfig>
): TypographyConfig => {
  return deepMerge(base, override);
};

/**
 * Gets the difference between two typography configs
 */
export const getTypographyDiff = (
  config1: TypographyConfig,
  config2: TypographyConfig
): Partial<TypographyConfig> => {
  const diff: Partial<TypographyConfig> = {};
  
  Object.keys(config2).forEach(key => {
    const key1 = key as keyof TypographyConfig;
    if (config1[key1] !== config2[key1]) {
      diff[key1] = config2[key1];
    }
  });
  
  return diff;
};

/**
 * Validates typography config
 */
export const validateTypographyConfig = (config: TypographyConfig): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];
  
  if (config.fontSize !== undefined && (config.fontSize < 6 || config.fontSize > 72)) {
    errors.push('Font size must be between 6 and 72 pixels');
  }
  
  if (config.lineHeight !== undefined && (config.lineHeight < 0.8 || config.lineHeight > 3.0)) {
    errors.push('Line height must be between 0.8 and 3.0');
  }
  
  if (config.letterSpacing !== undefined && (config.letterSpacing < -5 || config.letterSpacing > 10)) {
    errors.push('Letter spacing must be between -5 and 10 pixels');
  }
  
  if (config.textColor !== undefined && !/^#[0-9A-Fa-f]{6}$/.test(config.textColor)) {
    errors.push('Text color must be a valid hex color (e.g., #333333)');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

// ============================================================================
// EXPORT
// ============================================================================

export { TypographyContext };
export type { TypographyAction, SectionTypography };