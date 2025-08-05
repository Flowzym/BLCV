// 📄 src/modules/cv-designer/context/StyleConfigContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";
import { StyleConfig } from "../types/styles";
import { deepMerge } from "@/lib/utils";

/**
 * Normalisiert Colors (falls alte Root-Properties gesetzt sind)
 */
function normalizeColors(config: StyleConfig): StyleConfig {
  // Initialize colors object if null or undefined
  if (!config.colors) {
    config.colors = {};
  }

  // Set defaults only for undefined values, preserve null values
  if (config.colors.primary === undefined) {
    config.colors.primary = config.primaryColor ?? "#1e40af";
  }
  if (config.colors.accent === undefined) {
    config.colors.accent = config.accentColor ?? "#3b82f6";
  }
  if (config.colors.background === undefined) {
    config.colors.background = config.backgroundColor ?? "#ffffff";
  }
  if (config.colors.text === undefined) {
    config.colors.text = config.textColor ?? "#333333";
  }
  if (config.colors.secondary === undefined) {
    config.colors.secondary = "#6b7280";
  }
  if (config.colors.textSecondary === undefined) {
    config.colors.textSecondary = "#9ca3af";
  }
  if (config.colors.border === undefined) {
    config.colors.border = "#e5e7eb";
  }

  // Mirror to root-level properties only if not undefined
  if (config.colors.primary !== undefined) {
    config.primaryColor = config.colors.primary;
  }
  if (config.colors.accent !== undefined) {
    config.accentColor = config.colors.accent;
  }
  if (config.colors.background !== undefined) {
    config.backgroundColor = config.colors.background;
  }
  if (config.colors.text !== undefined) {
    config.textColor = config.colors.text;
  }

  return config;
}

/**
 * Default StyleConfig – nur Section-/Field-Fonts, keine globalen Fonts
 */
const defaultStyleConfig: StyleConfig = {
  primaryColor: "#1e40af",
  accentColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#333333",
  margin: "normal",
  borderRadius: "8px",
  sectionSpacing: 24,
  snapSize: 20,
  widthPercent: 100,

  colors: {
    primary: "#1e40af",
    accent: "#3b82f6",
    background: "#ffffff",
    text: "#333333",
    secondary: "#6b7280",
    textSecondary: "#9ca3af",
    border: "#e5e7eb",
  },
  sections: {
    profil: {
      sectionId: "profil",
      font: { family: "Inter", size: 12, weight: "normal" },
      header: { font: { family: "Inter", size: 16, weight: "bold" } },
      fields: {
        name: { font: { family: "Inter", size: 20, weight: "bold" } },
      },
    },
    erfahrung: {
      sectionId: "erfahrung",
      font: { family: "Inter", size: 12, weight: "normal" },
      header: { font: { family: "Inter", size: 16, weight: "bold" } },
      fields: {},
    },
    ausbildung: {
      sectionId: "ausbildung",
      font: { family: "Inter", size: 12, weight: "normal" },
      header: { font: { family: "Inter", size: 16, weight: "bold" } },
      fields: {},
    },
    kenntnisse: {
      sectionId: "kenntnisse",
      font: { family: "Inter", size: 12, weight: "normal" },
      header: { font: { family: "Inter", size: 16, weight: "bold" } },
      fields: {},
    },
    softskills: {
      sectionId: "softskills",
      font: { family: "Inter", size: 12, weight: "normal" },
      header: { font: { family: "Inter", size: 16, weight: "bold" } },
      fields: {},
    },
  },
};

interface StyleConfigContextValue {
  styleConfig: StyleConfig;
  updateStyleConfig: (config: Partial<StyleConfig>) => void;
  resetStyleConfig: () => void;

  selectedElement: { sectionId: string; field?: string } | null;
  setSelectedElement: (el: { sectionId: string; field?: string } | null) => void;
}

const StyleConfigContext = createContext<StyleConfigContextValue | undefined>(
  undefined
);

export const StyleConfigProvider = ({ children }: { children: ReactNode }) => {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(
    normalizeColors(defaultStyleConfig)
  );
  const [selectedElement, setSelectedElement] = useState<
    { sectionId: string; field?: string } | null
  >(null);

  const updateStyleConfig = (config: Partial<StyleConfig>) => {
    console.log("updateStyleConfig called with:", config);

    setStyleConfig((prevConfig) => {
      // Use deep merge to preserve nested properties
      const mergedConfig: StyleConfig = deepMerge(prevConfig, config);

      console.log("updateStyleConfig - mergedConfig:", mergedConfig);
      
      // Normalize colors after deep merge to ensure consistency
      return normalizeColors(mergedConfig);
    });
  };

  const resetStyleConfig = () => {
    setStyleConfig(normalizeColors({ ...defaultStyleConfig }));
  };

  return (
    <StyleConfigContext.Provider
      value={{
        styleConfig,
        updateStyleConfig,
        resetStyleConfig,
        selectedElement,
        setSelectedElement,
      }}
    >
      {children}
    </StyleConfigContext.Provider>
  );
};

export const useStyleConfig = () => {
  const context = useContext(StyleConfigContext);
  if (!context) {
    throw new Error("useStyleConfig must be used within StyleConfigProvider");
  }
  return context;
};
