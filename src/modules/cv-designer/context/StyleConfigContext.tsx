import React, { createContext, useContext, useState, ReactNode } from "react";
import { StyleConfig } from "../types/styles";

/**
 * 🟢 Hilfsfunktion: Normalisiert colors-Objekt aus Root-Level Properties
 */
function normalizeColors(config: StyleConfig): StyleConfig {
  if (!config.colors) {
    config.colors = {};
  }

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

  if (!config.colors.primary) config.colors.primary = "#1e40af";
  if (!config.colors.accent) config.colors.accent = "#3b82f6";
  if (!config.colors.background) config.colors.background = "#ffffff";
  if (!config.colors.text) config.colors.text = "#333333";
  if (!config.colors.secondary) config.colors.secondary = "#6b7280";
  if (!config.colors.textSecondary) config.colors.textSecondary = "#9ca3af";
  if (!config.colors.border) config.colors.border = "#e5e7eb";

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
      fields: {
        name: { font: { family: "Inter", size: 20, weight: "bold" } }, // 👈 Name Feld
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
  // 👇 neu: globalHeaders
  globalHeaders: {
    font: { family: "Inter", size: 16, weight: "bold", color: "#1e40af" },
  },
};

interface StyleConfigContextValue {
  styleConfig: StyleConfig;
  updateStyleConfig: (
    config: Partial<StyleConfig> & { sectionId?: string }
  ) => void;
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

  const updateStyleConfig = (
    config: Partial<StyleConfig> & { sectionId?: string }
  ) => {
    console.log('updateStyleConfig called with:', config);
    
    setStyleConfig((prevConfig) => {
      console.log('updateStyleConfig - prevConfig:', prevConfig);
      
      let mergedConfig: StyleConfig;

      if (config.sectionId) {
        const { sectionId, ...rest } = config;
        console.log(`updateStyleConfig - updating section ${sectionId} with:`, rest);
        
        mergedConfig = {
          ...prevConfig,
          sections: {
            ...prevConfig.sections,
            [sectionId]: {
              sectionId,
              ...prevConfig.sections?.[sectionId],
              ...rest,
              font: {
                ...prevConfig.sections?.[sectionId]?.font,
                ...(rest as any).font,
              },
              header: {
                ...prevConfig.sections?.[sectionId]?.header,
                ...(rest as any).header,
                font: {
                  ...prevConfig.sections?.[sectionId]?.header?.font,
                  ...(rest as any).header?.font,
                },
              },
              fields: {
                ...prevConfig.sections?.[sectionId]?.fields,
                ...(rest as any).fields,
              },
            },
          },
        };
      } else {
        console.log('updateStyleConfig - updating global config with:', config);
        
        mergedConfig = {
          ...prevConfig,
          ...config,
          // 🎯 KRITISCH: Globale Font-Eigenschaften korrekt mergen
          font: {
            ...prevConfig.font,
            ...(config.font || {}),
          },
          colors: {
            ...prevConfig.colors,
            ...(config.colors || {}),
          },
          globalHeaders: {
            ...prevConfig.globalHeaders,
            ...(config.globalHeaders || {}),
          },
          sections: {
            ...prevConfig.sections,
            ...(config.sections || {}),
          },
        };
      }

      console.log('updateStyleConfig - mergedConfig:', mergedConfig);
      console.log('🔧 updateStyleConfig - mergedConfig.font:', mergedConfig.font);
      console.log('🔧 updateStyleConfig - mergedConfig.fontSize:', mergedConfig.fontSize);
      console.log('🔧 updateStyleConfig - mergedConfig.sections?.allHeaders:', mergedConfig.sections?.allHeaders);
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
