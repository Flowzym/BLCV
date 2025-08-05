/**
 * Typography Context
 * Dedicated context for managing typography settings across CV sections and fields
 */

import React, {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useEffect,
  ReactNode,
} from "react";

import { deepMerge } from "@/lib/utils";

// ============================================================================
// TYPOGRAPHY TYPES
// ============================================================================

export interface TypographyConfig {
  fontFamily?: string;
  fontSize?: number; // in px
  fontWeight?: "normal" | "bold" | number;
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
      type: "UPDATE_TYPOGRAPHY";
      payload: {
        sectionId: string;
        fieldKey: string;
        config: Partial<TypographyConfig>;
      };
    }
  | {
      type: "BATCH_UPDATE_TYPOGRAPHY";
      payload: {
        updates: Array<{
          sectionId: string;
          fieldKey: string;
          config: Partial<TypographyConfig>;
        }>;
      };
    }
  | {
      type: "RESET_TYPOGRAPHY";
      payload: {
        sectionId: string;
        fieldKey?: string;
      };
    }
  | { type: "BULK_UPDATE"; payload: Partial<TypographyState> }
  | { type: "RESET_ALL" }
  | { type: "FLUSH_BATCH" };

// ============================================================================
// DEFAULT CONFIGURATIONS
// ============================================================================

const defaultTypographyConfig: TypographyConfig = {
  fontFamily: "Inter",
  fontSize: 12,
  fontWeight: "normal",
  italic: false,
  letterSpacing: 0,
  lineHeight: 1.6,
  textColor: "#333333",
};

const defaultSectionConfigs: Record<string, SectionTypography> = {
  profil: {
    content: { ...defaultTypographyConfig },
    header: { ...defaultTypographyConfig, fontSize: 16, fontWeight: "bold", textColor: "#1e40af" },
    name: { ...defaultTypographyConfig, fontSize: 20, fontWeight: "bold", textColor: "#1e40af" },
    adresse: { ...defaultTypographyConfig, fontSize: 11, textColor: "#6b7280" },
    mail: { ...defaultTypographyConfig, fontSize: 11, textColor: "#6b7280" },
    telefon: { ...defaultTypographyConfig, fontSize: 11, textColor: "#6b7280" },
  },
  erfahrung: {
    content: { ...defaultTypographyConfig },
    header: { ...defaultTypographyConfig, fontSize: 16, fontWeight: "bold", textColor: "#1e40af" },
    position: { ...defaultTypographyConfig, fontSize: 14, fontWeight: "bold" },
    firma: { ...defaultTypographyConfig, fontSize: 12, textColor: "#6b7280" },
    zeitraum: { ...defaultTypographyConfig, fontSize: 11, textColor: "#9ca3af" },
    taetigkeiten: { ...defaultTypographyConfig, fontSize: 11 },
  },
  ausbildung: {
    content: { ...defaultTypographyConfig },
    header: { ...defaultTypographyConfig, fontSize: 16, fontWeight: "bold", textColor: "#1e40af" },
    abschluss: { ...defaultTypographyConfig, fontSize: 14, fontWeight: "bold" },
    institution: { ...defaultTypographyConfig, fontSize: 12, textColor: "#6b7280" },
    zeitraum: { ...defaultTypographyConfig, fontSize: 11, textColor: "#9ca3af" },
  },
  kenntnisse: {
    content: { ...defaultTypographyConfig },
    header: { ...defaultTypographyConfig, fontSize: 16, fontWeight: "bold", textColor: "#1e40af" },
    skillname: { ...defaultTypographyConfig, fontSize: 11, fontWeight: "500" },
    level: { ...defaultTypographyConfig, fontSize: 10, textColor: "#6b7280" },
  },
  softskills: {
    content: { ...defaultTypographyConfig },
    header: { ...defaultTypographyConfig, fontSize: 16, fontWeight: "bold", textColor: "#1e40af" },
    skillname: { ...defaultTypographyConfig, fontSize: 11, fontWeight: "500" },
    level: { ...defaultTypographyConfig, fontSize: 10, textColor: "#6b7280" },
  },
};

const initialTypographyState: TypographyState = {
  sections: defaultSectionConfigs,
  batchedUpdates: [],
};

// ============================================================================
// TYPOGRAPHY REDUCER WITH BATCHING
// ============================================================================

function typographyReducer(
  state: TypographyState,
  action: TypographyAction
): TypographyState {
  switch (action.type) {
    case "UPDATE_TYPOGRAPHY": {
      const { sectionId, fieldKey, config } = action.payload;
      
      // Ensure section exists
      const currentSection = state.sections[sectionId] || {};
      const currentField = currentSection[fieldKey] || {};
      
      // Merge new config with existing field config
      const updatedField = { ...currentField, ...config };

      return {
        ...state,
        sections: {
          ...state.sections,
          [sectionId]: {
            ...currentSection,
            [fieldKey]: updatedField,
          },
        },
        batchedUpdates: [
          ...state.batchedUpdates,
          { sectionId, fieldKey, config, timestamp: Date.now() },
        ],
      };
    }

    case "BATCH_UPDATE_TYPOGRAPHY": {
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
            [fieldKey]: updatedField,
          },
        };
      });

      return {
        ...state,
        sections: newSections,
        batchedUpdates: [],
      };
    }

    case "RESET_TYPOGRAPHY": {
      const { sectionId, fieldKey } = action.payload;

      if (fieldKey) {
        // Reset specific field to default
        const defaultConfig =
          defaultSectionConfigs[sectionId]?.[fieldKey] ||
          defaultTypographyConfig;

        return {
          ...state,
          sections: {
            ...state.sections,
            [sectionId]: {
              ...state.sections[sectionId],
              [fieldKey]: { ...defaultConfig },
            },
          },
        };
      } else {
        // Reset entire section to defaults
        return {
          ...state,
          sections: {
            ...state.sections,
            [sectionId]: { ...defaultSectionConfigs[sectionId] },
          },
        };
      }
    }

    case "BULK_UPDATE":
      return deepMerge(state, action.payload);

    case "RESET_ALL":
      return {
        sections: { ...defaultSectionConfigs },
        batchedUpdates: [],
      };

    case "FLUSH_BATCH":
      return {
        ...state,
        batchedUpdates: [],
      };

    default:
      return state;
  }
}

// ============================================================================
// TYPOGRAPHY CONTEXT
// ============================================================================

interface TypographyContextValue {
  state: TypographyState;
  updateTypography: (
    sectionId: string,
    fieldKey: string,
    config: Partial<TypographyConfig>
  ) => void;
  batchUpdateTypography: (
    updates: Array<{
      sectionId: string;
      fieldKey: string;
      config: Partial<TypographyConfig>;
    }>
  ) => void;
  resetTypography: (sectionId: string, fieldKey?: string) => void;
  bulkUpdate: (updates: Partial<TypographyState>) => void;
  resetAll: () => void;
  getTypography: (sectionId: string, fieldKey: string) => TypographyConfig;
  getEffectiveTypography: (
    sectionId: string,
    fieldKey: string
  ) => TypographyConfig;
  hasCustomTypography: (sectionId: string, fieldKey: string) => boolean;
  flushBatch: () => void;
  exportTypography: () => TypographyState;
  importTypography: (typography: TypographyState) => void;
}

const TypographyContext = createContext<TypographyContextValue | undefined>(
  undefined
);

// ============================================================================
// TYPOGRAPHY PROVIDER
// ============================================================================

export interface TypographyProviderProps {
  children: ReactNode;
  initialTypography?: Partial<TypographyState>;
}

export const TypographyProvider: React.FC<TypographyProviderProps> = ({
  children,
  initialTypography,
}) => {
  const [state, dispatch] = useReducer(
    typographyReducer,
    initialTypography 
      ? deepMerge(initialTypographyState, initialTypography)
      : initialTypographyState
  );

  // Batch processing with debounce
  useEffect(() => {
    if (state.batchedUpdates.length === 0) return;

    const timer = setTimeout(() => {
      dispatch({ type: "FLUSH_BATCH" });
    }, 100); // 100ms debounce

    return () => clearTimeout(timer);
  }, [state.batchedUpdates]);

  const updateTypography = useCallback(
    (sectionId: string, fieldKey: string, config: Partial<TypographyConfig>) => {
      dispatch({
        type: "UPDATE_TYPOGRAPHY",
        payload: { sectionId, fieldKey, config },
      });
    },
    []
  );

  const batchUpdateTypography = useCallback(
    (
      updates: Array<{
        sectionId: string;
        fieldKey: string;
        config: Partial<TypographyConfig>;
      }>
    ) => {
      dispatch({
        type: "BATCH_UPDATE_TYPOGRAPHY",
        payload: { updates },
      });
    },
    []
  );

  const resetTypography = useCallback(
    (sectionId: string, fieldKey?: string) => {
      dispatch({
        type: "RESET_TYPOGRAPHY",
        payload: { sectionId, fieldKey },
      });
    },
    []
  );

  const bulkUpdate = useCallback((updates: Partial<TypographyState>) => {
    dispatch({ type: "BULK_UPDATE", payload: updates });
  }, []);

  const resetAll = useCallback(() => {
    dispatch({ type: "RESET_ALL" });
  }, []);

  const flushBatch = useCallback(() => {
    dispatch({ type: "FLUSH_BATCH" });
  }, []);

  const getTypography = useCallback(
    (sectionId: string, fieldKey: string): TypographyConfig => {
      return state.sections[sectionId]?.[fieldKey] || defaultTypographyConfig;
    },
    [state.sections]
  );

  const getEffectiveTypography = useCallback(
    (sectionId: string, fieldKey: string): TypographyConfig => {
      const sectionConfig = state.sections[sectionId];
      const fieldConfig = sectionConfig?.[fieldKey];

      // Fallback chain: field config → section content config → default config
      const fallbackConfig = 
        sectionConfig?.content || 
        defaultSectionConfigs[sectionId]?.content || 
        defaultTypographyConfig;

      return {
        ...defaultTypographyConfig,
        ...fallbackConfig,
        ...(fieldConfig || {}),
      };
    },
    [state.sections]
  );

  const hasCustomTypography = useCallback(
    (sectionId: string, fieldKey: string): boolean => {
      const config = state.sections[sectionId]?.[fieldKey];
      const defaultConfig =
        defaultSectionConfigs[sectionId]?.[fieldKey] || defaultTypographyConfig;

      if (!config) return false;

      return Object.keys(config).some((key) => {
        const typedKey = key as keyof TypographyConfig;
        return config[typedKey] !== defaultConfig[typedKey];
      });
    },
    [state.sections]
  );

  const exportTypography = useCallback((): TypographyState => {
    return { ...state };
  }, [state]);

  const importTypography = useCallback((typography: TypographyState) => {
    dispatch({ type: "BULK_UPDATE", payload: typography });
  }, []);

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
    flushBatch,
    exportTypography,
    importTypography,
  };

  return (
    <TypographyContext.Provider value={contextValue}>
      {children}
    </TypographyContext.Provider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

export function useTypography(
  sectionId: string,
  fieldKey: string = "content"
): [TypographyConfig, (config: Partial<TypographyConfig>) => void] {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error("useTypography must be used within a TypographyProvider");
  }

  const { getEffectiveTypography, updateTypography } = context;
  const config = getEffectiveTypography(sectionId, fieldKey);

  const update = useCallback(
    (newConfig: Partial<TypographyConfig>) => {
      updateTypography(sectionId, fieldKey, newConfig);
    },
    [sectionId, fieldKey, updateTypography]
  );

  return [config, update];
}

export function useTypographyContext(): TypographyContextValue {
  const context = useContext(TypographyContext);
  if (!context) {
    throw new Error("useTypographyContext must be used within a TypographyProvider");
  }
  return context;
}

