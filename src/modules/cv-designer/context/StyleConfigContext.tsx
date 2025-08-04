import React, { createContext, useContext, useState, ReactNode } from "react";
import { StyleConfig } from "../types/styles";

/**
 * 🟢 Hilfsfunktion: Normalisiert colors-Objekt aus Root-Level Properties
 */
function normalizeColors(config: StyleConfig): StyleConfig {
  console.log('StyleConfigContext: normalizeColors - input config:', {
    hasColors: !!config.colors,
    primaryColor: config.primaryColor,
    accentColor: config.accentColor,
    backgroundColor: config.backgroundColor,
    textColor: config.textColor
  });

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

  console.log('StyleConfigContext: normalizeColors - output colors:', config.colors);
  
  return config;
}

/**
 * 🟢 Default-StyleConfig mit vollständigem colors-Objekt
 */
const defaultStyleConfig: StyleConfig = {
  // Legacy properties for backward compatibility
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
    normalizeColors(defaultStyleConfig)
  );

  const updateStyleConfig = (config: StyleConfig) => {
    console.log('StyleConfigContext: updateStyleConfig called with:', config);
    console.log('StyleConfigContext: input config.colors:', config.colors);
    
    setStyleConfig(prevConfig => {
      console.log('StyleConfigContext: prevConfig.colors before merge:', prevConfig.colors);
      
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
      
      // Normalisiere das Ergebnis
      const normalizedConfig = normalizeColors(mergedConfig);
      
      console.log('StyleConfigContext: final merged colors:', normalizedConfig.colors);
      console.log('StyleConfigContext: final merged sections:', Object.keys(normalizedConfig.sections || {}));
      
      return normalizedConfig;
    });
  };

  const resetStyleConfig = () => {
    console.log('StyleConfigContext: resetStyleConfig called, resetting to default');
    console.log('StyleConfigContext: default colors:', defaultStyleConfig.colors);
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

export const useStyleConfig = () => {
  const context = useContext(StyleConfigContext);
  if (!context) {
    throw new Error("useStyleConfig must be used within StyleConfigProvider");
  }
  return context;
};