/**
 * CV-Designer Module - React Context
 * Phase 3: Context provider for CV template state management
 */

import React, { createContext, useContext, useCallback } from 'react';
import { useTemplateStorage } from '../hooks/useTemplateStorage';
import { CvContextType, CvProviderProps } from '../types/context';

const CvContext = createContext<CvContextType | undefined>(undefined);

/**
 * Provider component that wraps the useTemplateStorage hook
 * and provides CV template state and actions via React Context
 */
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

  const clearError = useCallback(() => {
    // Error clearing would be implemented in useTemplateStorage
    // For now, this is a placeholder for the interface
    console.warn('clearError not yet implemented in useTemplateStorage');
  }, []);

  const refreshTemplates = useCallback(() => {
    // Template refresh would trigger a reload from storage
    // For now, this is a placeholder for the interface
    console.warn('refreshTemplates not yet implemented in useTemplateStorage');
  }, []);

  const contextValue: CvContextType = {
    // State
    templates,
    isLoading,
    error,
    
    // Actions
    saveTemplate,
    loadTemplate,
    deleteTemplate,
    updateTemplate,
    clearError,
    refreshTemplates
  };

  return (
    <CvContext.Provider value={contextValue}>
      {children}
    </CvContext.Provider>
  );
}

/**
 * Hook to consume the CV context
 * Must be used within a CvProvider
 */
export function useCvContext(): CvContextType {
  const context = useContext(CvContext);
  
  if (context === undefined) {
    throw new Error('useCvContext must be used within a CvProvider');
  }
  
  return context;
}

export { CvContext };