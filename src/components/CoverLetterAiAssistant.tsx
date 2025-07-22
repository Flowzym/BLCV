import React, { useState, useEffect } from 'react';
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
  FileText,
  Search,
  TrendingUp,
  MessageSquare
} from 'lucide-react';
import { generateText, editCoverLetter } from '../services/mistralService';
import { loadKIConfigs } from '../services/supabaseService';
import { KIModelSettings } from '../types/KIModelSettings';

// Default prompts for AI assistant functions
const DEFAULT_KEYWORD_PROMPT = `Du bist ein Experte für Bewerbungsoptimierung. Analysiere die folgende Stellenanzeige und identifiziere die wichtigsten Schlüsselwörter und Anforderungen.

Gib eine Liste der 8-12 wichtigsten Schlüsselwörter zurück, die in einem Bewerbungsschreiben verwendet werden sollten, um die Relevanz für diese Position zu maximieren.

Format: Gib nur die Schlüsselwörter zurück, eines pro Zeile, ohne Aufzählungszeichen oder Nummerierung.

Stellenanzeige:`;

const DEFAULT_STRENGTHS_PROMPT = `Du bist ein Experte für Bewerbungsoptimierung. Analysiere den folgenden Lebenslauf und die Stellenanzeige und identifiziere die 5-8 stärksten Übereinstimmungen und Qualifikationen.

Gib konkrete Vorschläge zurück, welche Stärken, Erfahrungen oder Qualifikationen im Bewerbungsschreiben besonders hervorgehoben werden sollten.

Format: Gib nur die Stärken/Qualifikationen zurück, eine pro Zeile, ohne Aufzählungszeichen oder Nummerierung.

Lebenslauf:
{CV_CONTENT}

Stellenanzeige:
{JOB_CONTENT}`;

const DEFAULT_CUSTOM_PROMPT = `Du bist ein Experte für Bewerbungsschreiben. Bearbeite das folgende Bewerbungsschreiben basierend auf der gegebenen Anweisung.

Anweisung: {INSTRUCTION}

Bewerbungsschreiben:`;

interface CoverLetterAiAssistantProps {
  cvContent: string;
  jobContent: string;
  coverLetter: string;
  activeKIModel: KIModelSettings | null;
  onCoverLetterChange: (newContent: string) => void;
}

interface KeywordAnalysisState {
  isActive: boolean;
  isAnalyzing: boolean;
  keywords: string[];
}

interface StrengthsAnalysisState {
  isActive: boolean;
  isAnalyzing: boolean;
  strengths: string[];
}

interface CustomInstructionState {
  isActive: boolean;
  instruction: string;
  isProcessing: boolean;
  lastResult: string;
}

