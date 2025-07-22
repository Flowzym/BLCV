import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { loadCVSuggestions, CVSuggestionConfig, ProfileSourceMapping } from '../services/supabaseService';

// Types
interface PersonalData {
  [key: string]: any;
}

interface Experience {
  id: string;
  companies: string[];
  position: string[];
  startMonth: string | null;
  startYear: string | null;
  endMonth: string | null;
  endYear: string | null;
  isCurrent: boolean;
  aufgabenbereiche: string[];
  zusatzangaben: string;
  leasingCompaniesList?: string[];
}

interface Education {
  id: string;
  institution: string[];
  ausbildungsart: string[];
  abschluss: string[];
  startMonth: string | null;
  startYear: string | null;
  endMonth: string | null;
  endYear: string | null;
  isCurrent: boolean;
  zusatzangaben: string;
}

type PreviewTab = 'gesamt' | 'berufserfahrung' | 'ausbildung' | 'fachkompetenzen' | 'softskills';
type ActiveTab = 'personal' | 'experience' | 'education' | 'skills' | 'softskills';

// Mapping zwischen Input-Tabs und Preview-Tabs
const INPUT_TO_PREVIEW_TAB_MAP: Record<ActiveTab, PreviewTab> = {
  personal: 'gesamt',
  experience: 'berufserfahrung',
  education: 'ausbildung',
  skills: 'fachkompetenzen',
  softskills: 'softskills'
};

const PREVIEW_TO_INPUT_TAB_MAP: Record<PreviewTab, ActiveTab> = {
  gesamt: 'personal',
  berufserfahrung: 'experience',
  ausbildung: 'education',
  fachkompetenzen: 'skills',
  softskills: 'softskills'
};

interface LebenslaufContextType {
  personalData: PersonalData;
  berufserfahrung: Experience[];
  ausbildung: Education[];
  selectedExperienceId: string;
  selectedEducationId: string;
  multiSelectedExperienceIds: string[];
  favoriteTasks: string[];
  favoriteCompanies: string[];
  favoritePositions: string[];
  favoriteInstitutions: string[];
  favoriteAusbildungsarten: string[];
  favoriteAbschluesse: string[];
  isBisTranslatorActive: boolean;
  selectedBisTasks: string[];
  bisTranslatorResults: Record<string, string[]>;
  previewTab: PreviewTab;
  activeTab: ActiveTab;
  cvSuggestions: any;
  
  // Personal data methods
  updatePersonalData: (data: PersonalData) => void;
  
  // Experience methods
  addExperience: (experience: Partial<Experience>) => void;
  updateExperience: (id: string, experience: Partial<Experience>) => void;
  selectExperience: (id: string) => void;
  toggleMultiExperienceSelection: (id: string) => void;
  deleteExperience: (id: string) => void;
  updateExperienceField: (id: string, field: string, value: any) => void;
  updateExperienceTask: (id: string, taskIndex: number, newTask: string) => void;
  updateExperienceTasksOrder: (id: string, newTasks: string[]) => void;
  addExperienceTask: (id: string, task: string) => void;
  
  // Education methods
  addEducation: (education: Partial<Education>) => void;
  updateEducation: (id: string, education: Partial<Education>) => void;
  selectEducation: (id: string) => void;
  deleteEducation: (id: string) => void;
  updateEducationField: (id: string, field: string, value: any) => void;
  
  // Task methods
  toggleFavoriteTask: (task: string) => void;
  toggleFavoriteCompany: (company: string) => void;
  toggleFavoritePosition: (position: string) => void;
  toggleFavoriteInstitution: (institution: string) => void;
  toggleFavoriteAusbildungsart: (ausbildungsart: string) => void;
  toggleFavoriteAbschluss: (abschluss: string) => void;
  
  // BIS methods
  setIsBisTranslatorActive: (active: boolean) => void;
  toggleBisTaskSelection: (task: string) => void;
  setBisTranslatorResults: (results: Record<string, string[]>) => void;
  
  // Preview tab methods
  setPreviewTab: (tab: PreviewTab) => void;
  
