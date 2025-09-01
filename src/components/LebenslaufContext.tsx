import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { genId } from '@/lib/id';
import { validateAndNormalizeCV } from '@/lib/cvValidation';
import { loadCVSuggestions, CVSuggestionConfig, ProfileSourceMapping, isSupabaseConfigured } from '../services/supabaseService';

// Types
interface PersonalData {
  [key: string]: any;
  summary?: string; // Mapped from ProfileInput's zusatzangaben
  skillsSummary?: string; // Aggregated skills from ProfileInput
  softSkillsSummary?: string; // Aggregated soft skills from ProfileInput
  taetigkeitenSummary?: string; // Aggregated tätigkeiten from ProfileInput
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
  source?: 'manual' | 'profile'; // Track data source for non-destructive updates
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
  source?: 'manual' | 'profile'; // Track data source for non-destructive updates
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
  
  // ProfileInput integration methods
  addExperienceFromProfile: (position: string) => void;
  removeExperienceFromProfile: (position: string) => void;
  addEducationFromProfile: (abschluss: string) => void;
  removeEducationFromProfile: (abschluss: string) => void;
  
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

  // Snapshot (optional)
  autosaveEnabled: boolean;
  setAutosaveEnabled: (enabled: boolean) => void;
  saveSnapshot: () => boolean;
  loadSnapshot: () => boolean;
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

  // Factory functions for robust object creation
  const createExperience = useCallback((partial: Partial<Experience>): Experience => {
    return {
      id: genId('exp'),
      companies: partial.companies || [],
      position: partial.position || [],
      startMonth: partial.startMonth || null,
      startYear: partial.startYear || null,
      endMonth: partial.endMonth || null,
      endYear: partial.endYear || null,
      isCurrent: partial.isCurrent || false,
      aufgabenbereiche: partial.aufgabenbereiche || [],
      zusatzangaben: partial.zusatzangaben || '',
      leasingCompaniesList: partial.leasingCompaniesList || [],
      source: partial.source || 'manual'
    };
  }, []);

  const createEducation = useCallback((partial: Partial<Education>): Education => {
    return {
      id: genId('edu'),
      institution: partial.institution || [],
      ausbildungsart: partial.ausbildungsart || [],
      abschluss: partial.abschluss || [],
      startMonth: partial.startMonth || null,
      startYear: partial.startYear || null,
      endMonth: partial.endMonth || null,
      endYear: partial.endYear || null,
      isCurrent: partial.isCurrent || false,
      zusatzangaben: partial.zusatzangaben || '',
      source: partial.source || 'manual'
    };
  }, []);