export default function CoverLetterAiAssistant({
  cvContent,
  jobContent,
  coverLetter,
  activeKIModel,
  onCoverLetterChange
}: CoverLetterAiAssistantProps) {
  // Load all models and AI assistant settings
  const [allModels, setAllModels] = useState<KIModelSettings[]>([]);
  const [aiAssistantSettings, setAiAssistantSettings] = useState({
    keywordModelId: '',
    strengthsModelId: '',
    customModelId: '',
    keywordPrompt: DEFAULT_KEYWORD_PROMPT,
    strengthsPrompt: DEFAULT_STRENGTHS_PROMPT,
    customPrompt: DEFAULT_CUSTOM_PROMPT
  });
  
  const [keywordAnalysis, setKeywordAnalysis] = useState<KeywordAnalysisState>({
    isActive: false,
    isAnalyzing: false,
    keywords: []
  });
  
  const [strengthsAnalysis, setStrengthsAnalysis] = useState<StrengthsAnalysisState>({
    isActive: false,
    isAnalyzing: false,
    strengths: []
  });
  
  const [customInstruction, setCustomInstruction] = useState<CustomInstructionState>({
    isActive: false,
    instruction: '',
    isProcessing: false,
    lastResult: ''
  });

  // Load KI models and AI assistant settings on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load models
        const models = await loadKIConfigs();
        setAllModels(models);
        
        // Load AI assistant settings from localStorage
        const savedSettings = localStorage.getItem('coverLetterAiSettings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setAiAssistantSettings({
            keywordModelId: parsed.keywordModelId || '',
            strengthsModelId: parsed.strengthsModelId || '',
            customModelId: parsed.customModelId || '',
            keywordPrompt: parsed.keywordPrompt || DEFAULT_KEYWORD_PROMPT,
            strengthsPrompt: parsed.strengthsPrompt || DEFAULT_STRENGTHS_PROMPT,
            customPrompt: parsed.customPrompt || DEFAULT_CUSTOM_PROMPT
          });
        }
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    };
    loadData();
  }, []);

  // Helper functions to get assigned models
  const getKeywordModel = (): KIModelSettings | null => {
    if (aiAssistantSettings.keywordModelId) {
      return allModels.find(m => m.id === aiAssistantSettings.keywordModelId) || null;
    }
    // Fallback to active model
    return activeKIModel || allModels.find(m => m.active) || null;
  };

  const getStrengthsModel = (): KIModelSettings | null => {
    if (aiAssistantSettings.strengthsModelId) {
      return allModels.find(m => m.id === aiAssistantSettings.strengthsModelId) || null;
    }
    // Fallback to active model
    return activeKIModel || allModels.find(m => m.active) || null;
  };

  const getCustomModel = (): KIModelSettings | null => {
    if (aiAssistantSettings.customModelId) {
      return allModels.find(m => m.id === aiAssistantSettings.customModelId) || null;
    }
    // Fallback to active model
    return activeKIModel || allModels.find(m => m.active) || null;
  };

  const toggleKeywordAnalysis = () => {
    setKeywordAnalysis(prev => ({
      ...prev,
      isActive: !prev.isActive,
      keywords: []
    }));
  };

  const toggleStrengthsAnalysis = () => {
    setStrengthsAnalysis(prev => ({
      ...prev,
      isActive: !prev.isActive,
      strengths: []
    }));
  };

  const toggleCustomInstruction = () => {
    setCustomInstruction(prev => ({
      ...prev,
      isActive: !prev.isActive,
      instruction: '',
      lastResult: ''
    }));
  };

  const analyzeKeywords = async () => {
    const keywordModel = getKeywordModel();
    if (!keywordModel || !jobContent.trim()) return;

    setKeywordAnalysis(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const fullPrompt = `${aiAssistantSettings.keywordPrompt}\n\n${jobContent}`;
      const result = await generateText(fullPrompt, keywordModel);
      
      const keywords = result
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 12);
      
      setKeywordAnalysis(prev => ({
        ...prev,
        keywords,
        isAnalyzing: false
      }));
    } catch (error) {
      console.error('Keyword analysis failed:', error);
      setKeywordAnalysis(prev => ({ 
        ...prev, 
        isAnalyzing: false,
        keywords: ['Fehler bei der Analyse aufgetreten.']
      }));
    }
  };

  const analyzeStrengths = async () => {
    const strengthsModel = getStrengthsModel();
    if (!strengthsModel || !cvContent.trim() || !jobContent.trim()) return;

    setStrengthsAnalysis(prev => ({ ...prev, isAnalyzing: true }));

    try {
      const fullPrompt = aiAssistantSettings.strengthsPrompt
        .replace('{CV_CONTENT}', cvContent)
        .replace('{JOB_CONTENT}', jobContent);
      
      const result = await generateText(fullPrompt, strengthsModel);
      
      const strengths = result
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .slice(0, 8);
      
      setStrengthsAnalysis(prev => ({
        ...prev,
        strengths,
        isAnalyzing: false
      }));
    } catch (error) {
      console.error('Strengths analysis failed:', error);
      setStrengthsAnalysis(prev => ({ 
        ...prev, 
        isAnalyzing: false,
        strengths: ['Fehler bei der Analyse aufgetreten.']
      }));
    }
  };

  const processCustomInstruction = async () => {
    const customModel = getCustomModel();
    if (!customModel || !customInstruction.instruction.trim() || !coverLetter.trim()) return;

    setCustomInstruction(prev => ({ ...prev, isProcessing: true }));

    try {
      const fullPrompt = aiAssistantSettings.customPrompt
        .replace('{INSTRUCTION}', customInstruction.instruction);
      
      const result = await editCoverLetter(coverLetter, fullPrompt, customModel);
      
      onCoverLetterChange(result);
      setCustomInstruction(prev => ({
        ...prev,
        lastResult: 'Bewerbungsschreiben erfolgreich bearbeitet!',
        isProcessing: false
      }));
    } catch (error) {
      console.error('Custom instruction failed:', error);
      setCustomInstruction(prev => ({ 
        ...prev, 
        isProcessing: false,
        lastResult: 'Fehler bei der Bearbeitung aufgetreten.'
      }));
    }
  };

  const clearKeywords = () => {
    setKeywordAnalysis(prev => ({ ...prev, keywords: [] }));
  };

  const clearStrengths = () => {
    setStrengthsAnalysis(prev => ({ ...prev, strengths: [] }));
  };

  const clearCustomResult = () => {
    setCustomInstruction(prev => ({ ...prev, lastResult: '' }));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
        <Brain className="h-6 w-6" style={{ color: '#F29400' }} />
        <h2 className="text-lg font-semibold text-gray-900">KI-Assistent</h2>
        <Sparkles className="h-4 w-4 text-yellow-500" />
      </div>

      {/* Keyword Analysis Section */}
      <div className="space-y-4">
        <div className="border rounded-lg py-2 px-4 mb-4">
          <div className="flex items-center justify-between h-6">
            <div className="flex items-center gap-2 h-6">
              <Search className="h-5 w-5 text-blue-500" />
              <span className="font-medium text-gray-900">Schlüsselwort-Analyse</span>
            </div>
            <button
              onClick={toggleKeywordAnalysis}
              className={`px-2 rounded text-xs font-medium transition-colors flex items-center justify-center h-6 min-w-[60px] ${
                keywordAnalysis.isActive
                  ? 'bg-blue-100 text-blue-800 hover:bg-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {keywordAnalysis.isActive ? 'Aktiv' : 'Aktivieren'}
            </button>
          </div>

          {keywordAnalysis.isActive && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mt-2">
                Analysiert die Stellenanzeige und identifiziert wichtige Schlüsselwörter für Ihr Bewerbungsschreiben.
              </p>
              
              {/* Analyze Button */}
              <button
                onClick={analyzeKeywords}
                disabled={keywordAnalysis.isAnalyzing || !jobContent.trim() || !getKeywordModel()}
                className="w-full flex items-center justify-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {keywordAnalysis.isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analysiere...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Schlüsselwörter analysieren</span>
                  </>
                )}
              </button>

              {/* Results */}
              {keywordAnalysis.keywords.length > 0 && (
                <div className="border rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-blue-800">Wichtige Schlüsselwörter:</h4>
                    <button
                      onClick={clearKeywords}
                      className="p-1 text-blue-600 hover:text-blue-800"
                      title="Ergebnisse löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {keywordAnalysis.keywords.map((keyword, index) => (
                      <div key={index} className="text-sm text-blue-700 leading-relaxed flex items-start">
                        <span className="text-blue-500 mr-2 flex-shrink-0 leading-none">•</span>
                        <span>{keyword}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Strengths Analysis Section */}
        <div className="border rounded-lg py-2 px-4 mb-4">
          <div className="flex items-center justify-between h-6">
            <div className="flex items-center gap-2 h-6">
              <TrendingUp className="h-5 w-5 text-green-500" />
              <span className="font-medium text-gray-900">Stärken-Analyse</span>
            </div>
            <button
              onClick={toggleStrengthsAnalysis}
              className={`px-2 rounded text-xs font-medium transition-colors flex items-center justify-center h-6 min-w-[60px] ${
                strengthsAnalysis.isActive
                  ? 'bg-green-100 text-green-800 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {strengthsAnalysis.isActive ? 'Aktiv' : 'Aktivieren'}
            </button>
          </div>

          {strengthsAnalysis.isActive && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mt-2">
                Identifiziert die stärksten Übereinstimmungen zwischen Ihrem Lebenslauf und der Stellenanzeige.
              </p>
              
              {/* Analyze Button */}
              <button
                onClick={analyzeStrengths}
                disabled={strengthsAnalysis.isAnalyzing || !cvContent.trim() || !jobContent.trim() || !getStrengthsModel()}
                className="w-full flex items-center justify-center gap-2 px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {strengthsAnalysis.isAnalyzing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Analysiere...</span>
                  </>
                ) : (
                  <>
                    <TrendingUp className="h-4 w-4" />
                    <span>Stärken analysieren</span>
                  </>
                )}
              </button>

              {/* Results */}
              {strengthsAnalysis.strengths.length > 0 && (
                <div className="border rounded-lg p-3 bg-green-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-green-800">Hervorzuhebende Stärken:</h4>
                    <button
                      onClick={clearStrengths}
                      className="p-1 text-green-600 hover:text-green-800"
                      title="Ergebnisse löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {strengthsAnalysis.strengths.map((strength, index) => (
                      <div key={index} className="text-sm text-green-700 leading-relaxed flex items-start">
                        <span className="text-green-500 mr-2 flex-shrink-0 leading-none">•</span>
                        <span>{strength}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Custom Instruction Section */}
        <div className="border rounded-lg py-2 px-4 mb-4">
          <div className="flex items-center justify-between h-6">
            <div className="flex items-center gap-2 h-6">
              <MessageSquare className="h-5 w-5 text-purple-500" />
              <span className="font-medium text-gray-900">Eigene Anweisung</span>
            </div>
            <button
              onClick={toggleCustomInstruction}
              className={`px-2 rounded text-xs font-medium transition-colors flex items-center justify-center h-6 min-w-[60px] ${
                customInstruction.isActive
                  ? 'bg-purple-100 text-purple-800 hover:bg-purple-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {customInstruction.isActive ? 'Aktiv' : 'Aktivieren'}
            </button>
          </div>

          {customInstruction.isActive && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mt-2">
                Geben Sie eine eigene Anweisung ein, um das Bewerbungsschreiben zu modifizieren.
              </p>
              
              {/* Instruction Input */}
              <div>
                <textarea
                  value={customInstruction.instruction}
                  onChange={(e) => setCustomInstruction(prev => ({ ...prev, instruction: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-sm"
                  style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
                  placeholder="z.B. 'Betone mehr meine Führungserfahrung' oder 'Mache den Ton persönlicher'"
                />
              </div>
              
              {/* Process Button */}
              <button
                onClick={processCustomInstruction}
                disabled={customInstruction.isProcessing || !customInstruction.instruction.trim() || !coverLetter.trim() || !getCustomModel()}
                className="w-full flex items-center justify-center gap-2 px-3 py-1 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
              >
                {customInstruction.isProcessing ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Bearbeite...</span>
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4" />
                    <span>Anweisung ausführen</span>
                  </>
                )}
              </button>

              {/* Results */}
              {customInstruction.lastResult && (
                <div className="border rounded-lg p-3 bg-purple-50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-purple-800">Ergebnis:</h4>
                    <button
                      onClick={clearCustomResult}
                      className="p-1 text-purple-600 hover:text-purple-800"
                      title="Ergebnis löschen"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="text-sm text-purple-700 leading-relaxed">
                    {customInstruction.lastResult}
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
              <span className="text-gray-700">Tonalitäts-Analyse</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <Lightbulb className="h-4 w-4 text-purple-500" />
              <span className="text-gray-700">Verbesserungs-Tipps</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <Settings className="h-4 w-4 text-blue-500" />
              <span className="text-gray-700">Längen-Optimierung</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <FileText className="h-4 w-4 text-green-500" />
              <span className="text-gray-700">Struktur-Check</span>
            </div>
            
            <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
              <Target className="h-4 w-4 text-orange-500" />
              <span className="text-gray-700">Zielgruppen-Anpassung</span>
            </div>
          </div>
        </div>

        {/* Status indicator */}
      </div>
      
      {/* Status indicator moved to bottom */}
      <div className="mt-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-700">
          <div>
            <div>Schlüsselwörter: {getKeywordModel()?.name || 'Standard-Modell'}</div>
            <div>Stärken: {getStrengthsModel()?.name || 'Standard-Modell'}</div>
            <div>Anweisungen: {getCustomModel()?.name || 'Standard-Modell'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}