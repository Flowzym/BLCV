/**
 * AI-gestützter Template-Matching-Assistent
 * Analysiert CV-Daten und schlägt passende Templates vor
 */

import React, { useState } from 'react';
import { CVData, DesignTemplate } from '@/types/cv-designer';
import { useAI, TemplateMatchResult } from '@/hooks/useAI';
import { layoutTemplates } from '@/modules/cv-designer/config/consolidated_layout_templates';
import { Wand2, Loader, CheckCircle, AlertCircle, Target, TrendingUp, Star } from 'lucide-react';

interface TemplateMatchingAssistantProps {
  cvData: CVData;
  onTemplateSelect: (template: DesignTemplate) => void;
  className?: string;
}

export const TemplateMatchingAssistant: React.FC<TemplateMatchingAssistantProps> = ({
  cvData,
  onTemplateSelect,
  className = ''
}) => {
  const { analyzeForTemplate, templateAnalysis, isLoading, error } = useAI();
  const [showAlternatives, setShowAlternatives] = useState(false);

  const handleAnalyze = async () => {
    try {
      await analyzeForTemplate(cvData);
    } catch (err) {
      console.error('Template-Analyse fehlgeschlagen:', err);
    }
  };

  const handleSelectTemplate = (templateId: string) => {
    const template = layoutTemplates.find(t => t.id === templateId);
    if (template) {
      onTemplateSelect(template);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.6) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.8) return 'Sehr gut geeignet';
    if (confidence >= 0.6) return 'Gut geeignet';
    return 'Bedingt geeignet';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-1 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              AI Template-Matching
            </h3>
            <p className="text-sm text-gray-600">
              Lass die KI das beste Template für deinen Lebenslauf finden
            </p>
          </div>
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-medium rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Analysiere Templates...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Template-Empfehlung generieren
            </>
          )}
        </button>

        {/* Error Display */}
        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          </div>
        )}

        {/* Results */}
        {templateAnalysis && (
          <div className="mt-4 space-y-4">
            {/* Main Recommendation */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-medium text-green-900">Empfohlenes Template</h4>
                </div>
                <div className="flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4 text-green-600" />
                  <span className={`text-sm font-medium ${getConfidenceColor(templateAnalysis.confidence)}`}>
                    {Math.round(templateAnalysis.confidence * 100)}% Match
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="font-medium text-green-900 mb-1">
                    {layoutTemplates.find(t => t.id === templateAnalysis.templateId)?.title || templateAnalysis.templateId}
                  </h5>
                  <p className="text-sm text-green-700">
                    {getConfidenceLabel(templateAnalysis.confidence)}
                  </p>
                </div>

                <div className="bg-white rounded p-3 border border-green-200">
                  <h6 className="text-sm font-medium text-gray-900 mb-1">Begründung:</h6>
                  <p className="text-sm text-gray-700">{templateAnalysis.reasoning}</p>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleSelectTemplate(templateAnalysis.templateId)}
                    className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
                  >
                    Template anwenden
                  </button>
                  
                  {templateAnalysis.alternatives.length > 0 && (
                    <button
                      onClick={() => setShowAlternatives(!showAlternatives)}
                      className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded hover:bg-green-50 transition-colors"
                    >
                      {showAlternatives ? 'Weniger' : 'Alternativen'}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Alternative Templates */}
            {showAlternatives && templateAnalysis.alternatives.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 flex items-center">
                  <Star className="w-4 h-4 mr-2" />
                  Alternative Templates
                </h4>
                
                {templateAnalysis.alternatives.map((alt, index) => (
                  <div key={index} className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-blue-900">
                        {layoutTemplates.find(t => t.id === alt.templateId)?.title || alt.templateId}
                      </h5>
                      <span className={`text-sm font-medium ${getConfidenceColor(alt.confidence)}`}>
                        {Math.round(alt.confidence * 100)}%
                      </span>
                    </div>
                    
                    <p className="text-sm text-blue-700 mb-3">{alt.reason}</p>
                    
                    <button
                      onClick={() => handleSelectTemplate(alt.templateId)}
                      className="w-full px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors"
                    >
                      Dieses Template verwenden
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateMatchingAssistant;