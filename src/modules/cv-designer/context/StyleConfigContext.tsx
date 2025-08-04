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
    primary: "#1e40af", // Beispielwert
    secondary: "#3b82f6", // Beispielwert
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
    // Merge incoming config with current state, prioritizing incoming values
    // This ensures that partial updates (e.g., only colors) are correctly applied
    // without losing other parts of the config (e.g., sections, fonts).
    setStyleConfig(prevConfig => ({
      ...prevConfig,
      ...config,
      colors: { // Deep merge colors object
        ...prevConfig.colors,
        ...config.colors,
      },
      // Sections and fonts are already handled by their respective panels
    }));
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
