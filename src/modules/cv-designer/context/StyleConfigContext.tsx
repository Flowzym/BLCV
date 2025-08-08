// src/modules/cv-designer/context/StyleConfigContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type StyleConfig = {
  fontFamily: string;
  fontSize: number;
  colorPrimary: string;
  spacing: number;
};

const defaultStyle: StyleConfig = {
  fontFamily: 'Inter',
  fontSize: 12,
  colorPrimary: '#111827',
  spacing: 8,
};

const Ctx = createContext<{ style: StyleConfig; setStyle: (p: Partial<StyleConfig>) => void } | null>(null);

export const StyleConfigProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [style, setStyleState] = useState<StyleConfig>(defaultStyle);
  const setStyle = (p: Partial<StyleConfig>) => setStyleState((s) => ({ ...s, ...p }));
  return <Ctx.Provider value={{ style, setStyle }}>{children}</Ctx.Provider>;
};

export const useStyleConfig = () => {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStyleConfig must be used within StyleConfigProvider');
  return v;
};
