import React, { useMemo, useState } from 'react';
import ZeitraumPicker from './ZeitraumPicker';
import TasksTagInput from './TasksTagInput';
import CountryDropdown from './CountryDropdown';
import { Eraser, Plus, Star, Lightbulb, X } from 'lucide-react';
import { ToggleLeft, ToggleRight } from 'lucide-react';
import AutocompleteInput from './AutocompleteInput';
import TagSelectorWithFavorites from './TagSelectorWithFavorites';
import CompanyTag from './CompanyTag';
import TagButtonFavorite from './ui/TagButtonFavorite';
import { Berufserfahrung, useLebenslauf } from './LebenslaufContext';
import { CVSuggestionConfig } from '../services/supabaseService';
import { getTasksForPositions } from '../constants/positionsToTasks';
import TextInput from './TextInput';
import ToggleSwitch from './ToggleSwitch';

interface ExperienceFormProps {
  ensureExperienceId: () => string;
  updateExperienceField: (id: string, field: string, value: any) => void;
  cvSuggestions: CVSuggestionConfig;
}

export default function ExperienceForm({
  ensureExperienceId,
  updateExperienceField,
  cvSuggestions,
}: ExperienceFormProps) {
  const { berufserfahrung, selectedExperienceId } = useLebenslauf();
  
  // Get current form data
  const form = berufserfahrung.find(exp => exp.id === selectedExperienceId) || {
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
  
  const selectedPositions = form.position || [];
  
  const { 
    favoriteTasks, 
    favoriteCities, 
    favoriteCompanies: favorites,
    favoriteLeasingCompanies,
    toggleFavoriteCompany,
    toggleFavoriteLeasingCompany,
    toggleFavoriteCity,
    favoritePositions, 
    toggleFavoritePosition 
  } = useLebenslauf();
  
  // Lokale Zustände für die Eingabefelder
  const [isCompanyInputFocused, setIsCompanyInputFocused] = useState(false);
  const [isCityInputFocused, setIsCityInputFocused] = useState(false);
  const [companyNameInput, setCompanyNameInput] = useState('');
  const [companyCityInput, setCompanyCityInput] = useState('');
  const [selectedCountryInput, setSelectedCountryInput] = useState('Österreich');
  const [showForeignCountry, setShowForeignCountry] = useState(false);
  const [showLeasing, setShowLeasing] = useState(false);
  const [leasingCompanyInput, setLeasingCompanyInput] = useState('');
  const [isPositionInputFocused, setIsPositionInputFocused] = useState(false);

  const hasZeitraumData =
    form.startMonth !== null ||
    (form.startYear && form.startYear.trim() !== '') ||
    form.endMonth !== null ||
    form.endYear !== null ||
    form.isCurrent === true;
  const hasCompanyData = form.companies && form.companies.length > 0;
  const hasPositionData = selectedPositions.length > 0;
  const hasTaskData = form.aufgabenbereiche.length > 0;
  const hasAdditionalInfo = form.zusatzangaben && form.zusatzangaben.trim().length > 0;
  const hasLeasingData = showLeasing && ((Array.isArray(form.leasingCompaniesList) && form.leasingCompaniesList.length > 0) || leasingCompanyInput.trim() !== '');

  // Leasing-Daten löschen wenn Toggle deaktiviert wird
  const handleLeasingToggle = (enabled: boolean) => {
    setShowLeasing(enabled);
    if (!enabled) {
      // Leasing-Daten löschen wenn deaktiviert
      const experienceId = ensureExperienceId();
      updateExperienceField(experienceId, 'leasingCompaniesList', []);
      setLeasingCompanyInput('');
    }
  };

  // Prüft, ob mindestens ein Eingabefeld gefüllt ist
  const hasInputData = companyNameInput.trim() !== '' || companyCityInput.trim() !== '' || (showLeasing && leasingCompanyInput.trim() !== '');
  
  // Funktion zum Hinzufügen eines neuen Unternehmenseintrags
  const addCompanyEntry = () => {
    if (!hasInputData) return;
    
    let newEntry = '';

    // Format: "Unternehmen, Ort (Land)" oder Variationen
    if (companyNameInput.trim() && companyCityInput.trim()) {
      if (showForeignCountry && selectedCountryInput && selectedCountryInput !== 'Österreich') {
        newEntry = `${companyNameInput.trim()}, ${companyCityInput.trim()} (${selectedCountryInput})`;
      } else {
        newEntry = `${companyNameInput.trim()}, ${companyCityInput.trim()}`;
      }
    } else if (companyNameInput.trim()) {
      if (showForeignCountry && selectedCountryInput && selectedCountryInput !== 'Österreich') {
        newEntry = `${companyNameInput.trim()} (${selectedCountryInput})`;
      } else {
        newEntry = companyNameInput.trim();
      }
    } else if (companyCityInput.trim()) {
      if (showForeignCountry && selectedCountryInput && selectedCountryInput !== 'Österreich') {
        newEntry = `${companyCityInput.trim()} (${selectedCountryInput})`;
      } else {
        newEntry = companyCityInput.trim();
      }
    }
    
    if (newEntry && (!form.companies || !form.companies.includes(newEntry))) {
      const experienceId = ensureExperienceId();
      updateExperienceField(experienceId, 'companies', [...(form.companies || []), newEntry]);
    }

    // Eingabefelder leeren nach dem Hinzufügen
    setCompanyNameInput('');
    setCompanyCityInput(''); 
    if (showLeasing) {
      setLeasingCompanyInput('');
    }
  };
  
  // Funktion zum Hinzufügen einer Leasingfirma
  const addLeasingCompany = (company?: string) => {
    const companyToAdd = (company ?? leasingCompanyInput).trim();
    if (!companyToAdd) return;
    
    const currentList = Array.isArray(form.leasingCompaniesList) ? form.leasingCompaniesList : [];
    if (currentList.includes(companyToAdd)) return;
    
    const experienceId = ensureExperienceId();
    updateExperienceField(experienceId, 'leasingCompaniesList', [...currentList, companyToAdd]);
    setLeasingCompanyInput('');
  };

  // Funktion zum Entfernen einer Leasingfirma
  const removeLeasingCompany = (company: string) => {
    const currentList = Array.isArray(form.leasingCompaniesList) ? form.leasingCompaniesList : [];
    const newLeasingCompanies = currentList.filter(c => c !== company);
    const experienceId = ensureExperienceId();
    updateExperienceField(experienceId, 'leasingCompaniesList', newLeasingCompanies);
  };

  // Funktion zum Bearbeiten einer Leasingfirma
  const updateLeasingCompany = (oldCompany: string, newCompany: string) => {
    const trimmed = newCompany.trim();
    if (!trimmed) return;
    
    const currentList = Array.isArray(form.leasingCompaniesList) ? form.leasingCompaniesList : [];
    const newLeasingCompanies = currentList.map(c => c === oldCompany ? trimmed : c);
    const experienceId = ensureExperienceId();
    updateExperienceField(experienceId, 'leasingCompaniesList', newLeasingCompanies);
  };

  // Funktion zum Entfernen eines Unternehmenseintrags
  const removeCompanyEntry = (entry: string) => {
    if (form.companies) {
      const experienceId = ensureExperienceId();
      updateExperienceField(experienceId, 'companies', form.companies.filter(c => c !== entry));
    }
  };
  
  // Funktion zum Bearbeiten eines Unternehmenseintrags
  const updateCompanyEntry = (oldEntry: string, newEntry: string) => {
    if (form.companies) {
      const experienceId = ensureExperienceId();
      updateExperienceField(experienceId, 'companies', form.companies.map(c => c === oldEntry ? newEntry : c));
    }
  };
  
  // Funktion zum direkten Hinzufügen eines Unternehmens-Favoriten
  const addCompanyFavorite = (favorite: string) => {
    let newEntry = favorite;
    
    if ((!form.companies || !form.companies.includes(newEntry))) {
      const experienceId = ensureExperienceId();
      updateExperienceField(experienceId, 'companies', [...(form.companies || []), newEntry]);
    }
  };
  
  // Funktion zum Hinzufügen eines Ort-Favoriten zum Eingabefeld
  const addCityFavoriteToInput = (favorite: string) => {
    if (companyCityInput.trim()) {
      const currentCities = companyCityInput.trim().split(/,\s*|&\s*/).map(s => s.trim());

      if (!currentCities.includes(favorite)) {
        if (currentCities.length === 1) {
          setCompanyCityInput(`${currentCities[0]} & ${favorite}`);
        } else {
          // Entferne das letzte "&" wenn vorhanden
          const lastCity = currentCities.pop() || '';
          const otherCities = currentCities.join(', ');
          setCompanyCityInput(`${otherCities}${otherCities ? ', ' : ''}${lastCity} & ${favorite}`);
        }
      }
    } else {
      setCompanyCityInput(favorite);
    }
  };
  
  // KI-Vorschläge für Tätigkeiten basierend auf den ausgewählten Positionen
  const aiTaskSuggestions = useMemo(() => {
    if (!selectedPositions || selectedPositions.length === 0) return [];
    const suggestions = getTasksForPositions(selectedPositions);
    return suggestions;
  }, [selectedPositions]);
  
  return (
    <div className="space-y-4">
      {/* Zeitraum */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Zeitraum</h3>
          {hasZeitraumData && (
            <button
              type="button"
              onClick={() => {
                onUpdateField('startMonth', null);
                onUpdateField('startYear', '');
                onUpdateField('endMonth', null);
                onUpdateField('endYear', null);
                onUpdateField('isCurrent', false);
              }}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Zeitraum zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <ZeitraumPicker
          value={{
            startMonth: form.startMonth ?? undefined,
            startYear: form.startYear ?? undefined,
            endMonth: form.endMonth ?? undefined,
            endYear: form.endYear ?? undefined,
            isCurrent: form.isCurrent,
          }}
          onChange={(data) => {
            const experienceId = ensureExperienceId();
            updateExperienceField(experienceId, 'startMonth', 
              data.startMonth !== undefined && data.startMonth !== null
                ? String(data.startMonth).padStart(2, '0')
                : null
            );
            updateExperienceField(experienceId, 'startYear',
              data.startYear !== undefined && data.startYear !== null ? String(data.startYear) : ''
            );
            updateExperienceField(experienceId, 'endMonth',
              data.endMonth !== undefined && data.endMonth !== null
                ? String(data.endMonth).padStart(2, '0')
                : null
            );
            updateExperienceField(experienceId, 'endYear',
              data.endYear !== undefined && data.endYear !== null ? String(data.endYear) : null
            );
            updateExperienceField(experienceId, 'isCurrent', data.isCurrent ?? false);
          }}
        />
      </div>

      {/* Unternehmen & Ort */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-bold text-gray-700">Unternehmen & Ort</h3>
          <div className="flex items-center space-x-4">
            <ToggleSwitch
              checked={showLeasing}
              onChange={handleLeasingToggle}
              label="Leasing"
            />
            {hasCompanyData && (
              <button
                type="button"
                onClick={() => {
                  onUpdateField('companies', []);
                  setCompanyNameInput('');
                  setCompanyCityInput('');
                }}
                className="p-1 text-gray-600 hover:text-gray-900"
                title="Unternehmen & Ort zurücksetzen"
              >
                <Eraser className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Bestehende Unternehmenseinträge als Tags anzeigen */}
        {form.companies && form.companies.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {form.companies.map((company, index) => (
              <CompanyTag
                key={`${company}-${index}`}
                label={company}
                onRemove={() => removeCompanyEntry(company)}
                onEdit={(newValue) => updateCompanyEntry(company, newValue)}
              />
            ))}
          </div>
        )}
        
        <div className="space-y-3">
          {/* Kombiniertes Eingabefeld für Unternehmen & Ort */}
          <div className="flex items-center space-x-2">
            {/* Kombinierter Container mit gemeinsamem Rahmen */}
            <div className="flex-1 relative border border-gray-300 rounded-md overflow-hidden focus-within:ring-1 focus-within:ring-orange-500 focus-within:border-orange-500 transition-all">
              <div className="flex">
                {/* Unternehmen Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="company-name-input"
                    value={companyNameInput}
                    onChange={(e) => setCompanyNameInput(e.target.value)}
                    onFocus={() => setIsCompanyInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsCompanyInputFocused(false), 100)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCompanyEntry();
                      }
                    }}
                    placeholder="Unternehmen..."
                    className="w-full h-10 px-3 py-2 border-none focus:outline-none focus:ring-0 bg-transparent"
                  />
                  {companyNameInput && (
                    <button
                      type="button"
                      onClick={() => setCompanyNameInput('')}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none"
                      aria-label="Unternehmen löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
                
                {/* Visueller Separator */}
                <div className="w-px bg-gray-300 self-stretch my-2"></div>
                
                {/* Ort Input */}
                <div className="flex-1 relative">
                  <input
                    type="text"
                    id="company-city-input"
                    value={companyCityInput}
                    onChange={(e) => setCompanyCityInput(e.target.value)}
                    onFocus={() => setIsCityInputFocused(true)}
                    onBlur={() => setTimeout(() => setIsCityInputFocused(false), 100)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addCompanyEntry();
                      }
                    }}
                    placeholder="Ort(e)..."
                    className="w-full h-10 px-3 py-2 border-none focus:outline-none focus:ring-0 bg-transparent"
                  />
                  {companyCityInput && (
                    <button
                      type="button"
                      onClick={() => setCompanyCityInput('')}
                      className="absolute right-1 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 rounded-full focus:outline-none"
                      aria-label="Ort löschen"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
            
            {/* Zentraler Favoriten-Button */}
            {hasInputData && (
              <button
                type="button"
                onClick={() => {
                  // Intelligente Favoriten-Logik
                  const companyValue = companyNameInput.trim();
                  const cityValue = companyCityInput.trim();
                  
                  if (companyValue && cityValue) {
                    // Beide Felder gefüllt: Kombination als Favorit
                    const combinedValue = showForeignCountry && selectedCountryInput && selectedCountryInput !== 'Österreich'
                      ? `${companyValue}, ${cityValue} (${selectedCountryInput})`
                      : `${companyValue}, ${cityValue}`;
                    toggleFavoriteCompany(combinedValue);
                  } else if (companyValue) {
                    // Nur Unternehmen: als Unternehmen-Favorit
                    toggleFavoriteCompany(companyValue);
                  } else if (cityValue) {
                    // Nur Ort: als Ort-Favorit
                    toggleFavoriteCity(cityValue);
                  }
                  
                  // Felder leeren
                  setCompanyNameInput('');
                  setCompanyCityInput('');
                }}
                className="w-10 h-10 bg-[#F6A800] hover:bg-[#F29400] text-white rounded-md flex items-center justify-center transition-colors duration-200"
                title="Als Favorit hinzufügen"
              >
                <Star className="h-5 w-5" />
              </button>
            )}
            
            {/* Hinzufügen-Button */}
            {hasInputData && (
              <button 
                onClick={addCompanyEntry} 
                className="flex items-center justify-center w-10 h-10 bg-[#F6A800] hover:bg-[#F29400] text-white rounded-md transition-colors duration-200"
                title="Unternehmen und Ort hinzufügen"
              >
                <Plus className="h-5 w-5" />
              </button>
            )}
          </div>
          
          {/* Unternehmen Favoriten */}
          {(favorites || []).filter(company => !form.companies?.includes(company)).length > 0 && (
            <div className="mt-4"> 
              <div className="flex items-center space-x-2 mb-1">
                <Star className="h-4 w-4 text-gray-400" />
                <h4 className="text-xs font-medium text-gray-700">Unternehmen:</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {(favorites || [])
                  .filter(company => !form.companies?.includes(company))
                  .map((company) => (
                  <TagButtonFavorite
                    key={company}
                    label={company}
                    onClick={() => addCompanyFavorite(company)}
                    onRemove={() => toggleFavoriteCompany(company)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Ort Favoriten */}
          {(favoriteCities || []).length > 0 && (
            <div className="mt-4"> 
              <div className="flex items-center space-x-2 mb-1">
                <Star className="h-4 w-4 text-gray-400" />
                <h4 className="text-xs font-medium text-gray-700">Orte:</h4>
              </div>
              <div className="flex flex-wrap gap-2">
                {(favoriteCities || []).map((city) => (
                  <TagButtonFavorite
                    key={city}
                    label={city}
                    onClick={() => addCityFavoriteToInput(city)}
                    onRemove={() => toggleFavoriteCity(city)}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Überlassungsunternehmen Input - nur anzeigen wenn Leasing ausgewählt */}
          {showLeasing && (
            <div className="mt-4 space-y-3">
              {/* Bestehende Leasingfirmen als Tags anzeigen */}
              {Array.isArray(form.leasingCompaniesList) && form.leasingCompaniesList.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {form.leasingCompaniesList.map((company, index) => (
                    <CompanyTag
                      key={`${company}-${index}`}
                      label={company}
                      onRemove={() => removeLeasingCompany(company)}
                      onEdit={(newValue) => updateLeasingCompany(company, newValue)}
                    />
                  ))}
                </div>
              )}
              
              <div className="flex space-x-2 items-center">
                <div className="flex-1">
                  <AutocompleteInput
                    label=""
                    id="leasing-company-input"
                    value={leasingCompanyInput}
                    onChange={setLeasingCompanyInput}
                    onAdd={addLeasingCompany}
                    onFavoriteClick={(val) => {
                      const valueToAdd = val || leasingCompanyInput.trim();
                      if (valueToAdd) toggleFavoriteLeasingCompany(valueToAdd);
                      setLeasingCompanyInput('');
                    }}
                    suggestions={favoriteLeasingCompanies || []}
                    placeholder="Überlassungsunternehmen..."
                    showFavoritesButton={true}
                    showAddButton={true}
                    buttonColor="#F6A800"
                  />
                </div>
              </div>
              
              {/* Leasing-Unternehmen Favoriten */}
              {(favoriteLeasingCompanies || []).filter(company => !(Array.isArray(form.leasingCompaniesList) && form.leasingCompaniesList.includes(company))).length > 0 && (
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Star className="h-4 w-4 text-gray-400" />
                    <h4 className="text-sm font-medium text-gray-700">Favoriten:</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(favoriteLeasingCompanies || [])
                      .filter(company => !(Array.isArray(form.leasingCompaniesList) && form.leasingCompaniesList.includes(company)))
                      .map((company) => (
                      <TagButtonFavorite
                        key={company}
                        label={company}
                        onClick={() => addLeasingCompany(company)}
                        onRemove={() => toggleFavoriteLeasingCompany(company)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* Land Dropdown - nur anzeigen wenn Ausland ausgewählt */}
          {showForeignCountry && (
            <div className="mt-4">
              <CountryDropdown
                label=""
                value={selectedCountryInput}
                onChange={setSelectedCountryInput}
              />
            </div>
          )}
          
          {/* Ausland Toggle - unten rechts in der Card */}
          <div className="flex items-center justify-end space-x-2 mt-4">
            <ToggleSwitch
              checked={showForeignCountry}
              onChange={setShowForeignCountry}
              label="Ausland"
            />
          </div>
        </div>
      </div>

      {/* Position */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Position</h3>
          {hasPositionData && (
            <button
              type="button"
              onClick={() => onPositionsChange([])}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Position zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TagSelectorWithFavorites
          label=""
          value={selectedPositions}
          onChange={(positions) => {
            const experienceId = ensureExperienceId();
            updateExperienceField(experienceId, 'position', positions);
          }}
          allowCustom={true}
          suggestions={cvSuggestions.positions}
        />
      </div>

      {/* Tätigkeiten */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Tätigkeiten</h3>
          {hasTaskData && (
            <button
              type="button"
              onClick={() => onUpdateField('aufgabenbereiche', [])}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Tätigkeiten zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TasksTagInput
          value={form.aufgabenbereiche}
          onChange={(val) => {
            const experienceId = ensureExperienceId();
            updateExperienceField(experienceId, 'aufgabenbereiche', val);
          }}
          aiSuggestions={aiTaskSuggestions || []}
          suggestions={cvSuggestions.aufgabenbereiche}
          positionen={selectedPositions}
        />
      </div>
      
      {/* Weitere Angaben */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Weitere Angaben</h3>
          {(form.zusatzangaben && form.zusatzangaben.trim().length > 0) && (
            <button
              type="button"
              onClick={() => onUpdateField('zusatzangaben', '')}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Weitere Angaben zurücksetzen"
              aria-label="Weitere Angaben zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TextInput
          value={form.zusatzangaben || ''}
          onChange={(val) => {
            const experienceId = ensureExperienceId();
            updateExperienceField(experienceId, 'zusatzangaben', val);
          }}
          label=""
          placeholder="Zusätzliche Informationen zur Berufserfahrung..."
          rows={4}
          id="experience-additional-info"
          name="experience-additional-info"
        />
      </div>
    </div>
  );
}