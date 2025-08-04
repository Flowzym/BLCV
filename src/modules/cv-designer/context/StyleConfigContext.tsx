import React, { createContext, useContext, useState, ReactNode } from "react";
import { StyleConfig } from "../types/styles";
 
/**
 * 🟢 Default-StyleConfig – verhindert undefined-Werte
 */
const defaultStyleConfig: StyleConfig = {
  // Legacy properties for backward compatibility - these will be synced with colors.*
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
  
  // New structured properties
  font: {
    family: "Inter",
    size: 12,
    weight: "normal",
    color: "#000000",
    letterSpacing: 0,
    lineHeight: 1.6,
  },
  colors: {
    primary: "#1e40af", // Beispielwert
    accent: "#3b82f6",
    textSecondary: "#6b7280",
    border: "#e5e7eb",
  },
  sections: { // NEU: Default-Sektionen mit Header- und Content-Fonts
    profil: {
  // Legacy properties for backward compatibility - these will be synced with colors.*
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
      sectionId: "profil",
      font: { // Allgemeiner Font für Profil-Inhalt
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        color: "#333333", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { // Font für Profil-Überschrift
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold", 
          color: "#1e40af",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {} // Feldspezifische Fonts können hier definiert werden
    },
    erfahrung: {
      sectionId: "erfahrung",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        color: "#333333", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold", 
          color: "#1e40af",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    },
    ausbildung: {
      sectionId: "ausbildung",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        color: "#333333", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold", 
          color: "#1e40af",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    },
    kenntnisse: {
      sectionId: "kenntnisse",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        color: "#333333", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold", 
          color: "#1e40af",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    },
    softskills: {
      sectionId: "softskills",
      font: { 
        family: "Inter", 
        size: 12, 
        weight: "normal", 
        color: "#333333", 
        lineHeight: 1.6,
        letterSpacing: 0
      },
      header: { 
        font: { 
          family: "Inter", 
          size: 16, 
          weight: "bold", 
          color: "#1e40af",
          lineHeight: 1.2,
          letterSpacing: 0
        }
      },
      fields: {}
    }
  }
};

interface StyleConfigContextValue {
  styleConfig: StyleConfig;
  updateStyleConfig: (config: StyleConfig) => void;
  resetStyleConfig: () => void;
}

const StyleConfigContext = createContext<StyleConfigContextValue | undefined>(
  undefined
);

export const StyleConfigProvider = ({ children }: { children: ReactNode }) => {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(
    defaultStyleConfig
  );

  const updateStyleConfig = (config: StyleConfig) => {
    console.log('StyleConfigContext: updateStyleConfig called with:', config);
    console.log('StyleConfigContext: config.colors in incoming config:', config.colors);
    
    setStyleConfig(prevConfig => {
      // Deep merge to preserve all existing data
      const mergedConfig = {
        ...prevConfig,
        ...config,
        colors: {
          ...prevConfig.colors,
          ...config.colors,
        },
        sections: {
          ...prevConfig.sections,
          ...config.sections,
        },
      };
      
      // Sync colors.* to legacy properties for backward compatibility
      if (mergedConfig.colors) {
        if (mergedConfig.colors.primary) mergedConfig.primaryColor = mergedConfig.colors.primary;
        if (mergedConfig.colors.accent) mergedConfig.accentColor = mergedConfig.colors.accent;
        if (mergedConfig.colors.background) mergedConfig.backgroundColor = mergedConfig.colors.background;
        if (mergedConfig.colors.text) mergedConfig.textColor = mergedConfig.colors.text;
      }
      
      // Sync legacy properties to colors.* (fallback for old code)
      if (!mergedConfig.colors) mergedConfig.colors = {};
      if (mergedConfig.primaryColor && !mergedConfig.colors.primary) mergedConfig.colors.primary = mergedConfig.primaryColor;
      if (mergedConfig.accentColor && !mergedConfig.colors.accent) mergedConfig.colors.accent = mergedConfig.accentColor;
      if (mergedConfig.backgroundColor && !mergedConfig.colors.background) mergedConfig.colors.background = mergedConfig.backgroundColor;
      if (mergedConfig.textColor && !mergedConfig.colors.text) mergedConfig.colors.text = mergedConfig.textColor;
      
      console.log('StyleConfigContext: final merged colors:', mergedConfig.colors);
      console.log('StyleConfigContext: final merged sections:', Object.keys(mergedConfig.sections || {}));
      
      return mergedConfig;
    });
  };

  const resetStyleConfig = () => {
    console.log('StyleConfigContext: resetStyleConfig called, resetting to default');
    console.log('StyleConfigContext: default sections:', defaultStyleConfig.sections);
    console.log('StyleConfigContext: default colors:', defaultStyleConfig.colors);
    setStyleConfig(defaultStyleConfig);
  };

  return (
    <StyleConfigContext.Provider
      value={{ styleConfig, updateStyleConfig, resetStyleConfig }}
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
