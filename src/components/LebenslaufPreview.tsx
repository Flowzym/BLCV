import React, { useMemo, useState } from 'react';
import { Trash2, Plus, FileText, Star, X, ToggleLeft, ToggleRight, Edit, Check, CircleOff } from 'lucide-react';
import { ReactSortable } from 'react-sortablejs';
import { useLebenslauf } from './LebenslaufContext';
import EditablePreviewText from './EditablePreviewText';
import TabNavigation from './layout/TabNavigation';

type PreviewTab = 'gesamt' | 'berufserfahrung' | 'ausbildung' | 'fachkompetenzen' | 'softskills';

export default function LebenslaufPreview() {
  const containerStyle = {
    backgroundColor: 'white',
    padding: '1.5rem',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    border: '1px solid #e5e7eb'
  };

  const { 
    personalData,
    berufserfahrung, 
    ausbildung,
    selectExperience, 
    selectedExperienceId,
    multiSelectedExperienceIds,
    toggleMultiExperienceSelection,
    deleteExperience,
    selectEducation,
    selectedEducationId,
    deleteEducation,
    updateEducationField,
    updateExperienceTask,
    updateExperienceTasksOrder,
    addExperienceTask,
    updateExperienceField,
    favoriteTasks,
    toggleFavoriteTask,
    isBisTranslatorActive,
    setIsBisTranslatorActive,
    selectedBisTasks,
    toggleBisTaskSelection,
    bisTranslatorResults
  } = useLebenslauf();

  // Verwende den synchronisierten Preview-Tab aus dem Context
  const { previewTab, setPreviewTabWithSync } = useLebenslauf();

  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>({});
  const [showAllExpanded, setShowAllExpanded] = useState(false);

  const previewTabs = [
    { id: 'gesamt', label: 'Gesamt' },
    { id: 'berufserfahrung', label: 'Berufserfahrung' },
    { id: 'ausbildung', label: 'Ausbildung' },
    { id: 'fachkompetenzen', label: 'Fachkompetenzen' },
    { id: 'softskills', label: 'Soft Skills' }
  ];

  const sortedErfahrungen = useMemo(() => {
    console.log('Berufserfahrungen für Vorschau:', berufserfahrung);
    return [...berufserfahrung].sort((a, b) => {
      // Neue Einträge ohne Zeitraum kommen immer nach oben
      const aHasTime = a.startYear && a.startYear.trim();
      const bHasTime = b.startYear && b.startYear.trim();
      
      if (!aHasTime && !bHasTime) return 0;
      if (!aHasTime) return -1;
      if (!bHasTime) return 1;
      
      const yearA = parseInt(a.startYear || '0', 10);
      const yearB = parseInt(b.startYear || '0', 10);
      const monthA = parseInt(a.startMonth || '0', 10);
      const monthB = parseInt(b.startMonth || '0', 10);

      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
  }, [berufserfahrung]);

  const sortedAusbildungen = useMemo(() => {
    console.log('Ausbildungen für Vorschau:', ausbildung);
    return [...ausbildung].sort((a, b) => {
      // Neue Einträge ohne Zeitraum kommen immer nach oben (neueste zuerst)
      const aHasTime = a.startYear && a.startYear.trim();
      const bHasTime = b.startYear && b.startYear.trim();
      
      if (!aHasTime && !bHasTime) {
        // Beide ohne Zeit: neueste zuerst (nach ID sortieren)
        return b.id.localeCompare(a.id);
      }
      if (!aHasTime) return -1;
      if (!bHasTime) return 1;
      
      const yearA = parseInt(a.startYear || '0', 10);
      const yearB = parseInt(b.startYear || '0', 10);
      const monthA = parseInt(a.startMonth || '0', 10);
      const monthB = parseInt(b.startMonth || '0', 10);

      if (yearA !== yearB) return yearB - yearA;
      return monthB - monthA;
    });
  }, [ausbildung]);

  // Hilfsfunktion zum Formatieren einer Liste mit korrekter Interpunktion
  const formatListWithConjunction = (items: string[]): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return `"${items[0]}"`;
    if (items.length === 2) return `"${items[0]}" & "${items[1]}"`;
    
    // Für 3 oder mehr Elemente: "A", "B", "C" & "D"
    const allButLast = items.slice(0, -1).map(item => `"${item}"`).join(', ');
    const last = `"${items[items.length - 1]}"`;
    return `${allButLast} & ${last}`;
  };

  const formatZeitraum = (
    startMonth: string | null,
    startYear: string | null,
    endMonth: string | null,
    endYear: string | null,
    isCurrent: boolean,
  ) => {
    const format = (m: string | null | undefined, y: string | null | undefined) => {
      if (!y) return '';
      return m ? `${m}.${y}` : y;
    };

    const start = format(startMonth ?? undefined, startYear ?? undefined);
    const end = isCurrent ? 'heute' : format(endMonth ?? undefined, endYear ?? undefined);

    if (!start && !end) return '';
    if (start && end) return `${start} – ${end}`;
    return start || end;
  };

  const handleAddTask = (expId: string) => {
    const newTask = newTaskInputs[expId]?.trim();
    if (newTask) {
      addExperienceTask(expId, newTask);
      setNewTaskInputs(prev => ({ ...prev, [expId]: '' }));
    }
  };

  const handleExperienceFieldUpdate = (expId: string, field: string, value: string) => {
    if (field === 'companies') {
      // Parse the combined company info string
      const companies = value.split('//').map(part => part.trim()).filter(Boolean);
      updateExperienceField(expId, 'companies', companies);
    } else if (field === 'position') {
      updateExperienceField(expId, 'position', value.split(' / '));
    } else if (field === 'zeitraum') {
      // Zeitraum-Bearbeitung ist komplexer und würde eine spezielle Komponente erfordern
      // Für diesen Prototyp belassen wir es bei der einfachen Textbearbeitung
      console.log('Zeitraum bearbeiten:', value);
    }
  };

  const handleEducationFieldUpdate = (eduId: string, field: string, value: string) => {
    if (field === 'institution') {
      updateEducationField(eduId, 'institution', value.split(', '));
    } else if (field === 'ausbildungsart') {
      const parts = value.split(' - ');
      updateEducationField(eduId, 'ausbildungsart', parts.split(' / '));
      if (parts.length > 1) {
        updateEducationField(eduId, 'abschluss', parts.split(' / '));
      }
    } else if (field === 'zeitraum') {
      // Zeitraum-Bearbeitung ist komplexer und würde eine spezielle Komponente erfordern
      // Für diesen Prototyp belassen wir es bei der einfachen Textbearbeitung
      console.log('Zeitraum bearbeiten:', value);
    }
  };

  const removeTask = (expId: string, taskIndex: number) => {
    const experience = berufserfahrung.find(exp => exp.id === expId);
    if (experience && experience.aufgabenbereiche) {
      const newTasks = experience.aufgabenbereiche.filter((_, index) => index !== taskIndex);
      updateExperienceField(expId, 'aufgabenbereiche', newTasks);
    }
  };

  const toggleTaskFavorite = (task: string) => {
    toggleFavoriteTask(task);
  };

  const isExpanded = (id: string, type: 'experience' | 'education') => {
    if (showAllExpanded) return true;
    return type === 'experience' ? selectedExperienceId === id : selectedEducationId === id;
  };

  // Hilfsfunktion um zu prüfen ob ein Eintrag leer ist
  const isEmptyExperience = (exp: any) => {
    return (!exp.companies || exp.companies.length === 0) && 
           (!exp.position || exp.position.length === 0) && 
           (!exp.aufgabenbereiche || exp.aufgabenbereiche.length === 0) &&
           (!exp.startYear || exp.startYear.trim() === '') &&
           (!exp.zusatzangaben || exp.zusatzangaben.trim() === '');
  };

  const isEmptyEducation = (edu: any) => {
    return (!edu.institution || edu.institution.length === 0) && 
           (!edu.ausbildungsart || edu.ausbildungsart.length === 0) && 
           (!edu.abschluss || edu.abschluss.length === 0) &&
           (!edu.startYear || edu.startYear.trim() === '') &&
           (!edu.zusatzangaben || edu.zusatzangaben.trim() === '');
  };

  // Helper function to check if personal data has content
  const hasPersonalDataContent = () => {
    return personalData && (
      personalData.vorname || 
      personalData.nachname || 
      personalData.email || 
      personalData.telefon || 
      personalData.adresse || 
      personalData.plz || 
      personalData.ort
    );
  };

  return (
    <div className="h-full flex flex-col" style={containerStyle}>
      {/* Header mit Toggle-Button */}
      <div className="flex items-center justify-between mb-4 flex-shrink-0">
        <h2 className="text-lg font-semibold text-gray-900 flex items-center">📄 <span className="ml-2">Vorschau</span></h2>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-600">
            {showAllExpanded ? 'Alle ausgeklappt' : 'Nur aktive ausgeklappt'}
          </span>
          <button
            onClick={() => setShowAllExpanded(!showAllExpanded)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
            title={showAllExpanded ? 'Nur aktive Einträge ausklappen' : 'Alle Einträge ausklappen'}
          >
            {showAllExpanded ? (
              <ToggleRight className="h-6 w-6" style={{ color: '#F29400' }} />
            ) : (
              <ToggleLeft className="h-6 w-6" />
            )}
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 mb-4">
        <TabNavigation 
          tabs={previewTabs} 
          active={previewTab} 
          onChange={(tabId) => setPreviewTabWithSync(tabId as PreviewTab)} 
        />
      </div>

      {/* Scrollbarer Inhalt */}
      <div className="flex-1 overflow-y-auto space-y-0">
        {/* Persönliche Daten - nur im Gesamt-Tab anzeigen */}
        {previewTab === 'gesamt' && hasPersonalDataContent() && (
          <div className="mb-6">
            <h3 className="font-bold text-xl mb-1">Persönliche Daten</h3>
            <div className="space-y-1 text-sm">
              {personalData?.vorname && personalData?.nachname && (
                <div>
                  <span className="font-medium">Name:</span> {personalData.titel ? `${personalData.titel} ` : ''}{personalData.vorname} {personalData.nachname}
                </div>
              )}
              {personalData?.email && (
                <div>
                  <span className="font-medium">E-Mail:</span> {personalData.email}
                </div>
              )}
              {personalData?.telefon && (
                <div>
                  <span className="font-medium">Telefon:</span> {personalData.telefonVorwahl || ''} {personalData.telefon}
                </div>
              )}
              {(personalData?.adresse || personalData?.plz || personalData?.ort) && (
                <div>
                  <span className="font-medium">Adresse:</span> {[personalData?.adresse, personalData?.plz, personalData?.ort].filter(Boolean).join(', ')}
                </div>
              )}
              {personalData?.geburtsdatum && (
                <div>
                  <span className="font-medium">Geburtsdatum:</span> {personalData.geburtsdatum}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Berufserfahrung - nur anzeigen wenn entsprechender Tab aktiv */}
        {(previewTab === 'gesamt' || previewTab === 'berufserfahrung') && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-bold text-xl">Berufserfahrung</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {isBisTranslatorActive ? 'BIS-Modus aktiv' : 'BIS-Modus inaktiv'}
              </span>
              <button
                onClick={() => setIsBisTranslatorActive(!isBisTranslatorActive)}
                className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
                title={isBisTranslatorActive ? 'BIS-Modus deaktivieren' : 'BIS-Modus aktivieren'}
              >
                {isBisTranslatorActive ? (
                  <ToggleRight className="h-6 w-6" style={{ color: '#F29400' }} />
                ) : (
                  <ToggleLeft className="h-6 w-6" />
                )}
              </button>
            </div>
          </div>
          <div className="space-y-0">
            {sortedErfahrungen.map((exp, index) => {
              const isSelected = selectedExperienceId === exp.id;
              const isCardExpanded = isExpanded(exp.id, 'experience');
              const isBisSelected = isBisTranslatorActive && multiSelectedExperienceIds.includes(exp.id);
              
              return (
                <div key={exp.id} className="relative">
                  {/* Horizontale Trennlinie zwischen Karten */}
                  {index > 0 && (
                    <div className="w-full h-px bg-gray-200"></div>
                  )}
                  
                  <div
                    onClick={() => selectExperience(exp.id)}
                    className={`p-2 cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                      isSelected ? 'border border-[#F29400] rounded-md bg-gray-50' : 
                      multiSelectedExperienceIds.includes(exp.id) ? 'border border-blue-300 rounded-md bg-blue-50' : 'bg-white'
                    }`}
                  >
                    {/* Löschen-Button - nur anzeigen wenn nicht im BIS-Modus und nicht ausgewählt */}
                    {!isBisTranslatorActive && !isSelected && (
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteExperience(exp.id);
                          }}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors duration-200"
                          title="Berufserfahrung löschen"
                          aria-label="Berufserfahrung löschen"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}

                    <div className="flex justify-between items-start mb-0.5">
                      {/* Zeitraum */}
                      <EditablePreviewText
                        value={formatZeitraum(
                          exp.startMonth,
                          exp.startYear,
                          exp.endMonth,
                          exp.endYear,
                          exp.isCurrent,
                        )}
                        onSave={(newValue) => handleExperienceFieldUpdate(exp.id, 'zeitraum', newValue)}
                        className="text-sm text-gray-700"
                        placeholder="Zeitraum eingeben..."
                      />
                    </div>

                    {/* Position */}
                    <div className="mb-0.5">
                      <EditablePreviewText
                        value={Array.isArray(exp.position) ? exp.position.join(' / ') : (exp.position || "")}
                        onSave={(newValue) => handleExperienceFieldUpdate(exp.id, 'position', newValue)}
                        className="font-bold text-lg text-gray-900"
                        placeholder="Position eingeben..."
                      />
                    </div>

                    {/* Unternehmen/Ort */}
                    <div className="mb-0.5">
                      <EditablePreviewText
                        value={(() => {
                          const companiesText = Array.isArray(exp.companies) ? exp.companies.join(' // ') : (exp.companies || "");
                          const leasingText = exp.leasingCompaniesList && exp.leasingCompaniesList.length > 0 
                            ? ` (über ${exp.leasingCompaniesList.join(', ')})`
                            : '';
                          return companiesText + leasingText;
                        })()}
                        onSave={(newValue) => handleExperienceFieldUpdate(exp.id, 'companies', newValue)}
                        className="text-gray-700"
                        placeholder="Unternehmen eingeben..."
                      />
                    </div>

                    {/* Erweiterte Inhalte nur bei ausgeklapptem Zustand */}
                    {isCardExpanded && (
                      <>
                        {/* Weitere Angaben */}
                        {exp.zusatzangaben && (
                          <div className="mb-1 border-t pt-0.5 border-gray-100">
                            <div className="flex items-start space-x-2">
                              <FileText className="h-4 w-4 mt-1 text-gray-400 flex-shrink-0" />
                              <EditablePreviewText
                                value={exp.zusatzangaben}
                                onSave={(newValue) => updateExperienceField(exp.id, 'zusatzangaben', newValue)}
                                isTextArea={true}
                                placeholder="Weitere Angaben eingeben..."
                              />
                            </div>
                          </div>
                        )}

                        {/* Auflistung Tätigkeiten */}
                        {Array.isArray(exp.aufgabenbereiche) && exp.aufgabenbereiche.length > 0 && (
                          <div className="mt-1">
                            <ReactSortable
                              list={exp.aufgabenbereiche.map((task, index) => ({ id: `${exp.id}-${index}`, content: task || '' }))}
                              setList={(newList) => {
                                const newTasks = newList.map(item => item.content || '');
                                updateExperienceTasksOrder(exp.id, newTasks);
                              }}
                              tag="div"
                              className="space-y-0 text-black ml-6"
                            >
                              {exp.aufgabenbereiche.map((aufgabe, i) => (
                                <div 
                                  key={`${exp.id}-${i}`}
                                  data-id={`${exp.id}-${i}`}
                                  className={`grid gap-x-2 items-start group cursor-move py-0.5 ${
                                    isBisTranslatorActive
                                      ? 'grid-cols-[auto_1fr_200px_auto]' // BIS-Modus aktiv: Checkbox/Punkt, Text, BIS-Vorschlag, Buttons
                                      : 'grid-cols-[auto_1fr_auto]'       // BIS-Modus inaktiv: Checkbox/Punkt, Text, Buttons
                                  }`}
                                >
                                  {/* Aufzählungspunkt oder Checkbox je nach BIS-Modus */}
                                  {isBisTranslatorActive ? (
                                    <input
                                      type="checkbox"
                                      checked={selectedBisTasks.includes(aufgabe)}
                                      onChange={(e) => {
                                        e.stopPropagation();
                                        toggleBisTaskSelection(aufgabe);
                                      }}
                                      className="w-4 h-4 flex-shrink-0 mt-0.5 rounded border-gray-300 focus:outline-none"
                                      style={{ accentColor: '#3B82F6' }}
                                      onClick={(e) => e.stopPropagation()}
                                    />
                                  ) : (
                                    <span className="text-black flex-shrink-0 leading-none">•</span>
                                  )}
                                  
                                  {/* Aufgabentext */}
                                  <div className="leading-none">
                                    <EditablePreviewText
                                      value={aufgabe}
                                      onSave={(newValue) => updateExperienceTask(exp.id, i, newValue)}
                                      placeholder="Aufgabe eingeben..."
                                      className="leading-none"
                                    />
                                  </div>
                                  
                                  {/* BIS-Übersetzung direkt neben der Tätigkeit - nur wenn BIS-Modus aktiv und Erfahrung ausgewählt */}
                                  {isBisTranslatorActive && bisTranslatorResults[aufgabe] && bisTranslatorResults[aufgabe].length > 0 ? (
                                    <div className="flex items-start space-x-1 group/bis">
                                      <span className="text-green-500 text-sm">→</span>
                                      <span className="text-sm text-green-700 leading-none">
                                        {bisTranslatorResults[aufgabe][0]}
                                      </span>
                                      
                                      {/* BIS Action Buttons */}
                                      <div className="opacity-0 group-hover/bis:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateExperienceTask(exp.id, i, bisTranslatorResults[aufgabe][0]);
                                          }}
                                          className="p-0.5 hover:bg-green-100 rounded transition-colors duration-200"
                                          title="Tätigkeit durch BIS-Kompetenz ersetzen"
                                        >
                                          <Edit className="h-3 w-3 text-green-600" />
                                        </button>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            addExperienceTask(exp.id, bisTranslatorResults[aufgabe][0]);
                                          }}
                                          className="p-0.5 hover:bg-green-100 rounded transition-colors duration-200"
                                          title="BIS-Kompetenz als neue Tätigkeit hinzufügen"
                                        >
                                          <Plus className="h-3 w-3 text-green-600" />
                                        </button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div></div>
                                  )}
                                  
                                  {/* Hover-Buttons für Tätigkeiten */}
                                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center space-x-1">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleTaskFavorite(aufgabe);
                                      }}
                                      className="p-0.5 hover:bg-gray-200 rounded transition-colors duration-200"
                                      title={favoriteTasks.includes(aufgabe) ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
                                    >
                                      <Star 
                                        className={`h-5 w-5 ${favoriteTasks.includes(aufgabe) ? 'fill-current text-yellow-500' : 'text-gray-400'}`} 
                                      />
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeTask(exp.id, i);
                                      }}
                                      className="p-0.5 hover:bg-gray-200 rounded transition-colors duration-200"
                                      title="Aufgabe löschen"
                                    >
                                      <X className="h-5 w-5 text-gray-400 hover:text-red-500" />
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </ReactSortable>
                          </div>
                        )}
                        
                        {/* Neue Aufgabe hinzufügen */}
                        {selectedExperienceId === exp.id && (
                          <div className="mt-1 flex items-center space-x-2 ml-6">
                            <input
                              type="text"
                              value={newTaskInputs[exp.id] || ''}
                              onChange={(e) => setNewTaskInputs(prev => ({ ...prev, [exp.id]: e.target.value }))}
                              onKeyPress={(e) => e.key === 'Enter' && handleAddTask(exp.id)}
                              placeholder="Neue Aufgabe hinzufügen..."
                              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                            <button
                              onClick={() => handleAddTask(exp.id)}
                              disabled={!newTaskInputs[exp.id]?.trim()}
                              className="p-1 text-white rounded hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                              style={{ backgroundColor: '#F29400' }}
                              title="Aufgabe hinzufügen"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {berufserfahrung.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-500">
                <p className="italic">
                  Hier erscheint die Vorschau deines Lebenslaufs …
                </p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Ausbildung - nur anzeigen wenn entsprechender Tab aktiv */}
        {(previewTab === 'gesamt' || previewTab === 'ausbildung') && (
        <div className="mb-6">
          <h3 className="font-bold text-xl mb-1">Ausbildung</h3>
          <div className="space-y-0">
            {sortedAusbildungen.map((edu, index) => {
              const isSelected = selectedEducationId === edu.id;
              const isCardExpanded = isExpanded(edu.id, 'education');
              
              return (
                <div key={edu.id} className="relative">
                  {/* Horizontale Trennlinie zwischen Karten */}
                  {index > 0 && (
                    <div className="w-full h-px bg-gray-200"></div>
                  )}
                  
                  <div
                    onClick={() => selectEducation(edu.id)}
                    className={`p-2 cursor-pointer transition-all duration-200 hover:bg-gray-100 ${
                      selectedEducationId === edu.id ? 'border border-[#F29400] rounded-md bg-gray-50' : 'bg-white'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-0.5">
                      {/* Zeitraum */}
                      <EditablePreviewText
                        value={formatZeitraum(
                          edu.startMonth,
                          edu.startYear,
                          edu.endMonth,
                          edu.endYear,
                          edu.isCurrent,
                        )}
                        onSave={(newValue) => handleEducationFieldUpdate(edu.id, 'zeitraum', newValue)}
                        className="text-sm text-gray-700"
                        placeholder="Zeitraum eingeben..."
                      />
                      <div className="flex items-center space-x-1">
                        {selectedEducationId !== edu.id && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteEducation(edu.id);
                            }}
                            className="text-gray-500 hover:text-gray-700 p-1 rounded transition-colors duration-200"
                            title="Ausbildung löschen"
                            aria-label="Ausbildung löschen"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Ausbildungsart */}
                    <div className="mb-0.5">
                      <EditablePreviewText
                        value={`${Array.isArray(edu.ausbildungsart) ? edu.ausbildungsart.join(" / ") : (edu.ausbildungsart || "")} - ${Array.isArray(edu.abschluss) ? edu.abschluss.join(" / ") : (edu.abschluss || "")}`}
                        onSave={(newValue) => handleEducationFieldUpdate(edu.id, 'ausbildungsart', newValue)}
                        className="font-bold text-lg text-gray-900"
                        placeholder="Ausbildungsart und Abschluss eingeben..."
                      />
                    </div>

                    {/* Erweiterte Inhalte nur bei ausgeklapptem Zustand */}
                    {isCardExpanded && (
                      <>
                        {/* Institution */}
                        <div className="mb-0.5">
                          <EditablePreviewText
                            value={Array.isArray(edu.institution) ? edu.institution.join(', ') : (edu.institution || "")}
                            onSave={(newValue) => handleEducationFieldUpdate(edu.id, 'institution', newValue)}
                            className="italic text-gray-500"
                            placeholder="Institution eingeben..."
                          />
                        </div>
                        
                        {/* Bearbeitbare Zusatzangaben */}
                        {edu.zusatzangaben && (
                          <div className="text-black mt-0.5">
                            <EditablePreviewText
                              value={edu.zusatzangaben}
                              onSave={(newValue) => updateEducationField(edu.id, 'zusatzangaben', newValue)}
                              isTextArea={true}
                              placeholder="Zusatzangaben eingeben..."
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            {sortedAusbildungen.length === 0 && (
              <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-500">
                <p className="italic">
                  Hier erscheint die Vorschau deiner Ausbildung …
                </p>
              </div>
            )}
          </div>
        </div>
        )}

        {/* Fachkompetenzen - Platzhalter */}
        {(previewTab === 'gesamt' || previewTab === 'fachkompetenzen') && (
        <div className="mb-6">
          <h3 className="font-bold text-xl mb-1">Fachkompetenzen</h3>
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-500">
            <p className="italic">
              Fachkompetenzen werden hier angezeigt, sobald sie implementiert sind...
            </p>
          </div>
        </div>
        )}

        {/* Soft Skills - Platzhalter */}
        {(previewTab === 'gesamt' || previewTab === 'softskills') && (
        <div className="mb-6">
          <h3 className="font-bold text-xl mb-1">Soft Skills</h3>
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50 text-gray-500">
            <p className="italic">
              Soft Skills werden hier angezeigt, sobald sie implementiert sind...
            </p>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}