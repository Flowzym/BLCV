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
    background: "#ffffff",
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
    setStyleConfig(config);
  };

  const resetStyleConfig = () => {
    // ✅ fix: fonts werden korrekt gespeichert
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
