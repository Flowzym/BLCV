import React, { useState, useEffect } from 'react';
import { useCallback } from 'react';
import { useLebenslauf } from './LebenslaufContext';
import PersonalDataForm from './PersonalDataForm';
import ExperienceForm from './ExperienceForm';
import AusbildungForm from './AusbildungForm';
import { Plus } from 'lucide-react';

type TabType = 'personal' | 'experience' | 'education' | 'skills' | 'softskills';

const LebenslaufInput: React.FC = () => {
  // State to prevent multiple entries being created
  const [isAddingEntry, setIsAddingEntry] = useState(false);

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
    selectEducation,
    ensureSelectedExperienceExists,
    ensureSelectedEducationExists
  } = useLebenslauf();
  
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
      // Nur auswählen wenn Einträge vorhanden sind UND noch keiner ausgewählt ist
      if (berufserfahrung.length > 0 && (!selectedExperienceId || !berufserfahrung.some(exp => exp.id === selectedExperienceId))) {
        selectExperience(berufserfahrung[0].id);
      }
    } else if (activeTab === 'education') {
      // Nur auswählen wenn Einträge vorhanden sind UND noch keiner ausgewählt ist
      if (ausbildung.length > 0 && (!selectedEducationId || !ausbildung.some(edu => edu.id === selectedEducationId))) {
        selectEducation(ausbildung[0].id);
      }
    }
    
    // Cleanup: Auswahl aufheben wenn Eintrag nicht mehr existiert
    if (selectedExperienceId && !berufserfahrung.some(exp => exp.id === selectedExperienceId)) {
      selectExperience('');
    }
    if (selectedEducationId && !ausbildung.some(edu => edu.id === selectedEducationId)) {
      selectEducation('');
    }
  }, [activeTab]);

  // Function to handle tab changes
  const handleTabChange = (tabId: TabType) => {
    setActiveTabWithSync(tabId);
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
            {selectedExperienceId ? (
              <ExperienceForm
                experienceId={selectedExperienceId}
                cvSuggestions={cvSuggestions}
              />
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">Keine Berufserfahrung ausgewählt</p>
                <p className="text-sm text-gray-500">
                  Wählen Sie einen Eintrag aus der Vorschau aus oder erstellen Sie einen neuen mit dem ⊕ Button unten rechts.
                </p>
              </div>
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
            {selectedEducationId ? (
              <AusbildungForm
                educationId={selectedEducationId}
                cvSuggestions={cvSuggestions}
              />
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">Keine Ausbildung ausgewählt</p>
                <p className="text-sm text-gray-500">
                  Wählen Sie einen Eintrag aus der Vorschau aus oder erstellen Sie einen neuen mit dem ⊕ Button unten rechts.
                </p>
              </div>
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
      <div className="p-4">
        {renderTabContent()}
      </div>

      {/* Floating Button */}
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            if (isAddingEntry) return; // Verhindere Mehrfachklicks
            
            // Erstelle einen neuen Eintrag basierend auf dem aktiven Tab
            if (activeTab === 'experience') {
              createEmptyExperience();
            } else if (activeTab === 'education') {
              createEmptyEducation();
            } else {
              // Für andere Tabs (personal, skills, softskills) - erstelle Berufserfahrung als Standard
              setActiveTabWithSync('experience');
              setTimeout(() => createEmptyExperience(), 100);
            }
          }}
          disabled={isAddingEntry}
          className={`flex items-center justify-center w-14 h-14 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 ${
            isAddingEntry ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
          }`}
          style={{ backgroundColor: '#F29400' }}
          title={`Neuen ${activeTab === 'education' ? 'Ausbildungs' : 'Berufserfahrungs'}eintrag hinzufügen`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default LebenslaufInput;