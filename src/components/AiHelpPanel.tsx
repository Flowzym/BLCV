import React, { useState } from 'react';
import { 
  Brain, 
  Sparkles, 
  Zap, 
  Target, 
  AlertTriangle, 
  Lightbulb,
  Settings,
  Play,
  CheckSquare,
  Square,
  Trash2,
  Users,
  RefreshCw,
  ChevronDown,
  FileText
} from 'lucide-react';
import { useLebenslauf } from './LebenslaufContext';
import { generateText, generateBisSuggestions } from '../services/mistralService';
import { loadKIConfigs } from '../services/supabaseService';
import { KIModelSettings } from '../types/KIModelSettings';

// Default prompts for AI help functions
const DEFAULT_BIS_PROMPT = `Du bist ein Experte für die BIS-Kompetenzen des AMS (Arbeitsmarktservice Österreich). Deine Aufgabe ist es, Tätigkeitsbeschreibungen in die **offiziellen, standardisierten und kurzen BIS-Kompetenzen** zu übersetzen.

Regeln:
- Verwende **ausschließlich** die offizielle BIS-Terminologie.
- Sei präzise und verwende die **exakten Fachbegriffe** der BIS-Kompetenzen.
- Fasse ähnliche Tätigkeiten zu den passendsten BIS-Kompetenzen zusammen.
- Gib für jede Eingabe **direkt die BIS-Kompetenzen** als Aufzählungspunkte aus.
- **Format:** "• [BIS-Kompetenzname]" pro Zeile. **Keine zusätzlichen Beschreibungen oder Erklärungen.**

Tätigkeiten:`;

const DEFAULT_GENDER_PROMPTS = {
  neutral: `Du bist ein Experte für geschlechtsneutrale Sprache im deutschsprachigen Raum.

Wandle die folgenden Berufsbezeichnungen und Tätigkeitsbeschreibungen in geschlechtsneutrale Formulierungen um.

Regeln:
- Verwende moderne, professionelle geschlechtsneutrale Sprache
- Nutze Binnen-I, Genderstern (*), Doppelpunkt (:) oder Schrägstrich (/) je nach Kontext
- Achte auf Lesbarkeit und Professionalität
- Behalte die ursprüngliche Bedeutung bei
- Format: Gib nur die umgewandelten Begriffe zurück, einen pro Zeile

Text:`,
  male: `Du bist ein Experte für deutsche Sprache und Berufsbezeichnungen.

Wandle die folgenden Berufsbezeichnungen und Tätigkeitsbeschreibungen in männliche Formulierungen um.

Regeln:
- Verwende korrekte männliche Berufsbezeichnungen
- Achte auf grammatikalische Korrektheit
- Behalte die ursprüngliche Bedeutung bei
- Format: Gib nur die umgewandelten Begriffe zurück, einen pro Zeile

Text:`,
  female: `Du bist ein Experte für deutsche Sprache und Berufsbezeichnungen.

Wandle die folgenden Berufsbezeichnungen und Tätigkeitsbeschreibungen in weibliche Formulierungen um.

Regeln:
- Verwende korrekte weibliche Berufsbezeichnungen
- Achte auf grammatikalische Korrektheit
- Behalte die ursprüngliche Bedeutung bei
- Format: Gib nur die umgewandelten Begriffe zurück, einen pro Zeile

Text:`
};

interface BISTranslatorState {
  isActive: boolean;
  selectedTasks: string[];
  isTranslating: boolean;
  results: string[];
}

interface GenderState {
  isActive: boolean;
  selectedGender: 'neutral' | 'male' | 'female';
  isProcessing: boolean;
  lastResults: string[];
}

