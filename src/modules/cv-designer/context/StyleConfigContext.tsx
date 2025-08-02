import React, { createContext, useContext, useState } from "react";
import { StyleConfig } from "@/types/cv-designer";
import { defaultStyleConfig } from "@/modules/cv-designer/config/defaultStyleConfig";

type StyleContextType = {
  styleConfig: StyleConfig;
  setStyleConfig: (config: StyleConfig) => void;
  updateStyleConfig: (updates: Partial<StyleConfig>) => void;
};

const defaultContext: StyleContextType = {
  styleConfig: defaultStyleConfig,
  setStyleConfig: () => {},
  updateStyleConfig: () => {},
};

const StyleConfigContext = createContext<StyleContextType>(defaultContext);

export function StyleConfigProvider({
  children,
  initialConfig = {},
}: {
  children: React.ReactNode;
  initialConfig?: Partial<StyleConfig>;
}) {
  const [styleConfig, setStyleConfig] = useState<StyleConfig>({
    ...defaultStyleConfig,
    ...initialConfig,
  });

  const updateStyleConfig = (updates: Partial<StyleConfig>) => {
    setStyleConfig(prev => ({ ...prev, ...updates }));
  };

  return (
    <StyleConfigContext.Provider value={{ styleConfig, setStyleConfig, updateStyleConfig }}>
      {children}
    </StyleConfigContext.Provider>
  );
}

export const useStyleConfig = () => useContext(StyleConfigContext);