  // Active tab methods
  setActiveTab: (tab: ActiveTab) => void;
  
  // Tab synchronization methods
  setActiveTabWithSync: (tab: ActiveTab) => void;
  setPreviewTabWithSync: (tab: PreviewTab) => void;
  
  // Helper methods to ensure valid entries exist
  ensureSelectedExperienceExists: () => string;
  ensureSelectedEducationExists: () => string;
  isEmptyExperience: (exp: Experience) => boolean;
  isEmptyEducation: (edu: Education) => boolean;
}

const LebenslaufContext = createContext<LebenslaufContextType | undefined>(undefined);

export function LebenslaufProvider({ children }: { children: ReactNode }) {
  const [profileSourceMappings] = useState<ProfileSourceMapping[]>(() => {
    try {
      const saved = localStorage.getItem('profileSourceMappings');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading profileSourceMappings:', error);
      return [];
    }
  });

  const [personalData, setPersonalData] = useState<PersonalData>({});
  const [berufserfahrung, setBerufserfahrung] = useState<Experience[]>([]);
  const [ausbildung, setAusbildung] = useState<Education[]>([]);
  const [selectedExperienceId, setSelectedExperienceId] = useState<string>('');
  const [selectedEducationId, setSelectedEducationId] = useState<string>('');
  const [multiSelectedExperienceIds, setMultiSelectedExperienceIds] = useState<string[]>([]);
  const [favoriteTasks, setFavoriteTasks] = useState<string[]>([]);
  const [favoriteCompanies, setFavoriteCompanies] = useState<string[]>([]);
  const [favoritePositions, setFavoritePositions] = useState<string[]>([]);
  const [favoriteInstitutions, setFavoriteInstitutions] = useState<string[]>([]);
  const [favoriteAusbildungsarten, setFavoriteAusbildungsarten] = useState<string[]>([]);
  const [favoriteAbschluesse, setFavoriteAbschluesse] = useState<string[]>([]);
  const [isBisTranslatorActive, setIsBisTranslatorActive] = useState<boolean>(false);
  const [selectedBisTasks, setSelectedBisTasks] = useState<string[]>([]);
  const [bisTranslatorResults, setBisTranslatorResults] = useState<Record<string, string[]>>({});
  const [previewTab, setPreviewTab] = useState<PreviewTab>('gesamt');
  const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
  const [cvSuggestions, setCvSuggestions] = useState<CVSuggestionConfig>({
    companies: [],
    positions: [],
    aufgabenbereiche: []
  });

  // Zeitraum update methods - moved to top to avoid ReferenceError
  const updateExperienceZeitraum = useCallback((id: string, zeitraumData: {
    startMonth?: string;
    startYear?: string;
    endMonth?: string;
    endYear?: string;
    isCurrent?: boolean;
  }) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id ? {
        ...exp,
        startMonth: zeitraumData.startMonth !== undefined ? zeitraumData.startMonth : exp.startMonth,
        startYear: zeitraumData.startYear !== undefined ? zeitraumData.startYear : exp.startYear,
        endMonth: zeitraumData.endMonth !== undefined ? zeitraumData.endMonth : exp.endMonth,
        endYear: zeitraumData.endYear !== undefined ? zeitraumData.endYear : exp.endYear,
        isCurrent: zeitraumData.isCurrent !== undefined ? zeitraumData.isCurrent : exp.isCurrent,
      } : exp
    ));
  }, []);

  const updateEducationZeitraum = useCallback((id: string, zeitraumData: {
    startMonth?: string;
    startYear?: string;
    endMonth?: string;
    endYear?: string;
    isCurrent?: boolean;
  }) => {
    setAusbildung(prev => prev.map(edu => 
      edu.id === id ? {
        ...edu,
        startMonth: zeitraumData.startMonth !== undefined ? zeitraumData.startMonth : edu.startMonth,
        startYear: zeitraumData.startYear !== undefined ? zeitraumData.startYear : edu.startYear,
        endMonth: zeitraumData.endMonth !== undefined ? zeitraumData.endMonth : edu.endMonth,
        endYear: zeitraumData.endYear !== undefined ? zeitraumData.endYear : edu.endYear,
        isCurrent: zeitraumData.isCurrent !== undefined ? zeitraumData.isCurrent : edu.isCurrent,
      } : edu
    ));
  }, []);

  // Load CV suggestions from Supabase
  useEffect(() => {
    const loadSuggestions = async () => {
      try {
        const suggestions = await loadCVSuggestions(profileSourceMappings);
        setCvSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load CV suggestions:', error);
        // Keep default empty suggestions on error
      }
    };

    loadSuggestions();
  }, [profileSourceMappings]);

  // Tab synchronization methods
  const setActiveTabWithSync = useCallback((tab: ActiveTab) => {
    setActiveTab(tab);
    const correspondingPreviewTab = INPUT_TO_PREVIEW_TAB_MAP[tab];
    setPreviewTab(correspondingPreviewTab);
  }, []);
  
  const setPreviewTabWithSync = useCallback((tab: PreviewTab) => {
    setPreviewTab(tab);
    const correspondingInputTab = PREVIEW_TO_INPUT_TAB_MAP[tab];
    setActiveTab(correspondingInputTab);
  }, []);

  // Personal data methods
  const updatePersonalData = (data: PersonalData) => {
    setPersonalData(data);
  };

  // Experience methods
  const addExperience = (experience: Partial<Experience>) => {
    // Check if there's already an empty experience that's not selected
    const existingEmptyExp = berufserfahrung.find(exp => 
      isEmptyExperience(exp) && exp.id !== selectedExperienceId
    );
    
    // If there's an existing empty experience, select it instead of creating a new one
    if (existingEmptyExp) {
      setSelectedExperienceId(existingEmptyExp.id);
      return existingEmptyExp.id;
    }
    
    const newExperience: Experience = {
      id: Date.now().toString(),
      companies: experience.companies || [],
      position: experience.position || [],
      startMonth: experience.startMonth || null,
      startYear: experience.startYear || null,
      endMonth: experience.endMonth || null,
      endYear: experience.endYear || null,
      isCurrent: experience.isCurrent || false,
      aufgabenbereiche: experience.aufgabenbereiche || [],
      zusatzangaben: experience.zusatzangaben || '',
      leasingCompaniesList: experience.leasingCompaniesList || []
    };
    setBerufserfahrung(prev => [...prev, newExperience]);
    setSelectedExperienceId(newExperience.id); // Immediately select the new entry
    return newExperience.id;
  };

  const updateExperience = (id: string, experience: Partial<Experience>) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id ? { ...exp, ...experience } : exp
    ));
  };

  const selectExperience = (id: string) => {
    // If switching away from a currently selected empty experience, delete it
    if (selectedExperienceId && selectedExperienceId !== id) {
      const currentExp = berufserfahrung.find(exp => exp.id === selectedExperienceId);
      if (currentExp && isEmptyExperience(currentExp)) {
        setBerufserfahrung(prev => prev.filter(exp => exp.id !== selectedExperienceId));
        setMultiSelectedExperienceIds(prev => prev.filter(expId => expId !== selectedExperienceId));
      }
    }
    
    setSelectedExperienceId(id);
  };

  const toggleMultiExperienceSelection = (id: string) => {
    setMultiSelectedExperienceIds(prev => 
      prev.includes(id) 
        ? prev.filter(expId => expId !== id)
        : [...prev, id]
    );
  };

  const deleteExperience = (id: string) => {
    setBerufserfahrung(prev => prev.filter(exp => exp.id !== id));
    setMultiSelectedExperienceIds(prev => prev.filter(expId => expId !== id));
  };

  const updateExperienceField = (id: string, field: string, value: any) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id ? { ...exp, [field]: value } : exp
    ));
  };

  const updateExperienceTask = (id: string, taskIndex: number, newTask: string) => {
    setBerufserfahrung(prev => prev.map(exp => {
      if (exp.id === id && exp.aufgabenbereiche) {
        const newTasks = [...exp.aufgabenbereiche];
        newTasks[taskIndex] = newTask;
        return { ...exp, aufgabenbereiche: newTasks };
      }
      return exp;
    }));
  };

  const updateExperienceTasksOrder = (id: string, newTasks: string[]) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id ? { ...exp, aufgabenbereiche: newTasks } : exp
    ));
  };

  const addExperienceTask = (id: string, task: string) => {
    setBerufserfahrung(prev => prev.map(exp => 
      exp.id === id 
        ? { ...exp, aufgabenbereiche: [...(exp.aufgabenbereiche || []), task] }
        : exp
    ));
  };

  // Education methods
  const addEducation = (education: Partial<Education>) => {
    // Check if there's already an empty education that's not selected
    const existingEmptyEdu = ausbildung.find(edu => 
      isEmptyEducation(edu) && edu.id !== selectedEducationId
    );
    
    // If there's an existing empty education, select it instead of creating a new one
    if (existingEmptyEdu) {
      setSelectedEducationId(existingEmptyEdu.id);
      return existingEmptyEdu.id;
    }
    
    const newEducation: Education = {
      id: Date.now().toString(),
      institution: education.institution || [],
      ausbildungsart: education.ausbildungsart || [],
      abschluss: education.abschluss || [],
      startMonth: education.startMonth || null,
      startYear: education.startYear || null,
      endMonth: education.endMonth || null,
      endYear: education.endYear || null,
      isCurrent: education.isCurrent || false,
      zusatzangaben: education.zusatzangaben || ''
    };
    setAusbildung(prev => [...prev, newEducation]);
    setSelectedEducationId(newEducation.id); // Immediately select the new entry
    return newEducation.id;
  };

  const updateEducation = (id: string, education: Partial<Education>) => {
    setAusbildung(prev => prev.map(edu => 
      edu.id === id ? { ...edu, ...education } : edu
    ));
  };

  const selectEducation = (id: string) => {
    // If switching away from a currently selected empty education, delete it
    if (selectedEducationId && selectedEducationId !== id) {
      const currentEdu = ausbildung.find(edu => edu.id === selectedEducationId);
      if (currentEdu && isEmptyEducation(currentEdu)) {
        setAusbildung(prev => prev.filter(edu => edu.id !== selectedEducationId));
      }
    }
    
    setSelectedEducationId(id);
  };

  const deleteEducation = (id: string) => {
    setAusbildung(prev => prev.filter(edu => edu.id !== id));
  };

  const updateEducationField = (id: string, field: string, value: any) => {
    setAusbildung(prev => prev.map(edu => 
      edu.id === id ? { ...edu, [field]: value } : edu
    ));
  };

  // Task methods
  const toggleFavoriteTask = (task: string) => {
    setFavoriteTasks(prev => 
      prev.includes(task)
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  const toggleFavoriteCompany = (company: string) => {
    setFavoriteCompanies(prev => 
      prev.includes(company)
        ? prev.filter(c => c !== company)
        : [...prev, company]
    );
  };

  const toggleFavoritePosition = (position: string) => {
    setFavoritePositions(prev => 
      prev.includes(position)
        ? prev.filter(p => p !== position)
        : [...prev, position]
    );
  };

  const toggleFavoriteInstitution = (institution: string) => {
    setFavoriteInstitutions(prev => 
      prev.includes(institution)
        ? prev.filter(i => i !== institution)
        : [...prev, institution]
    );
  };

  const toggleFavoriteAusbildungsart = (ausbildungsart: string) => {
    setFavoriteAusbildungsarten(prev => 
      prev.includes(ausbildungsart)
        ? prev.filter(a => a !== ausbildungsart)
        : [...prev, ausbildungsart]
    );
  };

  const toggleFavoriteAbschluss = (abschluss: string) => {
    setFavoriteAbschluesse(prev => 
      prev.includes(abschluss)
        ? prev.filter(a => a !== abschluss)
        : [...prev, abschluss]
    );
  };

  // BIS methods
  const toggleBisTaskSelection = (task: string) => {
    setSelectedBisTasks(prev => 
      prev.includes(task)
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };

  // Helper functions to ensure a valid entry exists for editing
  const ensureSelectedExperienceExists = useCallback(() => {
    // If we have a valid selected experience, return its ID
    if (selectedExperienceId && berufserfahrung.some(exp => exp.id === selectedExperienceId)) {
      return selectedExperienceId;
    }
    
    // No valid selection - create a new entry
    const newExp = {
      companies: [],
      position: [],
      startMonth: null,
      startYear: "",
      endMonth: null,
      endYear: null,
      isCurrent: false,
      aufgabenbereiche: [],
      zusatzangaben: ""
    };
    
    return addExperience(newExp);
  }, [selectedExperienceId, berufserfahrung, addExperience]);

  const ensureSelectedEducationExists = useCallback(() => {
    // If we have a valid selected education, return its ID
    if (selectedEducationId && ausbildung.some(edu => edu.id === selectedEducationId)) {
      return selectedEducationId;
    }
    
    // No valid selection - create a new entry
    const newEdu = {
      institution: [],
      ausbildungsart: [],
      abschluss: [],
      startMonth: null,
      startYear: "",
      endMonth: null,
      endYear: null,
      isCurrent: false,
      zusatzangaben: ""
    };
    
    return addEducation(newEdu);
  }, [selectedEducationId, ausbildung, addEducation]);

  const contextValue: LebenslaufContextType = {
    personalData,
    berufserfahrung,
    ausbildung,
    selectedExperienceId,
    selectedEducationId,
    multiSelectedExperienceIds,
    favoriteTasks,
    favoriteCompanies,
    favoritePositions,
    favoriteInstitutions,
    favoriteAusbildungsarten,
    favoriteAbschluesse,
    isBisTranslatorActive,
    selectedBisTasks,
    bisTranslatorResults,
    previewTab,
    activeTab,
    cvSuggestions,
    
    updatePersonalData,
    
    addExperience,
    updateExperience,
    selectExperience,
    toggleMultiExperienceSelection,
    deleteExperience,
    updateExperienceField,
    updateExperienceTask,
    updateExperienceTasksOrder,
    addExperienceTask,
    updateExperienceZeitraum,
    
    addEducation,
    updateEducation,
    selectEducation,
    deleteEducation,
    updateEducationField,
    updateEducationZeitraum,
    
    toggleFavoriteTask,
    toggleFavoriteCompany,
    toggleFavoritePosition,
    toggleFavoriteInstitution,
    toggleFavoriteAusbildungsart,
    toggleFavoriteAbschluss,
    
    setIsBisTranslatorActive,
    toggleBisTaskSelection,
    setBisTranslatorResults,
    
    setPreviewTab,
    setActiveTab,
    
    setActiveTabWithSync,
    setPreviewTabWithSync,
    
    ensureSelectedExperienceExists,
    ensureSelectedEducationExists,
    isEmptyExperience,
    isEmptyEducation,
  };

  return (
    <LebenslaufContext.Provider value={contextValue}>
      {children}
    </LebenslaufContext.Provider>
  );
}

export function useLebenslauf() {
  const context = useContext(LebenslaufContext);
  if (context === undefined) {
    throw new Error('useLebenslauf must be used within a LebenslaufProvider');
  }
  return context;
}
// Helper functions to check if entries are empty
const isEmptyExperience = (exp: Experience): boolean => {
  return (!exp.companies || exp.companies.length === 0) && 
         (!exp.position || exp.position.length === 0) && 
         (!exp.aufgabenbereiche || exp.aufgabenbereiche.length === 0) &&
         (!exp.startYear || exp.startYear.trim() === '') &&
         (!exp.zusatzangaben || exp.zusatzangaben.trim() === '') &&
         (!exp.leasingCompaniesList || exp.leasingCompaniesList.length === 0);
};

const isEmptyEducation = (edu: Education): boolean => {
  return (!edu.institution || edu.institution.length === 0) && 
         (!edu.ausbildungsart || edu.ausbildungsart.length === 0) && 
         (!edu.abschluss || edu.abschluss.length === 0) &&
         (!edu.startYear || edu.startYear.trim() === '') &&
         (!edu.zusatzangaben || edu.zusatzangaben.trim() === '');
};