export default function AiHelpPanel() {
  const lebenslaufContext = useLebenslauf();
  const { 
    berufserfahrung, 
    selectedExperienceId, 
    multiSelectedExperienceIds,
    isBisTranslatorActive,
    setIsBisTranslatorActive,
    updateExperienceField,
    updatePersonalData,
    personalData,
    selectedBisTasks,
    toggleBisTaskSelection,
    setBisTranslatorResults
  } = lebenslaufContext;
  
  // Load all models and AI help settings
  const [allModels, setAllModels] = useState<KIModelSettings[]>([]);
  const [aiHelpSettings, setAiHelpSettings] = useState({
    bisModelId: '',
    genderModelId: '',
    bisPrompt: DEFAULT_BIS_PROMPT,
    genderNeutralPrompt: DEFAULT_GENDER_PROMPTS.neutral,
    genderMalePrompt: DEFAULT_GENDER_PROMPTS.male,
    genderFemalePrompt: DEFAULT_GENDER_PROMPTS.female
  });
  
  const [bisTranslator, setBisTranslator] = useState<BISTranslatorState>({
    isActive: false,
    selectedTasks: selectedBisTasks,
    isTranslating: false,
    results: []
  });
  const [genderFunction, setGenderFunction] = useState<GenderState>({
    isActive: false,
    selectedGender: 'neutral',
    isProcessing: false,
    lastResults: []
  });

  // Load KI models and AI help settings on mount
  React.useEffect(() => {
    const loadData = async () => {
      try {
        // Load models
        const models = await loadKIConfigs();
        setAllModels(models);
        
        // Load AI help settings from localStorage
        const savedSettings = localStorage.getItem('aiHelpSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setAiHelpSettings({
            bisModelId: parsed.bisModelId || '',
            genderModelId: parsed.genderModelId || '',
            bisPrompt: parsed.bisPrompt || DEFAULT_BIS_PROMPT,
            genderNeutralPrompt: parsed.genderNeutralPrompt || DEFAULT_GENDER_PROMPTS.neutral,
            genderMalePrompt: parsed.genderMalePrompt || DEFAULT_GENDER_PROMPTS.male,
            genderFemalePrompt: parsed.genderFemalePrompt || DEFAULT_GENDER_PROMPTS.female
          });
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, []);

  // Helper functions to get assigned models
  const getBisModel = (): KIModelSettings | null => {
    if (aiHelpSettings.bisModelId) {
      return allModels.find(m => m.id === aiHelpSettings.bisModelId) || null;
    }
    // Fallback to active model
    return allModels.find(m => m.active) || null;
  };

  const getGenderModel = (): KIModelSettings | null => {
    if (aiHelpSettings.genderModelId) {
      return allModels.find(m => m.id === aiHelpSettings.genderModelId) || null;
    }
    // Fallback to active model
    return allModels.find(m => m.active) || null;
  };

  const getCurrentGenderPrompt = (): string => {
    switch (genderFunction.selectedGender) {
      case 'neutral':
        return aiHelpSettings.genderNeutralPrompt;
      case 'male':
        return aiHelpSettings.genderMalePrompt;
      case 'female':
        return aiHelpSettings.genderFemalePrompt;
      default:
        return aiHelpSettings.genderNeutralPrompt;
    }
  };

  // Get current experience tasks
  const selectedExperiences = berufserfahrung.filter(exp => 
    multiSelectedExperienceIds.includes(exp.id)
  );
  
  // Collect all unique tasks from selected experiences
  const allTasksFromSelected = selectedExperiences.reduce((tasks, exp) => {
    if (exp.aufgabenbereiche) {
      exp.aufgabenbereiche.forEach(task => {
        if (!tasks.includes(task)) {
          tasks.push(task);
        }
      });
    }
    return tasks;
  }, [] as string[]);
  
  const availableTasks = allTasksFromSelected;

  const toggleBISTranslator = () => {
    const newState = !bisTranslator.isActive;
    
    // Update context state (which automatically syncs to localStorage)
    setIsBisTranslatorActive(newState);
    
    setBisTranslator(prev => ({
      ...prev,
      isActive: newState,
      selectedTasks: [],
      results: []
    }));
  };


  // Sync bisTranslator.isActive with context state
  React.useEffect(() => {
    setBisTranslator(prev => ({ ...prev, isActive: isBisTranslatorActive }));
  }, [isBisTranslatorActive]);

  // Sync selectedTasks with context state
  React.useEffect(() => {
    setBisTranslator(prev => ({ ...prev, selectedTasks: selectedBisTasks }));
  }, [selectedBisTasks]);

  const toggleGenderFunction = () => {
    setGenderFunction(prev => ({
      ...prev,
      isActive: !prev.isActive,
      lastResults: []
    }));
  };

  const toggleTaskSelection = (task: string) => {
    toggleBisTaskSelection(task);
  };

  const selectAllTasks = () => {
    availableTasks.forEach(task => {
      if (!selectedBisTasks.includes(task)) {
        toggleBisTaskSelection(task);
      }
    });
  };

  const deselectAllTasks = () => {
    selectedBisTasks.forEach(task => {
      toggleBisTaskSelection(task);
    });
  };

  const translateTasks = async () => {
    console.log('🔄 translateTasks function called');
    console.log('📊 allModels:', allModels);
    console.log('⚙️ aiHelpSettings.bisModelId:', aiHelpSettings.bisModelId);
    console.log('📝 selectedBisTasks:', selectedBisTasks);
    console.log('🎯 bisTranslator.selectedTasks:', bisTranslator.selectedTasks);
    
    const bisModel = getBisModel();
    console.log('🤖 getBisModel() result:', bisModel);
    
    if (!bisModel || bisTranslator.selectedTasks.length === 0) return;
    console.log('✅ Passed initial checks, starting translation...');

    setBisTranslator(prev => ({ ...prev, isTranslating: true }));

    try {
      const results: Record<string, string[]> = {};
      
      // Process each task individually
      for (const task of bisTranslator.selectedTasks) {
        console.log(`🔄 Processing task: "${task}"`);
        try {
          const suggestions = await generateBisSuggestions(task, bisModel, aiHelpSettings.bisPrompt);
          console.log(`✅ Got suggestions for "${task}":`, suggestions);
          if (suggestions && suggestions.length > 0) {
            results[task] = suggestions;
          }
        } catch (error) {
          console.error(`❌ Error translating task "${task}":`, error);
        }
      }
      
      console.log('📊 Final results object:', results);
      
      // Update context only
      setBisTranslator(prev => ({
        ...prev,
        isTranslating: false
      }));
      
      setBisTranslatorResults(results);
      console.log('✅ Updated context with BIS results');
    } catch (error) {
      console.error('❌ BIS translation failed:', error);
      setBisTranslator(prev => ({ ...prev, isTranslating: false }));
    }
  };

  const processGenderConversion = async () => {
    const genderModel = getGenderModel();
    if (!genderModel) return;

    setGenderFunction(prev => ({ ...prev, isProcessing: true }));

    try {
      // Collect all relevant text data for gendering
      const textToProcess: string[] = [];
      
      // Add positions from all experiences
      berufserfahrung.forEach(exp => {
        if (exp.position && exp.position.length > 0) {
          textToProcess.push(...exp.position);
        }
      });
      
      // Add personal data if available
      if (personalData?.vorname) textToProcess.push(personalData.vorname);
      if (personalData?.nachname) textToProcess.push(personalData.nachname);
      
      if (textToProcess.length === 0) {
        setGenderFunction(prev => ({ 
          ...prev, 
          isProcessing: false,
          lastResults: ['Keine Daten zum Gendern gefunden.']
        }));
        return;
      }

      const textInput = textToProcess.join('\n');
      const fullPrompt = `${getCurrentGenderPrompt()}\n\n${textInput}`;
      
      const result = await generateText(fullPrompt, genderModel);
      const processedResults = result.split('\n').filter(line => line.trim());
      
      setGenderFunction(prev => ({
        ...prev,
        lastResults: processedResults,
        isProcessing: false
      }));
      
    } catch (error) {
      console.error('Gender conversion failed:', error);
      setGenderFunction(prev => ({ 
        ...prev, 
        isProcessing: false,
        lastResults: ['Fehler beim Gendern aufgetreten.']
      }));
    }
  };

  const clearResults = () => {
    // Clear context results
    lebenslaufContext.setBisTranslatorResults({});
    // Clear all selected tasks
    lebenslaufContext.selectedBisTasks.forEach(task => {
      lebenslaufContext.toggleBisTaskSelection(task);
    });
  };

  const clearGenderResults = () => {
    setGenderFunction(prev => ({
      ...prev,
      lastResults: []
    }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-6 border-b border-gray-200 pb-4">
        <Brain className="h-6 w-6" style={{ color: '#F29400' }} />
        <h2 className="text-lg font-semibold text-gray-900">KI-Assistent</h2>
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </div>

      {/* Gender Function Section */}
      <div className="space-y-4">
        <div className="border rounded-lg py-2 px-4 mb-4">
          <div className="flex items-center justify-between h-6">
            <div className="flex items-center gap-2 h-6">
              <Zap className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-900">Automatisches Gendern</span>
            </div>
            <button
              onClick={toggleGenderFunction}
              className={`px-2 rounded text-xs font-medium transition-colors flex items-center justify-center h-6 min-w-[60px] ${
                genderFunction.isActive
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {genderFunction.isActive ? 'Aktiv' : 'Aktivieren'}
            </button>
          </div>

          {genderFunction.isActive && (
            <div className="space-y-3">
              {/* Gender Selection */}
              <div>
                <span className="text-sm font-medium text-gray-700 mb-2 block">
                  Geschlecht auswählen:
                </span>
                <div className="flex gap-2">
                  {[
                    { key: 'neutral', label: 'Neutral', icon: Users },
                    { key: 'male', label: 'Männlich', icon: Users },
                    { key: 'female', label: 'Weiblich', icon: Users }
                  ].map(({ key, label, icon: Icon }) => (
                    <button
                      key={key}
                      onClick={() => setGenderFunction(prev => ({ 
                        ...prev, 
                        selectedGender: key as 'neutral' | 'male' | 'female' 
                      }))}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-colors ${
                        genderFunction.selectedGender === key
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Process Button */}
              <button
                onClick={processGenderConversion}
                disabled={genderFunction.isProcessing || !getGenderModel()}
                className="w-full flex items-center justify-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {genderFunction.isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verarbeite...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Lebenslauf gendern ({genderFunction.selectedGender})</span>
                  </>
                )}
              </button>

              {/* Results */}
              {genderFunction.lastResults.length > 0 && (
                <div className="border rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800">Gegenderte Begriffe:</h4>
                    <button
                      onClick={clearGenderResults}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Ergebnisse löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {genderFunction.lastResults.map((result, index) => (
                      <div key={index} className="text-sm text-blue-700 leading-relaxed">
                        {result}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* BIS-Übersetzer Section */}
        {/* BIS-Übersetzer Toggle */}
        <div className="border rounded-lg py-2 px-4 mb-4">
          <div className="flex items-center justify-between h-6">
            <div className="flex items-center gap-2 h-6">
              <Target className="h-5 w-5 text-green-500" />
              <span className="font-medium text-gray-900">BIS-Übersetzer</span>
            </div>
            <button
              onClick={toggleBISTranslator}
              className={`px-2 rounded text-xs font-medium transition-colors flex items-center justify-center h-6 min-w-[60px] ${
                bisTranslator.isActive
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {bisTranslator.isActive ? 'Aktiv' : 'Aktivieren'}
            </button>
          </div>

          {bisTranslator.isActive && (
            <div className="space-y-3">
              {/* Task Selection */}
              {selectedExperiences.length > 0 ? (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tätigkeiten auswählen ({bisTranslator.selectedTasks.length}/{availableTasks.length}):
                    </span>
                    <div className="flex gap-1">
                      <button
                        onClick={selectAllTasks}
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        Alle
                      </button>
                      <span className="text-xs text-gray-400">|</span>
                      <button
                        onClick={deselectAllTasks}
                        className="text-xs text-gray-600 hover:text-gray-800"
                      >
                        Keine
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-1 max-h-60 overflow-y-auto border rounded-lg p-2 bg-gray-50">
                    {selectedExperiences.map(exp => (
                      <details key={exp.id} className="mb-1 last:mb-0">
                        <summary className="text-sm font-medium text-gray-700 mb-1 px-3 py-1.5 bg-white rounded border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">
                            {Array.isArray(exp.position) ? exp.position.join(', ') : 'Keine Position'}
                            </div>
                            {exp.companies && exp.companies.length > 0 && (
                              <div className="text-xs text-gray-500 mt-0.5">{Array.isArray(exp.companies) ? exp.companies[0] : exp.companies}</div>
                            )}
                          </div>
                          <ChevronDown className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        </summary>
                        <div className="space-y-0.5 ml-2 mt-0.5">
                          {exp.aufgabenbereiche && exp.aufgabenbereiche.map((task, taskIndex) => (
                            <label
                              key={`${exp.id}-${taskIndex}`}
                              className="flex items-start gap-2 py-0.5 px-1 hover:bg-white rounded cursor-pointer border border-transparent hover:border-gray-200 transition-all duration-200"
                            >
                              <button
                                onClick={() => toggleTaskSelection(task)}
                                className="mt-0.5 text-orange-500 hover:text-orange-600"
                              >
                                {bisTranslator.selectedTasks.includes(task) ? (
                                  <CheckSquare className="h-4 w-4" />
                                ) : (
                                  <Square className="h-4 w-4" />
                                )}
                              </button>
                              <span className="text-xs text-gray-700 leading-tight flex-1">{task}</span>
                            </label>
                          ))}
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm border-2 border-dashed border-gray-300 rounded-lg">
                  Keine Berufserfahrungen für BIS-Übersetzung ausgewählt.
                  <br />
                  <span className="text-xs text-gray-400 mt-1 block">
                    Wählen Sie Berufserfahrungen in der Vorschau über die Checkboxen aus.
                  </span>
                </div>
              )}

              {/* Show total available tasks count */}
              {availableTasks.length > 0 && (
                <div className="text-xs text-gray-500 text-center py-2 border-t border-gray-200">
                  Insgesamt {availableTasks.length} einzigartige Tätigkeiten verfügbar
                </div>
              )}

              {/* Translate Button */}
              {bisTranslator.selectedTasks.length > 0 && (
                <button
                  onClick={translateTasks}
                  disabled={bisTranslator.isTranslating || !getBisModel()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                >
                  {bisTranslator.isTranslating ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Übersetze...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>In BIS-Kompetenzen übersetzen</span>
                    </>
                  )}
                </button>
              )}

              {/* Results */}
              {Object.keys(lebenslaufContext.bisTranslatorResults || {}).length > 0 && (
                <div className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">BIS-Kompetenzen:</h4>
                    <button
                      onClick={clearResults}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Ergebnisse löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {Object.entries(lebenslaufContext.bisTranslatorResults || {}).map(([originalTask, translations]) => (
                      <div key={originalTask} className="mb-3">
                        <div className="text-xs text-gray-600 mb-1 font-medium">
                          {originalTask}:
                        </div>
                        <div className="space-y-1">
                          {translations.map((translation, index) => (
                            <div key={index} className="text-sm text-green-700 leading-relaxed flex items-start">
                              <span className="text-green-500 mr-2 flex-shrink-0 leading-none">•</span>
                              <span>{translation}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Other planned functions */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Weitere geplante Funktionen:</h4>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <AlertTriangle className="h-4 w-4 text-yellow-500" />
              <span className="text-gray-700">Lücken-Fixer</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <Lightbulb className="h-4 w-4 text-purple-500" />
              <span className="text-gray-700">Optimierungs-Tips</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <Settings className="h-4 w-4 text-blue-500" />
              <span className="text-gray-700">Sortierung</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">Zusammenfassen</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <Target className="h-4 w-4 text-orange-500" />
              <span className="text-gray-700">Zeilbereich</span>
            </div>
          </div>
        </div>

        {/* Status indicator */}
      </div>
      
      {/* Status indicator moved to bottom */}
      <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-700">
          <div>
            <div>BIS: {getBisModel()?.name || 'Standard-Modell'}</div>
            <div>Gendern: {getGenderModel()?.name || 'Standard-Modell'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}