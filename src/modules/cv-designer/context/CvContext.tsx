/**
 * CV-Designer Module - React Context
 * Phase 3: Context provider for CV template state management
 */

import React, { createContext, useContext } from 'react';
import { useTemplateStorage } from '../hooks/useTemplateStorage';
import { CvContextType, CvProviderProps } from '../types/context';

const CvContext = createContext<CvContextType | undefined>(undefined);

export function CvProvider({ children }: CvProviderProps) {
  const {
    templates,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    updateTemplate,
    isLoading,
    error
  } = useTemplateStorage();

  const contextValue: CvContextType = {
    templates,
    isLoading,
    error,
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    updateTemplate,
  };

  return (
    <CvContext.Provider value={contextValue}>
      {children}
    </CvContext.Provider>
  );
}

export function useCvContext(): CvContextType {
  const context = useContext(CvContext);
  if (!context) {
    throw new Error('useCvContext must be used within a CvProvider');
  }
  return context;
}

export { CvContext };
