import React, { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { useLebenslauf } from './LebenslaufContext';
import PersonalDataForm from './PersonalDataForm';
import ExperienceForm from './ExperienceForm';
import AusbildungForm from './AusbildungForm';
import { Plus, Calendar, Building, Briefcase, ChevronRight, User, CircleOff } from 'lucide-react';

type TabType = 'personal' | 'experience' | 'education' | 'skills' | 'softskills';

const LebenslaufInput: React.FC = () => {
  // State to prevent multiple entries being created
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [isCreatingFromInput, setIsCreatingFromInput] = useState(false);

  const {
    personalData,
    updatePersonalData,
    berufserfahrung,
    addExperience,
    deleteExperience,
    updateExperienceField,
    selectedExperienceId,
    selectExperience,
    cvSuggestions,
    selectedEducationId,
    ausbildung,
    addEducation,
    deleteEducation,
    updateEducationField,
    activeTab,
    setActiveTabWithSync,
    selectEducation
  } = useLebenslauf();

  // Hilfsfunktion zum Prüfen ob eine Berufserfahrung leer ist
  const isEmptyExperience = (exp: any) => {
    return (!exp.companies || exp.companies.length === 0) && 
           exp.position.length === 0 && 
           exp.aufgabenbereiche.length === 0 &&
           !exp.startYear;
  };

  // Hilfsfunktion zum Prüfen ob eine Ausbildung leer ist
  const isEmptyEducation = (edu: any) => {
    return (!edu.institution || edu.institution.length === 0) && 
           (!edu.ausbildungsart || edu.ausbildungsart.length === 0) && 
           (!edu.abschluss || edu.abschluss.length === 0) &&
           !edu.startYear;
  };
  
  // Hilfsfunktion zum Erstellen einer neuen Berufserfahrung
  const createEmptyExperience = () => {
    if (isAddingEntry) return; // Prevent multiple entries
    setIsAddingEntry(true);
    
    const newExp = {
      companies: [],
      position: [],
      startMonth: null,
      startYear: "",
      endMonth: null,
      endYear: null,
      isCurrent: false,
      aufgabenbereiche: []
    };
    
    const newId = addExperience(newExp);
    selectExperience(newId);
    
    // Reset the flag after a short delay to ensure the operation is complete
    setTimeout(() => setIsAddingEntry(false), 100);
  };

  // Funktion zum Deselektieren aller Einträge (für Floating Button)
  const deselectAllEntries = () => {
    selectExperience('');
    selectEducation('');
  };

  // Hilfsfunktion zum Erstellen einer neuen Ausbildung
  const createEmptyEducation = () => {
    if (isAddingEntry) return; // Prevent multiple entries
    setIsAddingEntry(true);
    
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
    
    const newId = addEducation(newEdu);
    selectEducation(newId);
    
    // Reset the flag after a short delay to ensure the operation is complete
    setTimeout(() => setIsAddingEntry(false), 100);
  };

  useEffect(() => {
    if (activeTab === 'experience') {
      // Sicherstellen, dass eine Berufserfahrung ausgewählt ist, wenn der Tab 'experience' aktiv ist und Einträge vorhanden sind
      if (berufserfahrung.length > 0 && (!selectedExperienceId || !berufserfahrung.some(exp => exp.id === selectedExperienceId))) {
        selectExperience(berufserfahrung[0].id);
      }
    } else if (activeTab === 'education') {
      // Sicherstellen, dass eine Ausbildung ausgewählt ist, wenn der Tab 'education' aktiv ist und Einträge vorhanden sind
      if (ausbildung.length > 0 && (!selectedEducationId || !ausbildung.some(edu => edu.id === selectedEducationId))) {
        selectEducation(ausbildung[0].id);
      }
    }
    
    // Wenn der aktuell ausgewählte Eintrag gelöscht wurde, Auswahl aufheben
    if (selectedExperienceId && !berufserfahrung.some(exp => exp.id === selectedExperienceId)) {
      selectExperience('');
    }
    if (selectedEducationId && !ausbildung.some(edu => edu.id === selectedEducationId)) {
      selectEducation('');
    }
    
    // Cleanup leerer Einträge beim Tab-Wechsel
    berufserfahrung.forEach(exp => {
      if (exp.id !== selectedExperienceId && isEmptyExperience(exp)) {
        deleteExperience(exp.id);
      }
    });
    
    ausbildung.forEach(edu => {
      if (edu.id !== selectedEducationId && isEmptyEducation(edu)) {
        deleteEducation(edu.id);
      }
    });
  }, [activeTab]);

  // Beim ersten Laden
  useEffect(() => {
    // Removed automatic creation on first load - let user decide when to add entries
  }, []);

  // Auto-switch to experience tab when an experience is selected
  useEffect(() => {
    if (selectedExperienceId) {
      setActiveTabWithSync('experience');
    }
  }, [selectedExperienceId, setActiveTabWithSync]);

  // Auto-switch to education tab when an education is selected
  useEffect(() => {
    if (selectedEducationId) {
      setActiveTabWithSync('education');
    }
  }, [selectedEducationId, setActiveTabWithSync]);

  // Function to handle tab changes
  const handleTabChange = (tabId: TabType) => {
    setActiveTabWithSync(tabId);
  };

  // Helper function to create a new experience entry when user starts typing in empty form
  const getOrCreateExperienceId = useCallback(() => {
    // Prevent multiple rapid creations
    if (isCreatingFromInput) {
      return selectedExperienceId || '';
    }

    // If we have a selected experience, check if it's not empty
    if (selectedExperienceId) {
      const currentExp = berufserfahrung.find(exp => exp.id === selectedExperienceId);
      if (currentExp && !isEmptyExperience(currentExp)) {
        return selectedExperienceId;
      }
    }

    // Need to create a new experience
    setIsCreatingFromInput(true);
    
    try {
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
      
      const newId = addExperience(newExp);
      selectExperience(newId);
      
      // Reset the flag after state update
      setTimeout(() => setIsCreatingFromInput(false), 50);
      
      return newId;
    } catch (error) {
      console.error('Error creating experience:', error);
      setIsCreatingFromInput(false);
      return selectedExperienceId || '';
    }
  }, [selectedExperienceId, berufserfahrung, addExperience, selectExperience, isCreatingFromInput]);

  // Helper function to create a new education entry when user starts typing in empty form
  const getOrCreateEducationId = useCallback(() => {
    // Prevent multiple rapid creations
    if (isCreatingFromInput) {
      return selectedEducationId || '';
    }

    // If we have a selected education, check if it's not empty
    if (selectedEducationId) {
      const currentEdu = ausbildung.find(edu => edu.id === selectedEducationId);
      if (currentEdu && !isEmptyEducation(currentEdu)) {
        return selectedEducationId;
      }
    }

    // Need to create a new education
    setIsCreatingFromInput(true);
    
    try {
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
      
      const newId = addEducation(newEdu);
      selectEducation(newId);
      
      // Reset the flag after state update
      setTimeout(() => setIsCreatingFromInput(false), 50);
      
      return newId;
    } catch (error) {
      console.error('Error creating education:', error);
      setIsCreatingFromInput(false);
      return selectedEducationId || '';
    }
  }, [selectedEducationId, ausbildung, addEducation, selectEducation, isCreatingFromInput]);

  // Hilfsfunktion zum Formatieren des Zeitraums
  const formatZeitraum = (
    startMonth: string | null,
    startYear: string | null,
    endMonth: string | null,
    endYear: string | null,
    isCurrent: boolean,
  ) => {
    const format = (m: string | null | undefined, y: string | null | undefined) => {
      if (!y) return '';
      return m ? `${m}/${y}` : y;
    };

    const start = format(startMonth ?? undefined, startYear ?? undefined);
    const end = isCurrent ? 'heute' : format(endMonth ?? undefined, endYear ?? undefined);

    if (!start && !end) return '';
    if (start && end) return `${start} – ${end}`;
    return start || end;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalDataForm data={personalData} onChange={updatePersonalData} />;
      case 'experience':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Berufserfahrung {berufserfahrung.length > 0 && (
                <span className="ml-2 px-3 py-1.5 text-white text-sm font-bold rounded-full" style={{ backgroundColor: '#b5b7bb' }}>
                  {berufserfahrung.length}
                </span>
              )}
            </h3>
            {(() => {
              const currentExperience = berufserfahrung.find(e => e.id === selectedExperienceId);
              
              // Always show form - either with selected experience or empty form
              const formData = currentExperience || {
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
              
              return (
                <ExperienceForm
                  form={formData}
                  selectedPositions={formData.position || []}
                  onUpdateField={(field, value) => {
                    const experienceId = getOrCreateExperienceId();
                    if (!experienceId) return;
                    updateExperienceField(experienceId, field, value);
                  }}
                  onPositionsChange={(positions) => {
                    const experienceId = getOrCreateExperienceId();
                    if (!experienceId) return;
                    updateExperienceField(experienceId, 'position', positions);
                  }}
                  cvSuggestions={cvSuggestions}
                />
              );
            })()}
          </div>
        );
      case 'education':
        return (
          <div className="space-y-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Ausbildung {ausbildung.length > 0 && (
                <span className="ml-2 px-3 py-1.5 text-white text-sm font-bold rounded-full" style={{ backgroundColor: '#b5b7bb' }}>
                  {ausbildung.length}
                </span>
              )}
            </h3>
            {(() => {
              const currentEducation = ausbildung.find(e => e.id === selectedEducationId);
              
              // Always show form - either with selected education or empty form
              const formData = currentEducation || {
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
              
              return (
                <AusbildungForm
                  form={formData}
                  onUpdateField={(field, value) => {
                    const educationId = getOrCreateEducationId();
                    if (!educationId) return;
                    updateEducationField(educationId, field, value);
                  }}
                  cvSuggestions={cvSuggestions}
                />
              );
            })()}
          </div>
        );
      case 'skills':
        return <div className="p-4">Fachkompetenzen - Coming soon</div>;
      case 'softskills':
        return <div className="p-4">Softskills - Coming soon</div>;
      default:
        return <PersonalDataForm data={personalData || {}} onChange={updatePersonalData} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative p-6">
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <User className="h-6 w-6 mr-2" style={{ color: '#F29400' }} stroke="#F29400" fill="none" />
        <h2 className="text-lg font-semibold text-gray-900">Lebenslauf</h2>
      </div>

      <div className="border-b border-gray-200">
        <nav className="flex space-x-8 px-4">
          <button
            onClick={() => handleTabChange('personal')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'personal'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 1H5C3.89 1 3 1.89 3 3V21C3 22.11 3.89 23 5 23H19C20.11 23 21 22.11 21 21V9M19 9H14V4H5V21H19V9Z"/>
                </svg>
              </div>
              Persönliche Daten
            </div>
          </button>

          <button
            onClick={() => handleTabChange('experience')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'experience'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M10,2H14A2,2 0 0,1 16,4V6H20A2,2 0 0,1 22,8V19A2,2 0 0,1 20,21H4A2,2 0 0,1 2,19V8A2,2 0 0,1 4,6H8V4A2,2 0 0,1 10,2M14,6V4H10V6H14Z"/>
                </svg>
              </div>
              Berufserfahrung
            </div>
          </button>

          <button
            onClick={() => handleTabChange('education')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'education'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12,3L1,9L12,15L21,10.09V17H23V9M5,13.18V17.18L12,21L19,17.18V13.18L12,17L5,13.18Z"/>
                </svg>
              </div>
              Ausbildung
            </div>
          </button>

          <button
            onClick={() => handleTabChange('skills')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'skills'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9,5V9H21V5M9,19H21V15H9M9,14H21V10H9M4,9H8L6,7M4,19H8L6,17M4,14H8L6,12"/>
                </svg>
              </div>
              Fachkompetenzen
            </div>
          </button>

          <button
            onClick={() => handleTabChange('softskills')}
            className={`py-3 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'softskills'
                ? 'border-orange-500 text-orange-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <div className="w-4 h-4">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16,4C18.2,4 20,5.8 20,8C20,10.2 18.2,12 16,12C13.8,12 12,10.2 12,8C12,5.8 13.8,4 16,4M16,6A2,2 0 0,0 14,8A2,2 0 0,0 16,10A2,2 0 0,0 18,8A2,2 0 0,0 16,6M8,4C10.2,4 12,5.8 12,8C12,10.2 10.2,12 8,12C5.8,12 4,10.2 4,8C4,5.8 5.8,4 8,4M8,6A2,2 0 0,0 6,8A2,2 0 0,0 8,10A2,2 0 0,0 10,8A2,2 0 0,0 8,6M16,13C18.67,13 24,14.33 24,17V20H8V17C8,14.33 13.33,13 16,13M8,13C10.67,13 16,14.33 16,17V20H0V17C0,14.33 5.33,13 8,13Z"/>
                </svg>
              </div>
              Softskills
            </div>
          </button>
        </nav>
      </div>

      <div className="p-4">
        {renderTabContent()}
      </div>

      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            if (isAddingEntry || isCreatingFromInput) return; // Prevent multiple clicks
            
            // Zuerst prüfen, ob der aktuell ausgewählte Eintrag leer ist, und ihn löschen.
            // Dies verhindert die Anhäufung leerer Einträge, wenn der Benutzer wiederholt auf "Hinzufügen" klickt.
            const currentSelectedExp = berufserfahrung.find(exp => exp.id === selectedExperienceId);
            const currentSelectedEdu = ausbildung.find(edu => edu.id === selectedEducationId);

            if (currentSelectedExp && isEmptyExperience(currentSelectedExp)) {
              deleteExperience(selectedExperienceId);
            }
            if (currentSelectedEdu && isEmptyEducation(currentSelectedEdu)) {
              deleteEducation(selectedEducationId);
            }

            // Dann immer einen neuen leeren Eintrag basierend auf dem aktiven Tab erstellen
            if (activeTab === 'experience') {
              createEmptyExperience();
            } else if (activeTab === 'education') {
              createEmptyEducation();
            }
          }}
          disabled={isAddingEntry || isCreatingFromInput}
          className={`flex items-center justify-center w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
            (isAddingEntry || isCreatingFromInput) ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          style={{ backgroundColor: '#F29400' }}
          title="Neuen Eintrag hinzufügen"
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default LebenslaufInput;