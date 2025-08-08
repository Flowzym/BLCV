/**
 * AI-gestützter ATS-Optimizer
 * Analysiert CV auf ATS-Kompatibilität und gibt Verbesserungsvorschläge
 */

import React, { useState } from 'react';
import { CVData } from '@/types/cv-designer';
import { useAI, AIAnalysisResult } from '@/hooks/useAI';
import { Target, Loader, AlertCircle, TrendingUp, CheckCircle, XCircle, BarChart3, Swords as Keywords, FileText } from 'lucide-react';

interface ATSOptimizerProps {
  cvData: CVData;
  onContentUpdate: (updates: Partial<CVData>) => void;
  targetJob?: string;
  className?: string;
}

export const ATSOptimizer: React.FC<ATSOptimizerProps> = ({
  cvData,
  onContentUpdate,
  targetJob,
  className = ''
}) => {
  const { analyzeATS, atsAnalysis, isLoading, error } = useAI();
  const [customTargetJob, setCustomTargetJob] = useState(targetJob || '');
  const [showDetailedAnalysis, setShowDetailedAnalysis] = useState(false);

  const handleAnalyze = async () => {
    try {
      await analyzeATS(cvData, customTargetJob || undefined);
    } catch (err) {
      console.error('ATS-Analyse fehlgeschlagen:', err);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-600';
    if (score >= 60) return 'bg-yellow-600';
    return 'bg-red-600';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Ausgezeichnet';
    if (score >= 60) return 'Gut';
    if (score >= 40) return 'Verbesserungswürdig';
    return 'Kritisch';
  };

  const handleApplyImprovement = (improvement: any) => {
    // Implementation würde je nach Improvement-Type unterschiedlich sein
    console.log('Applying improvement:', improvement);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-1 flex items-center">
              <Target className="w-4 h-4 mr-2" />
              ATS-Optimizer
            </h3>
            <p className="text-sm text-gray-600">
              Optimiere deinen Lebenslauf für Applicant Tracking Systems
            </p>
          </div>
        </div>

        {/* Target Job Input */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Zielposition (optional)
          </label>
          <input
            type="text"
            value={customTargetJob}
            onChange={(e) => setCustomTargetJob(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="z.B. Senior Software Engineer, Marketing Manager..."
          />
        </div>

        <button
          onClick={handleAnalyze}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white font-medium rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Analysiere ATS-Kompatibilität...
            </>
          ) : (
            <>
              <Target className="w-4 h-4 mr-2" />
              ATS-Analyse starten
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
        {atsAnalysis && (
          <div className="mt-4 space-y-4">
            {/* Score Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">ATS-Score</span>
                  <Target className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getScoreColor(atsAnalysis.atsScore)}`}>
                    {atsAnalysis.atsScore}
                  </span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(atsAnalysis.atsScore)}`}
                    style={{ width: `${atsAnalysis.atsScore}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {getScoreLabel(atsAnalysis.atsScore)}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Klarheit</span>
                  <FileText className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getScoreColor(atsAnalysis.clarityScore)}`}>
                    {atsAnalysis.clarityScore}
                  </span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(atsAnalysis.clarityScore)}`}
                    style={{ width: `${atsAnalysis.clarityScore}%` }}
                  />
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Tonalität</span>
                  <BarChart3 className="w-4 h-4 text-gray-500" />
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-2xl font-bold ${getScoreColor(atsAnalysis.toneScore)}`}>
                    {atsAnalysis.toneScore}
                  </span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-500 ${getScoreBgColor(atsAnalysis.toneScore)}`}
                    style={{ width: `${atsAnalysis.toneScore}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Detailed Analysis Toggle */}
            <div className="flex justify-center">
              <button
                onClick={() => setShowDetailedAnalysis(!showDetailedAnalysis)}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {showDetailedAnalysis ? 'Weniger Details' : 'Detaillierte Analyse anzeigen'}
              </button>
            </div>

            {/* Detailed Analysis */}
            {showDetailedAnalysis && (
              <>
                {/* Keywords */}
                {Object.keys(atsAnalysis.keywordDensity).length > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                      <Keywords className="w-4 h-4 mr-2" />
                      Keyword-Analyse
                    </h4>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {Object.entries(atsAnalysis.keywordDensity)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 12)
                        .map(([keyword, count]) => (
                          <div key={keyword} className="bg-white rounded p-2 border border-blue-200">
                            <div className="text-sm font-medium text-gray-900">{keyword}</div>
                            <div className="text-xs text-gray-600">{count}x verwendet</div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                {/* General Suggestions */}
                {atsAnalysis.suggestions.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-900 mb-3 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2" />
                      Allgemeine Empfehlungen
                    </h4>
                    
                    <ul className="space-y-2">
                      {atsAnalysis.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start space-x-2">
                          <CheckCircle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-yellow-800">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Specific Improvements */}
                {atsAnalysis.improvements.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-2" />
                      Konkrete Verbesserungen ({atsAnalysis.improvements.length})
                    </h4>

                    {atsAnalysis.improvements.map((improvement, index) => (
                      <div 
                        key={index}
                        className={`border rounded-lg p-4 ${
                          improvement.priority === 'high' ? 'border-red-200 bg-red-50' :
                          improvement.priority === 'medium' ? 'border-yellow-200 bg-yellow-50' :
                          'border-blue-200 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {improvement.priority === 'high' ? (
                              <XCircle className="w-4 h-4 text-red-600" />
                            ) : improvement.priority === 'medium' ? (
                              <AlertCircle className="w-4 h-4 text-yellow-600" />
                            ) : (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                            <span className="text-sm font-medium capitalize">
                              {improvement.type} - {improvement.priority} Priorität
                            </span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-700 mb-3">
                          {improvement.suggestion}
                        </p>

                        {improvement.example && (
                          <div className="bg-white rounded border p-3 mb-3">
                            <h6 className="text-xs font-medium text-gray-700 mb-1">Beispiel:</h6>
                            <p className="text-sm text-gray-900 font-mono">
                              {improvement.example}
                            </p>
                          </div>
                        )}

                        <button
                          onClick={() => handleApplyImprovement(improvement)}
                          className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                            improvement.priority === 'high' 
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : improvement.priority === 'medium'
                              ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                              : 'bg-blue-600 text-white hover:bg-blue-700'
                          }`}
                        >
                          Verbesserung anwenden
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ATSOptimizer;