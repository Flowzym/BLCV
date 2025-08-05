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
  profil: { content: { ...defaultTypographyConfig } },
  erfahrung: { content: { ...defaultTypographyConfig } },
  ausbildung: { content: { ...defaultTypographyConfig } },
  kenntnisse: { content: { ...defaultTypographyConfig } },
  softskills: { content: { ...defaultTypographyConfig } },
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
      const currentSection = state.sections[sectionId] || {};
      const currentField = currentSection[fieldKey] || {};
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
      return { ...state, sections: newSections, batchedUpdates: [] };
    }
    case "RESET_TYPOGRAPHY": {
      const { sectionId, fieldKey } = action.payload;
      if (fieldKey) {
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
      }
      return {
        ...state,
        sections: { ...state.sections, [sectionId]: { ...defaultSectionConfigs[sectionId] } },
      };
    }
    case "BULK_UPDATE":
      return { ...state, ...action.payload };
    case "RESET_ALL":
      return { sections: { ...defaultSectionConfigs }, batchedUpdates: [] };
    case "FLUSH_BATCH":
      return { ...state, batchedUpdates: [] };
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
}

const TypographyContext = createContext<TypographyContextValue | undefined>(
  undefined
);

// ============================================================================
// TYPOGRAPHY PROVIDER
// ============================================================================

export const TypographyProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(typographyReducer, initialTypographyState);

  useEffect(() => {
    if (state.batchedUpdates.length === 0) return;
    const timer = setTimeout(() => dispatch({ type: "FLUSH_BATCH" }), 100);
    return () => clearTimeout(timer);
  }, [state.batchedUpdates]);

  const updateTypography = useCallback(
    (sectionId: string, fieldKey: string, config: Partial<TypographyConfig>) =>
      dispatch({ type: "UPDATE_TYPOGRAPHY", payload: { sectionId, fieldKey, config } }),
    []
  );

  const batchUpdateTypography = useCallback(
    (updates: Array<{ sectionId: string; fieldKey: string; config: Partial<TypographyConfig> }>) =>
      dispatch({ type: "BATCH_UPDATE_TYPOGRAPHY", payload: { updates } }),
    []
  );

  const resetTypography = useCallback(
    (sectionId: string, fieldKey?: string) =>
      dispatch({ type: "RESET_TYPOGRAPHY", payload: { sectionId, fieldKey } }),
    []
  );

  const bulkUpdate = useCallback(
    (updates: Partial<TypographyState>) =>
      dispatch({ type: "BULK_UPDATE", payload: updates }),
    []
  );

  const resetAll = useCallback(() => dispatch({ type: "RESET_ALL" }), []);
  const flushBatch = useCallback(() => dispatch({ type: "FLUSH_BATCH" }), []);

  const getTypography = useCallback(
    (sectionId: string, fieldKey: string) =>
      state.sections[sectionId]?.[fieldKey] || defaultTypographyConfig,
    [state.sections]
  );

  const getEffectiveTypography = useCallback(
    (sectionId: string, fieldKey: string) => {
      const sectionConfig = state.sections[sectionId];
      const fieldConfig = sectionConfig?.[fieldKey];
      return { ...defaultTypographyConfig, ...(fieldConfig || {}) };
    },
    [state.sections]
  );

  const hasCustomTypography = useCallback(
    (sectionId: string, fieldKey: string) => {
      const config = state.sections[sectionId]?.[fieldKey];
      const defaultConfig =
        defaultSectionConfigs[sectionId]?.[fieldKey] || defaultTypographyConfig;
      return config
        ? Object.keys(config).some(
            (k) => config[k as keyof TypographyConfig] !== defaultConfig[k as keyof TypographyConfig]
          )
        : false;
    },
    [state.sections]
  );

  return (
    <TypographyContext.Provider
      value={{
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
      }}
    >
      {children}
    </TypographyContext.Provider>
  );
};

// ============================================================================
// HOOKS
// ============================================================================

export function useTypography(
  sectionId: string,
  fieldKey = "content"
): [TypographyConfig, (config: Partial<TypographyConfig>) => void] {
  const ctx = useContext(TypographyContext);
  if (!ctx) throw new Error("useTypography must be used within a TypographyProvider");
  const { getEffectiveTypography, updateTypography } = ctx;
  const config = getEffectiveTypography(sectionId, fieldKey);
  const update = useCallback(
    (c: Partial<TypographyConfig>) => updateTypography(sectionId, fieldKey, c),
    [sectionId, fieldKey, updateTypography]
  );
  return [config, update];
}

export function useTypographyContext() {
  const ctx = useContext(TypographyContext);
  if (!ctx) throw new Error("useTypographyContext must be used within a TypographyProvider");
  return ctx;
}
