import React, { createContext, useContext, useState, ReactNode } from "react";
import { StyleConfig } from "../types/styles";

/**
 * 🟢 Hilfsfunktion: Normalisiert colors-Objekt aus Root-Level Properties
 */
function normalizeColors(config: StyleConfig): StyleConfig {
  // Stelle sicher, dass colors-Objekt existiert
  if (!config.colors) {
    config.colors = {};
  }

  // Migriere Root-Level → colors.* (falls colors.* noch nicht gesetzt)
  if (!config.colors.primary && config.primaryColor) {
    config.colors.primary = config.primaryColor;
  }
  if (!config.colors.accent && config.accentColor) {
    config.colors.accent = config.accentColor;
  }
  if (!config.colors.background && config.backgroundColor) {
    config.colors.background = config.backgroundColor;
  }
  if (!config.colors.text && config.textColor) {
    config.colors.text = config.textColor;
  }

  // Setze Defaults falls Werte fehlen
  if (!config.colors.primary) config.colors.primary = "#1e40af";
  if (!config.colors.accent) config.colors.accent = "#3b82f6";
  if (!config.colors.background) config.colors.background = "#ffffff";
  if (!config.colors.text) config.colors.text = "#333333";
  if (!config.colors.secondary) config.colors.secondary = "#6b7280";
  if (!config.colors.textSecondary) config.colors.textSecondary = "#9ca3af";
  if (!config.colors.border) config.colors.border = "#e5e7eb";

  // Spiegle colors.* → Root-Level für Backward Compatibility
  config.primaryColor = config.colors.primary;
  config.accentColor = config.colors.accent;
  config.backgroundColor = config.colors.background;
  config.textColor = config.colors.text;

  return config;
}

/**
 * 🟢 Default-StyleConfig mit vollständigem colors-Objekt
 */
const defaultStyleConfig: StyleConfig = {
  // Legacy properties (nur Fallbacks)
  primaryColor: "#1e40af",
  accentColor: "#3b82f6",
  backgroundColor: "#ffffff",
  textColor: "#333333",
  fontFamily: "Inter",
  fontSize: "medium",
  lineHeight: 1.6,
  margin: "normal",
  borderRadius: "8px",
  sectionSpacing: 24,
  snapSize: 20,
  widthPercent: 100,

  // Neue Properties
  font: {
    family: "Inter",
    size: 12,
    weight: "normal",
    color: "#333333",
    letterSpacing: 0,
    lineHeight: 1.6,
  },
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
      fields: {},
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
}

const StyleConfigContext = createContext<StyleConfigContextValue | undefined>(
  undefined
);

export const StyleConfigProvider = ({ children }: { children: ReactNode }) => {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(
    normalizeColors(defaultStyleConfig)
  );

  const updateStyleConfig = (config: Partial<StyleConfig>) => {
    setStyleConfig((prevConfig) => {
      const mergedConfig: StyleConfig = {
        ...prevConfig,
        ...config,
        colors: {
          ...prevConfig.colors,
          ...(config.colors || {}),
        },
        sections: {
          ...prevConfig.sections,
          ...(config.sections || {}),
        },
      };
      return normalizeColors(mergedConfig);
    });
  };

  const resetStyleConfig = () => {
    setStyleConfig(normalizeColors({ ...defaultStyleConfig }));
  };

  return (
    <StyleConfigContext.Provider
      value={{ styleConfig, updateStyleConfig, resetStyleConfig }}
    >
      {children}
    </StyleConfigContext.Provider>
  );
};

// 🟢 Named Export wieder da!
export const useStyleConfig = () => {
  const context = useContext(StyleConfigContext);
  if (!context) {
    throw new Error("useStyleConfig must be used within StyleConfigProvider");
  }
  return context;
};
