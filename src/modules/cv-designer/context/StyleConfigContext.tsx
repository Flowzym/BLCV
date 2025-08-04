import React, { createContext, useContext, useState, ReactNode } from "react";
import { StyleConfig } from "../types/styles";

/**
 * 🟢 Default-StyleConfig – verhindert undefined-Werte
 */
const defaultStyleConfig: StyleConfig = {
  font: {
    family: "Inter",
    size: 12,
    weight: "normal",
    color: "#000000",
    letterSpacing: 0,
    lineHeight: 1.6,
  },
  colors: {
    primary: "#1e40af",
    secondary: "#3b82f6",
    accent: "#3b82f6",
    text: "#333333",
    textSecondary: "#6b7280",
    background: "#ffffff",
    border: "#e5e7eb",
    text: "#333333",
  },
  spacing: {
    margin: 24,
    padding: 12,
  },
  borderRadius: 4,
  borderColor: "#e5e7eb",
  borderWidth: 1,
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
  },
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
    // ✅ fix: fonts werden korrekt gespeichert
    console.log('StyleConfigContext: updateStyleConfig called with:', config);
    console.log('StyleConfigContext: sections in new config:', config.sections);
    console.log('StyleConfigContext: merging with existing config to preserve sections');
    
    // Merge with existing config to preserve sections that might not be in the update
    let mergedConfig = {
      ...styleConfig,
      ...config,
      colors: {
        ...styleConfig.colors,
        ...config.colors
      },
      sections: {
        ...styleConfig.sections,
        ...config.sections
      }
    };
    
    // Sync legacy properties with colors structure for backward compatibility
    if (mergedConfig.colors) {
      mergedConfig.primaryColor = mergedConfig.colors.primary;
      mergedConfig.accentColor = mergedConfig.colors.accent;
      mergedConfig.backgroundColor = mergedConfig.colors.background;
      mergedConfig.textColor = mergedConfig.colors.text;
    }
    
    // Sync colors structure with legacy properties if they were updated directly
    if (config.primaryColor && !config.colors?.primary) {
      mergedConfig.colors = { ...mergedConfig.colors, primary: config.primaryColor };
    }
    if (config.accentColor && !config.colors?.accent) {
      mergedConfig.colors = { ...mergedConfig.colors, accent: config.accentColor };
    }
    if (config.backgroundColor && !config.colors?.background) {
      mergedConfig.colors = { ...mergedConfig.colors, background: config.backgroundColor };
    }
    if (config.textColor && !config.colors?.text) {
      mergedConfig.colors = { ...mergedConfig.colors, text: config.textColor };
    }
    
    console.log('StyleConfigContext: final merged config:', mergedConfig);
    console.log('StyleConfigContext: final merged sections:', mergedConfig.sections);
    console.log('StyleConfigContext: final merged colors:', mergedConfig.colors);
    setStyleConfig(mergedConfig);
  };

  const resetStyleConfig = () => {
    // ✅ fix: fonts werden korrekt gespeichert
    console.log('StyleConfigContext: resetStyleConfig called, resetting to default');
    console.log('StyleConfigContext: default sections:', defaultStyleConfig.sections);
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