export function useHasCustomTypography(
  sectionId: string,
  fieldKey: string = "content"
): boolean {
  const { hasCustomTypography } = useTypographyContext();
  return hasCustomTypography(sectionId, fieldKey);
}

export function useResetTypography() {
  const { resetTypography, resetAll } = useTypographyContext();
  
  const resetField = useCallback(
    (sectionId: string, fieldKey: string) => {
      resetTypography(sectionId, fieldKey);
    },
    [resetTypography]
  );

  const resetSection = useCallback(
    (sectionId: string) => {
      resetTypography(sectionId);
    },
    [resetTypography]
  );

  return {
    resetField,
    resetSection,
    resetAll,
  };
}

export function useBulkTypography() {
  const { bulkUpdate, batchUpdateTypography, exportTypography, importTypography } = useTypographyContext();

  const applyPreset = useCallback(
    (preset: Partial<TypographyState>) => {
      bulkUpdate(preset);
    },
    [bulkUpdate]
  );

  const applyTypographyToMultipleFields = useCallback(
    (
      updates: Array<{
        sectionId: string;
        fieldKey: string;
        config: Partial<TypographyConfig>;
      }>
    ) => {
      batchUpdateTypography(updates);
    },
    [batchUpdateTypography]
  );

  return {
    applyPreset,
    applyTypographyToMultipleFields,
    exportTypography,
    importTypography,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function createTypographyConfig(
  config: Partial<TypographyConfig>
): TypographyConfig {
  const result: TypographyConfig = {};
  
  Object.keys(config).forEach((key) => {
    const typedKey = key as keyof TypographyConfig;
    const value = config[typedKey];
    if (value !== undefined) {
      (result as any)[typedKey] = value;
    }
  });
  
  return result;
}

export function mergeTypographyConfigs(
  base: TypographyConfig,
  override: Partial<TypographyConfig>
): TypographyConfig {
  return { ...base, ...override };
}

export function validateTypographyConfig(
  config: Partial<TypographyConfig>
): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (config.fontSize !== undefined) {
    if (typeof config.fontSize !== 'number' || config.fontSize < 6 || config.fontSize > 72) {
      errors.push('Font size must be between 6 and 72 pixels');
    }
  }

  if (config.fontWeight !== undefined) {
    if (typeof config.fontWeight === 'number') {
      if (config.fontWeight < 100 || config.fontWeight > 900) {
        errors.push('Font weight must be between 100 and 900');
      }
    } else if (config.fontWeight !== 'normal' && config.fontWeight !== 'bold') {
      errors.push('Font weight must be "normal", "bold", or a number between 100-900');
    }
  }

  if (config.letterSpacing !== undefined) {
    if (typeof config.letterSpacing !== 'number' || config.letterSpacing < -5 || config.letterSpacing > 10) {
      errors.push('Letter spacing must be between -5 and 10 pixels');
    }
  }

  if (config.lineHeight !== undefined) {
    if (typeof config.lineHeight !== 'number' || config.lineHeight < 0.8 || config.lineHeight > 3.0) {
      errors.push('Line height must be between 0.8 and 3.0');
    }
  }

  if (config.textColor !== undefined) {
    if (typeof config.textColor !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(config.textColor)) {
      errors.push('Text color must be a valid hex color (e.g., #333333)');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

export function diffTypographyConfigs(
  config1: TypographyConfig,
  config2: TypographyConfig
): Partial<TypographyConfig> {
  const diff: Partial<TypographyConfig> = {};

  (Object.keys(config1) as Array<keyof TypographyConfig>).forEach((key) => {
    if (config1[key] !== config2[key]) {
      diff[key] = config2[key];
    }
  });

  (Object.keys(config2) as Array<keyof TypographyConfig>).forEach((key) => {
    if (!(key in config1) && config2[key] !== undefined) {
      diff[key] = config2[key];
    }
  });

  return diff;
}