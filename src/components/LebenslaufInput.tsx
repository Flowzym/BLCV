import React, { useState, useEffect } from 'react';
import { useLebenslauf } from '@/components/LebenslaufContext'; // ✅ Alias
import PersonalDataForm from './PersonalDataForm';
import ExperienceForm from './ExperienceForm';
import AusbildungForm from './AusbildungForm';
import { Plus } from 'lucide-react';

type TabType = 'personal' | 'experience' | 'education' | 'skills' | 'softskills';

const LebenslaufInput: React.FC = () => {
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
  } = useLebenslauf();

  const createEmptyExperience = () => {
    if (isAddingEntry) return;
    setIsAddingEntry(true);
    const newId = addExperience({
      companies: [],
      position: [],
      startMonth: null,
      startYear: "",
      endMonth: null,
      endYear: null,
      isCurrent: false,
      aufgabenbereiche: []
    });
    selectExperience(newId);
    setTimeout(() => setIsAddingEntry(false), 100);
  };

  const createEmptyEducation = () => {
    if (isAddingEntry) return;
    setIsAddingEntry(true);
    const newId = addEducation({
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
    selectEducation(newId);
    setTimeout(() => setIsAddingEntry(false), 100);
  };

  useEffect(() => {
    if (activeTab === 'experience') {
      if (berufserfahrung.length > 0 && (!selectedExperienceId || !berufserfahrung.some(exp => exp.id === selectedExperienceId))) {
        selectExperience(berufserfahrung[0].id);
      }
    } else if (activeTab === 'education') {
      if (ausbildung.length > 0 && (!selectedEducationId || !ausbildung.some(edu => edu.id === selectedEducationId))) {
        selectEducation(ausbildung[0].id);
      }
    }
    if (selectedExperienceId && !berufserfahrung.some(exp => exp.id === selectedExperienceId)) {
      selectExperience('');
    }
    if (selectedEducationId && !ausbildung.some(edu => edu.id === selectedEducationId)) {
      selectEducation('');
    }
  }, [activeTab]);

  const handleTabChange = (tabId: TabType) => {
    setActiveTabWithSync(tabId);
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
              <ExperienceForm experienceId={selectedExperienceId} cvSuggestions={cvSuggestions} />
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">Keine Berufserfahrung ausgewählt</p>
                <p className="text-sm text-gray-500">Wähle aus der Vorschau oder erstelle mit ⊕ unten rechts.</p>
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
              <AusbildungForm educationId={selectedEducationId} cvSuggestions={cvSuggestions} />
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <p className="text-gray-600 mb-4">Keine Ausbildung ausgewählt</p>
                <p className="text-sm text-gray-500">Wähle aus der Vorschau oder erstelle mit ⊕ unten rechts.</p>
              </div>
            )}
          </div>
        );
      case 'skills':
        return <div className="p-4">Fachkompetenzen – Coming soon</div>;
      case 'softskills':
        return <div className="p-4">Softskills – Coming soon</div>;
      default:
        return <PersonalDataForm data={personalData || {}} onChange={updatePersonalData} />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 relative">
      <div className="p-4">{renderTabContent()}</div>
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => {
            if (isAddingEntry) return;
            if (activeTab === 'experience') createEmptyExperience();
            else if (activeTab === 'education') createEmptyEducation();
            else { setActiveTabWithSync('experience'); setTimeout(() => createEmptyExperience(), 100); }
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
