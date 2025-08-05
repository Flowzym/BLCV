/**
 * Typography Context
 * Dedicated context for managing typography settings across CV sections and fields
 */

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { deepMerge } from '@/lib/utils';

// ============================================================================
// TYPES
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
}

// ============================================================================
// ACTIONS
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

const initialState: TypographyState = {
  sections: defaultSectionConfigs
};

// ============================================================================
// REDUCER
// ============================================================================

function typographyReducer(state: TypographyState, action: TypographyAction): TypographyState {
  switch (action.type) {
    case 'UPDATE_TYPOGRAPHY': {
      const { sectionId, fieldKey, config } = action.payload;
      
      // Ensure section exists
      const currentSection = state.sections[sectionId] || {};
      const currentField = currentSection[fieldKey] || {};
      
      // Deep merge the typography config for this specific field
      const updatedField = deepMerge(currentField, config);
      
      return {
        ...state,
        sections: {
          ...state.sections,
          [sectionId]: {
            ...currentSection,
            [fieldKey]: updatedField
          }
        }
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
      return deepMerge(state, action.payload);
    }

    case 'RESET_ALL': {
      return {
        sections: JSON.parse(JSON.stringify(defaultSectionConfigs))
      };
    }

    default:
      return state;
  }
}

// ============================================================================
// CONTEXT
// ============================================================================

interface TypographyContextValue {
  state: TypographyState;
  updateTypography: (sectionId: string, fieldKey: string, config: Partial<TypographyConfig>) => void;
  resetTypography: (sectionId: string, fieldKey?: string) => void;
  bulkUpdate: (updates: Partial<TypographyState>) => void;
  resetAll: () => void;
  getTypography: (sectionId: string, fieldKey: string) => TypographyConfig;
  getEffectiveTypography: (sectionId: string, fieldKey: string) => TypographyConfig;
  hasCustomTypography: (sectionId: string, fieldKey: string) => boolean;
}

const TypographyContext = createContext<TypographyContextValue | undefined>(undefined);

// ============================================================================
// PROVIDER
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
    initialTypography ? deepMerge(initialState, initialTypography) : initialState
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const updateTypography = (
    sectionId: string,
    fieldKey: string,
    config: Partial<TypographyConfig>
  ) => {
    console.log(`🔧 TypographyContext: updateTypography ${sectionId}.${fieldKey}`, config);
    dispatch({
      type: 'UPDATE_TYPOGRAPHY',
      payload: { sectionId, fieldKey, config }
    });
  };

  const resetTypography = (sectionId: string, fieldKey?: string) => {
    console.log(`🔄 TypographyContext: resetTypography ${sectionId}.${fieldKey || 'all'}`);
    dispatch({
      type: 'RESET_TYPOGRAPHY',
      payload: { sectionId, fieldKey }
    });
  };

  const bulkUpdate = (updates: Partial<TypographyState>) => {
    console.log('🔧 TypographyContext: bulkUpdate', updates);
    dispatch({
      type: 'BULK_UPDATE',
      payload: updates
    });
  };

  const resetAll = () => {
    console.log('🔄 TypographyContext: resetAll');
    dispatch({ type: 'RESET_ALL' });
  };

  // ============================================================================
  // GETTERS
  // ============================================================================

  const getTypography = (sectionId: string, fieldKey: string): TypographyConfig => {
    return state.sections[sectionId]?.[fieldKey] || defaultTypographyConfig;
  };

  const getEffectiveTypography = (sectionId: string, fieldKey: string): TypographyConfig => {
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
  };

  const hasCustomTypography = (sectionId: string, fieldKey: string): boolean => {
    const config = state.sections[sectionId]?.[fieldKey];
    if (!config) return false;

    const defaultConfig = defaultSectionConfigs[sectionId]?.[fieldKey] || defaultTypographyConfig;
    
    // Check if any property differs from default
    return Object.keys(config).some(key => {
      const configKey = key as keyof TypographyConfig;
      return config[configKey] !== defaultConfig[configKey];
    });
  };

  // ============================================================================
  // CONTEXT VALUE
  // ============================================================================

  const contextValue: TypographyContextValue = {
    state,
    updateTypography,
    resetTypography,
    bulkUpdate,
    resetAll,
    getTypography,
    getEffectiveTypography,
    hasCustomTypography
  };

  return (
    <TypographyContext.Provider value={contextValue}>
      {children}
    </TypographyContext.Provider>
  );
};

// ============================================================================
// HOOK
// ============================================================================

export const useTypography = (
  sectionId: string,
  fieldKey?: string
): [TypographyConfig, (config: Partial<TypographyConfig>) => void] => {
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
  const updateConfig = (config: Partial<TypographyConfig>) => {
    updateTypography(sectionId, effectiveFieldKey, config);
  };

  return [currentConfig, updateConfig];
};

// ============================================================================
// ADDITIONAL HOOKS
// ============================================================================

/**
 * Hook for accessing the full typography context
 */
export const useTypographyContext = (): TypographyContextValue => {
  const context = useContext(TypographyContext);
  
  if (!context) {
    throw new Error('useTypographyContext must be used within a TypographyProvider');
  }
  
  return context;
};

/**
 * Hook for checking if a section/field has custom typography
 */
export const useHasCustomTypography = (sectionId: string, fieldKey: string): boolean => {
  const { hasCustomTypography } = useTypographyContext();
  return hasCustomTypography(sectionId, fieldKey);
};

/**
 * Hook for resetting typography
 */
export const useResetTypography = () => {
  const { resetTypography, resetAll } = useTypographyContext();
  
  return {
    resetField: (sectionId: string, fieldKey: string) => resetTypography(sectionId, fieldKey),
    resetSection: (sectionId: string) => resetTypography(sectionId),
    resetAll
  };
};

/**
 * Hook for bulk typography operations
 */
export const useBulkTypography = () => {
  const { bulkUpdate, state } = useTypographyContext();
  
  const importTypography = (typographyData: Partial<TypographyState>) => {
    bulkUpdate(typographyData);
  };
  
  const exportTypography = (): TypographyState => {
    return JSON.parse(JSON.stringify(state));
  };
  
  const applyTypographyPreset = (preset: Partial<TypographyState>) => {
    bulkUpdate(preset);
  };
  
  return {
    importTypography,
    exportTypography,
    applyTypographyPreset
  };
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