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
  sections: {}, // 🆕 keine Felder = leeres Objekt
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
    setStyleConfig(config);
  };

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
  const context = useContext(StyleConfigContext);
  if (!context) {
    throw new Error("useStyleConfig must be used within StyleConfigProvider");
  }
  return context;
};
