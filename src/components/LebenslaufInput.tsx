import React, { useState, useEffect } from 'react';
import { useLebenslauf } from './LebenslaufContext';
import PersonalDataForm from './PersonalDataForm';
import ExperienceForm from './ExperienceForm';
import AusbildungForm from './AusbildungForm';
import { Plus, Calendar, Building, Briefcase, ChevronRight, User, CircleOff } from 'lucide-react';

type TabType = 'personal' | 'experience' | 'education' | 'skills' | 'softskills';

const LebenslaufInput: React.FC = () => {
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
    setActiveTab,
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
    // Prüfen, ob bereits eine leere Berufserfahrung existiert
    const hasEmptyExperience = berufserfahrung.some(exp => 
      (!exp.companies || exp.companies.length === 0) && 
      exp.position.length === 0 && 
      exp.aufgabenbereiche.length === 0 &&
      !exp.startYear
    );
    
    // Wenn bereits eine leere Berufserfahrung existiert, diese auswählen statt eine neue zu erstellen
    if (hasEmptyExperience) {
      const emptyExp = berufserfahrung.find(exp => 
        (!exp.companies || exp.companies.length === 0) && 
        exp.position.length === 0 && 
        exp.aufgabenbereiche.length === 0 &&
        !exp.startYear
      );
      if (emptyExp) {
        selectExperience(emptyExp.id);
        return;
      }
    }
    
    // Immer eine neue Berufserfahrung erstellen, wenn der Button geklickt wird
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
    
    addExperience(newExp);
  };

  // Funktion zum Deselektieren aller Einträge (für Floating Button)
  const deselectAllEntries = () => {
    selectExperience('');
    selectEducation('');
  };

  // Hilfsfunktion zum Erstellen einer neuen Ausbildung
  const createEmptyEducation = () => {
    // Immer eine neue Ausbildung erstellen, wenn der Button geklickt wird
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
    
    addEducation(newEdu);
  };

  useEffect(() => {
    if (activeTab === 'experience') {
      // Wenn keine Berufserfahrung ausgewählt ist und keine vorhanden sind, eine erstellen
      if (!selectedExperienceId && berufserfahrung.length === 0) {
        createEmptyExperience();
      } else if (!selectedExperienceId && berufserfahrung.length > 0) {
        // Wenn keine ausgewählt ist, aber welche vorhanden sind, die erste auswählen
        selectExperience(berufserfahrung[0].id);
      }
    } else if (activeTab === 'education') {
      // Wenn keine Ausbildung ausgewählt ist und keine vorhanden sind, eine erstellen
      if (!selectedEducationId && ausbildung.length === 0) {
        createEmptyEducation();
      } else if (!selectedEducationId && ausbildung.length > 0) {
        // Wenn keine ausgewählt ist, aber welche vorhanden sind, die erste auswählen
        selectEducation(ausbildung[0].id);
      }
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
    if (activeTab === 'experience' && berufserfahrung.length === 0) {
      addExperience({
        companies: [],
        position: [],
        startMonth: null,
        startYear: "",
        endMonth: null,
        aufgabenbereiche: []
      });
    } else if (activeTab === 'education' && ausbildung.length === 0) {
      addEducation({
        institution: [],
        ausbildungsart: [],
        abschluss: [],
        startMonth: null, 
        startYear: "", 
        endMonth: null, 
        endYear: null, 
        isCurrent: false, 
        zusatzangaben: ""
      });
    }
  }, []);

  // Auto-switch to experience tab when an experience is selected
  useEffect(() => {
    if (selectedExperienceId) {
      setActiveTab('experience');
    }
  }, [selectedExperienceId, setActiveTab]);

  // Auto-switch to education tab when an education is selected
  useEffect(() => {
    if (selectedEducationId) {
      setActiveTab('education');
    }
  }, [selectedEducationId, setActiveTab]);

  // Function to handle tab changes
  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
  };

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
            {/* Immer das Formular anzeigen, unabhängig davon, ob ein Eintrag ausgewählt ist */}
            {(selectedExperienceId || berufserfahrung.length > 0) && (
              <ExperienceForm
                form={(() => {
                  const experience = berufserfahrung.find(e => e.id === selectedExperienceId);
                  return {
                    companies: Array.isArray(experience?.companies) ? experience.companies : [],
                    position: Array.isArray(experience?.position) ? experience.position : [],
                    startMonth: experience?.startMonth || null,
                    startYear: experience?.startYear || "",
                    endMonth: experience?.endMonth || null,
                    endYear: experience?.endYear || null,
                    isCurrent: experience?.isCurrent || false,
                    aufgabenbereiche: Array.isArray(experience?.aufgabenbereiche) ? experience.aufgabenbereiche : [],
                    zusatzangaben: experience?.zusatzangaben || "",
                    leasingCompaniesList: Array.isArray(experience?.leasingCompaniesList) ? experience.leasingCompaniesList : []
                  };
                })()}
                selectedPositions={berufserfahrung.find(e => e.id === selectedExperienceId)?.position || []}
                onUpdateField={(field, value) => {
                  if (selectedExperienceId) {
                    updateExperienceField(selectedExperienceId, field, value);
                  }
                }}
                onPositionsChange={(positions) => {
                  if (selectedExperienceId) {
                    updateExperienceField(selectedExperienceId, 'position', positions);
                  }
                }}
                cvSuggestions={cvSuggestions}
              />
            )}
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
            {/* Immer das Formular anzeigen, unabhängig davon, ob ein Eintrag ausgewählt ist */}
            {(selectedEducationId || ausbildung.length > 0) && (
              <AusbildungForm
                form={(() => {
                  const education = ausbildung.find(e => e.id === selectedEducationId);
                  return {
                    institution: education?.institution || [],
                    ausbildungsart: education?.ausbildungsart || [],
                    abschluss: education?.abschluss || [],
                    startMonth: education?.startMonth || null,
                    startYear: education?.startYear || "",
                    endMonth: education?.endMonth || null,
                    endYear: education?.endYear || null,
                    isCurrent: education?.isCurrent || false,
                    zusatzangaben: education?.zusatzangaben || ""
                  };
                })()}
                onUpdateField={(field, value) => {
                  if (selectedEducationId) {
                    updateEducationField(selectedEducationId, field, value);
                  }
                }}
                cvSuggestions={cvSuggestions}
              />
            )}
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
        {(() => {
          // Prüfe ob eine leere Card im Bearbeitungsmodus ist
          const hasEmptyExperience = selectedExperienceId && 
            berufserfahrung.find(exp => exp.id === selectedExperienceId && isEmptyExperience(exp));
          const hasEmptyEducation = selectedEducationId && 
            ausbildung.find(edu => edu.id === selectedEducationId && isEmptyEducation(edu));
          const hasEmptyEntry = hasEmptyExperience || hasEmptyEducation;
          
          return (
            <button
              onClick={() => {
                if (hasEmptyEntry) {
                  // Abbrechen: Leere Einträge löschen
                  if (hasEmptyExperience) {
                    deleteExperience(selectedExperienceId!);
                  }
                  if (hasEmptyEducation) {
                    deleteEducation(selectedEducationId!);
                  }
                } else if (selectedExperienceId || selectedEducationId) {
                  // Aktualisieren: Bearbeitung beenden
                  deselectAllEntries();
                } else {
                  // Neue Berufserfahrung hinzufügen
                  createEmptyExperience();
                }
              }}
              className="flex items-center justify-center w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
              style={{ 
                backgroundColor: hasEmptyEntry ? '#ef4444' : 
                                (selectedExperienceId || selectedEducationId) ? '#569f1e' : '#F29400' 
              }}
              title={
                hasEmptyEntry ? "Leeren Eintrag abbrechen" :
                (selectedExperienceId || selectedEducationId) ? "Bearbeitung beenden" : 
                "Neue Berufserfahrung hinzufügen"
              }
            >
              {hasEmptyEntry ? (
                <CircleOff className="h-5 w-5" />
              ) : (selectedExperienceId || selectedEducationId) ? (
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Plus className="h-5 w-5" />
              )}
            </button>
          );
        })()}
      </div>
    </div>
  );
};

export default LebenslaufInput;