  // Load CV suggestions from Supabase
  useEffect(() => {
    const loadSuggestions = async () => {
      // Check if Supabase is configured before attempting to load
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, using empty CV suggestions');
        setCvSuggestions({
          companies: [],
          positions: [],
          aufgabenbereiche: []
        });
        return;
      }

      try {
        const suggestions = await loadCVSuggestions(profileSourceMappings);
        setCvSuggestions(suggestions);
      } catch (error) {
        console.error('Failed to load CV suggestions:', error);
        // Set empty suggestions on error
        setCvSuggestions({
          companies: [],
          positions: [],
          aufgabenbereiche: []
        });
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
    
    const newExperience = createExperience(experience);
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
    
    const newEducation = createEducation(education);
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

  // ProfileInput integration methods - non-destructive operations
  const addExperienceFromProfile = useCallback((position: string) => {
    // Check if position already exists in profile-sourced experiences
    const existingProfileExp = berufserfahrung.find(exp => 
      exp.source === 'profile' && exp.position.includes(position)
    );
    
    if (!existingProfileExp) {
      const newExperience = createExperience({
        position: [position],
        companies: [],
        aufgabenbereiche: [],
        source: 'profile'
      });
      setBerufserfahrung(prev => [...prev, newExperience]);
    }
  }, [berufserfahrung, createExperience]);

  const removeExperienceFromProfile = useCallback((position: string) => {
    // Only remove experiences that were created from ProfileInput
    setBerufserfahrung(prev => prev.filter(exp => 
      !(exp.source === 'profile' && exp.position.includes(position))
    ));
  }, []);

  const addEducationFromProfile = useCallback((abschluss: string) => {
    // Check if abschluss already exists in profile-sourced educations
    const existingProfileEdu = ausbildung.find(edu => 
      edu.source === 'profile' && edu.abschluss.includes(abschluss)
    );
    
    if (!existingProfileEdu) {
      const newEducation = createEducation({
        abschluss: [abschluss],
        institution: [],
        ausbildungsart: [],
        source: 'profile'
      });
      setAusbildung(prev => [...prev, newEducation]);
    }
  }, [ausbildung, createEducation]);

  const removeEducationFromProfile = useCallback((abschluss: string) => {
    // Only remove educations that were created from ProfileInput
    setAusbildung(prev => prev.filter(edu => 
      !(edu.source === 'profile' && edu.abschluss.includes(abschluss))
    ));
  }, []);

  // BIS methods
  const toggleBisTaskSelection = (task: string) => {
    setSelectedBisTasks(prev => 
      prev.includes(task)
        ? prev.filter(t => t !== task)
        : [...prev, task]
    );
  };


  // --- Snapshot (optional) ---
  const [autosaveEnabled, setAutosaveEnabled] = useState<boolean>(false);
  const saveSnapshot = useCallback(() => {
    try {
      const payload = {
        version: 2,
        savedAt: new Date().toISOString(),
        personalData,
        berufserfahrung,
        ausbildung,
        selectedExperienceId,
        selectedEducationId,
        favoriteTasks,
        favoriteCompanies,
        favoritePositions,
        favoriteInstitutions,
        favoriteAusbildungsarten,
        favoriteAbschluesse,
        activeTab,
        previewTab,
      };
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem('CV_SNAPSHOT_V1', JSON.stringify(payload));
      }
      return true;
    } catch (e) { console.warn('Snapshot save failed', e); return false; }
  }, [personalData, berufserfahrung, ausbildung]);

  const loadSnapshot = useCallback(() => {
    try {
      if (typeof window === 'undefined' || !window.localStorage) return false;
      const raw = window.localStorage.getItem('CV_SNAPSHOT_V1');
      if (!raw) return false;
      const parsed = JSON.parse(raw);
      if (parsed && (parsed.version === 1 || parsed.version === 2)) {
        const { ok, issues, normalized } = validateAndNormalizeCV(parsed);
        if (!ok && issues && issues.length) { console.warn('CV snapshot issues:', issues); }
        setPersonalData(normalized.personalData || {});
        setBerufserfahrung(Array.isArray(normalized.berufserfahrung) ? normalized.berufserfahrung : []);
        setAusbildung(Array.isArray(normalized.ausbildung) ? normalized.ausbildung : []);
        return true;
      }
      return false;
    } catch (e) { console.warn('Snapshot load failed', e); return false; }
  }, []);

  useEffect(() => {
    if (!autosaveEnabled) return;
    const h = setTimeout(() => { saveSnapshot(); }, 1500);
    return () => clearTimeout(h);
  }, [autosaveEnabled, personalData, berufserfahrung, ausbildung, saveSnapshot]);

  // Helper functions to ensure a valid entry exists for editing
  const ensureSelectedExperienceExists = useCallback(() => {
    // If we have a valid selected experience, return its ID
    if (selectedExperienceId && berufserfahrung.some(exp => exp.id === selectedExperienceId)) {
      return selectedExperienceId;
    }
    
    // No valid selection - create a new entry
    const newExp = createExperience({
      companies: [],
      position: [],
      startMonth: null,
      startYear: "",
      endMonth: null,
      endYear: null,
      isCurrent: false,
      aufgabenbereiche: [],
      zusatzangaben: "",
      source: 'manual'
    });
    
    setBerufserfahrung(prev => [...prev, newExp]);
    setSelectedExperienceId(newExp.id);
    return newExp.id;
  }, [selectedExperienceId, berufserfahrung, createExperience]);

  const ensureSelectedEducationExists = useCallback(() => {
    // If we have a valid selected education, return its ID
    if (selectedEducationId && ausbildung.some(edu => edu.id === selectedEducationId)) {
      return selectedEducationId;
    }
    
    // No valid selection - create a new entry
    const newEdu = createEducation({
      institution: [],
      ausbildungsart: [],
      abschluss: [],
      startMonth: null,
      startYear: "",
      endMonth: null,
      endYear: null,
      isCurrent: false,
      zusatzangaben: "",
      source: 'manual'
    });
    
    setAusbildung(prev => [...prev, newEdu]);
    setSelectedEducationId(newEdu.id);
    return newEdu.id;
  }, [selectedEducationId, ausbildung, createEducation]);

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
    
    addExperienceFromProfile,
    removeExperienceFromProfile,
    addEducationFromProfile,
    removeEducationFromProfile,
    
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
    autosaveEnabled,
    setAutosaveEnabled,
    saveSnapshot,
    loadSnapshot,
    loadSnapshot
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
