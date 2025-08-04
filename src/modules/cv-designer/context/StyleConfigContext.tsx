// 📄 src/modules/cv-designer/context/StyleConfigContext.tsx

import React, { createContext, useContext, useState, ReactNode } from "react";
import { StyleConfig, SectionConfig, FontConfig } from "../types/styles";

// 🎯 Default Font – Basiswerte
export const defaultFont: FontConfig = {
  family: "Inter",
  size: 12,
  weight: "normal",
  style: "normal",
  color: "#333333",
  letterSpacing: 0,
  lineHeight: 1.6,
};

// 🎯 Default SectionConfig
const defaultSection: SectionConfig = {
  font: { ...defaultFont },
  header: { font: { ...defaultFont } },
  fields: {},
};

// 🎯 Default StyleConfig (nur Sections)
const defaultStyleConfig: StyleConfig = {
  sections: {
    profil: { ...defaultSection },
    erfahrung: { ...defaultSection },
    ausbildung: { ...defaultSection },
    kenntnisse: { ...defaultSection },
    softskills: { ...defaultSection },
  },
};

interface StyleConfigContextProps {
  styleConfig: StyleConfig;
  updateStyleConfig: (updates: Partial<StyleConfig>) => void;
  resetStyleConfig: () => void;
}

const StyleConfigContext = createContext<StyleConfigContextProps | undefined>(
  undefined
);

export const StyleConfigProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(
    defaultStyleConfig
  );

  /**
   * Updates the styleConfig with deep merge for sections
   */
  const updateStyleConfig = (updates: Partial<StyleConfig>) => {
    console.log("🔧 updateStyleConfig called with:", updates);

    setStyleConfig((prev) => {
      const merged: StyleConfig = {
        ...prev,
        ...updates,
        sections: {
          ...prev.sections,
          ...updates.sections,
        },
      };

      console.log("🔧 Merged styleConfig:", merged);
      return merged;
    });
  };

  /**
   * Reset to defaults
   */
  const resetStyleConfig = () => {
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
  const ctx = useContext(StyleConfigContext);
  if (!ctx) {
    throw new Error(
      "useStyleConfig must be used within a StyleConfigProvider"
    );
  }
  return ctx;
};
