/**
 * AI-gestützter Content-Suggestion-Panel
 * Hilft beim Formulieren und Verbessern von CV-Texten
 */

import React, { useState } from 'react';
import { CVData } from '@/types/cv-designer';
import { useAI, ContentSuggestion } from '@/hooks/useAI';
import { FileText, Loader, CheckCircle, AlertCircle, Edit3, Copy, Sparkles } from 'lucide-react';

interface ContentSuggestionPanelProps {
  cvData: CVData;
  onContentUpdate: (sectionType: string, newContent: string) => void;
  className?: string;
}

export const ContentSuggestionPanel: React.FC<ContentSuggestionPanelProps> = ({
  cvData,
  onContentUpdate,
  className = ''
}) => {
  const { generateContentSuggestions, contentSuggestions, isLoading, error } = useAI();
  const [selectedSection, setSelectedSection] = useState<string>('summary');
  const [currentContent, setCurrentContent] = useState<string>('');
  const [appliedSuggestions, setAppliedSuggestions] = useState<Set<number>>(new Set());

  const sectionOptions = [
    { value: 'summary', label: 'Profil/Zusammenfassung', content: cvData.personalData.summary || '' },
    { value: 'experience', label: 'Berufserfahrung', content: cvData.workExperience[0]?.description || '' },
    { value: 'skills', label: 'Fähigkeiten', content: cvData.skills.map(s => s.name).join(', ') },
    { value: 'education', label: 'Ausbildung', content: cvData.education[0]?.description || '' }
  ];

  const handleSectionChange = (sectionType: string) => {
    setSelectedSection(sectionType);
    const section = sectionOptions.find(s => s.value === sectionType);
    setCurrentContent(section?.content || '');
    setAppliedSuggestions(new Set());
  };

  const handleAnalyze = async () => {
    if (!currentContent.trim()) {
      return;
    }

    try {
      await generateContentSuggestions(currentContent, selectedSection, cvData);
    } catch (err) {
      console.error('Content-Analyse fehlgeschlagen:', err);
    }
  };

  const handleApplySuggestion = (suggestion: any, index: number) => {
    setCurrentContent(suggestion.text);
    setAppliedSuggestions(prev => new Set([...prev, index]));
  };

  const handleSaveContent = () => {
    onContentUpdate(selectedSection, currentContent);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const getSuggestionTypeIcon = (type: string) => {
    switch (type) {
      case 'improvement': return <Edit3 className="w-4 h-4 text-blue-500" />;
      case 'alternative': return <Copy className="w-4 h-4 text-green-500" />;
      case 'addition': return <Sparkles className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getSuggestionTypeColor = (type: string) => {
    switch (type) {
      case 'improvement': return 'border-blue-200 bg-blue-50';
      case 'alternative': return 'border-green-200 bg-green-50';
      case 'addition': return 'border-purple-200 bg-purple-50';
      default: return 'border-gray-200 bg-gray-50';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-1 flex items-center">
              <FileText className="w-4 h-4 mr-2" />
              AI Content-Assistent
            </h3>
            <p className="text-sm text-gray-600">
              Verbessere deine CV-Texte mit KI-gestützten Vorschlägen
            </p>
          </div>
        </div>

        {/* Section Selector */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Abschnitt auswählen
          </label>
          <select
            value={selectedSection}
            onChange={(e) => handleSectionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {sectionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Content Editor */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Aktueller Inhalt
          </label>
          <textarea
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            placeholder="Gib hier deinen Text ein oder wähle einen Abschnitt aus..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2 mb-4">
          <button
            onClick={handleAnalyze}
            disabled={isLoading || !currentContent.trim()}
            className="flex-1 flex items-center justify-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin mr-2" />
                Analysiere...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Verbesserungen generieren
              </>
            )}
          </button>

          <button
            onClick={handleSaveContent}
            disabled={!currentContent.trim()}
            className="px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-all"
          >
            Speichern
          </button>
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Suggestions */}
        {contentSuggestions && contentSuggestions.suggestions.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 flex items-center">
              <Sparkles className="w-4 h-4 mr-2" />
              AI-Vorschläge ({contentSuggestions.suggestions.length})
            </h4>

            {contentSuggestions.suggestions.map((suggestion, index) => {
              const isApplied = appliedSuggestions.has(index);
              
              return (
                <div 
                  key={index}
                  className={`border rounded-lg p-4 transition-all ${
                    isApplied 
                      ? 'border-green-200 bg-green-50' 
                      : getSuggestionTypeColor(suggestion.type)
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      {isApplied ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        getSuggestionTypeIcon(suggestion.type)
                      )}
                      <span className="text-sm font-medium text-gray-900 capitalize">
                        {suggestion.type === 'improvement' ? 'Verbesserung' :
                         suggestion.type === 'alternative' ? 'Alternative' : 'Ergänzung'}
                      </span>
                    </div>
                    
                    <button
                      onClick={() => handleCopyToClipboard(suggestion.text)}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded"
                      title="In Zwischenablage kopieren"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="bg-white rounded border p-3 mb-3">
                    <p className="text-sm text-gray-900 whitespace-pre-wrap">
                      {suggestion.text}
                    </p>
                  </div>

                  <div className="bg-white rounded border p-3 mb-3">
                    <h6 className="text-xs font-medium text-gray-700 mb-1">Begründung:</h6>
                    <p className="text-xs text-gray-600">{suggestion.reasoning}</p>
                  </div>

                  {!isApplied && (
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleApplySuggestion(suggestion, index)}
                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                      >
                        Text übernehmen
                      </button>
                      
                      <button
                        onClick={() => {
                          setCurrentContent(prev => prev + '\n\n' + suggestion.text);
                        }}
                        className="px-3 py-2 bg-gray-600 text-white text-sm font-medium rounded hover:bg-gray-700 transition-colors"
                      >
                        Anhängen
                      </button>
                    </div>
                  )}

                  {isApplied && (
                    <div className="flex items-center space-x-2 text-sm text-green-700">
                      <CheckCircle className="w-4 h-4" />
                      <span>Vorschlag übernommen</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentSuggestionPanel;