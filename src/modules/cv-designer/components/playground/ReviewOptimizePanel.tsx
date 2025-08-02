/**
 * Review & Optimize Phase
 * Provides analytical feedback on CV quality and ATS compatibility
 */

import React, { useState } from 'react';
import { LayoutElement } from '../../types/section';
import { StyleConfig } from '../../types/styles';
import { 
  BarChart3, 
  Eye, 
  Target, 
  FileText,
  Brain,
  TrendingUp,
  CheckCircle,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';

// Mock CVData interface for playground
interface CVData {
  personalData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: string;
    profession?: string;
    summary?: string;
    profileImage?: string;
  };
  workExperience: Array<{
    id: string;
    position: string;
    company: string;
    location?: string;
    startDate: string;
    endDate: string;
    description: string;
  }>;
  education: Array<{
    id: string;
    degree: string;
    institution: string;
    location?: string;
    startDate: string;
    endDate: string;
    description?: string;
    grade?: string;
    fieldOfStudy?: string;
  }>;
  skills: Array<{
    id: string;
    name: string;
    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
    category?: string;
  }>;
  languages?: Array<{
    id: string;
    name: string;
    level: string;
  }>;
}

interface ReviewOptimizePanelProps {
  cvData: CVData | null;
  styleConfig: StyleConfig;
  layoutElements: LayoutElement[];
  setCVData?: (data: CVData) => void;
  setStyleConfig?: (config: StyleConfig) => void;
}

export const ReviewOptimizePanel: React.FC<ReviewOptimizePanelProps> = ({
  cvData,
  styleConfig,
  layoutElements,
  setCVData,
  setStyleConfig
}) => {
  const [activeView, setActiveView] = useState<'preview' | 'analysis'>('preview');
  const [analysisResults, setAnalysisResults] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Handle CV data updates from analysis
  const handleCVDataUpdate = (updates: Partial<CVData>) => {
    if (!cvData || !setCVData) return;
    setCVData({ ...cvData, ...updates });
  };

  // Handle design config updates from analysis
  const handleStyleConfigUpdate = (updates: Partial<StyleConfig>) => {
    if (!setStyleConfig) return;
    setStyleConfig({ ...styleConfig, ...updates });
  };

  // Handle template selection from analysis
  const handleTemplateSelect = (templateId: string) => {
    console.log('Template selected from analysis:', templateId);
  };

  // Run comprehensive analysis
  const runAnalysis = async () => {
    if (!cvData) return;
    
    setIsAnalyzing(true);
    try {
      // Simulate analysis process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock analysis results
      const results = {
        atsScore: Math.floor(Math.random() * 30) + 70, // 70-100
        clarityScore: Math.floor(Math.random() * 25) + 75, // 75-100
        completenessScore: Math.floor(Math.random() * 20) + 80, // 80-100
        sectionsAnalyzed: 3,
        layoutElementsAnalyzed: layoutElements.length,
        recommendations: [
          'Fügen Sie mehr quantifizierte Erfolge hinzu',
          'Verwenden Sie stärkere Action-Verben',
          'Optimieren Sie Keywords für Ihre Zielbranche'
        ]
      };
      
      setAnalysisResults(results);
    } catch (error) {
      console.error('Analysis failed:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Calculate overall score
  const getOverallScore = () => {
    if (!analysisResults) return 0;
    return Math.round(
      (analysisResults.atsScore + analysisResults.clarityScore + analysisResults.completenessScore) / 3
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-50 border-green-200';
    if (score >= 70) return 'bg-yellow-50 border-yellow-200';
    return 'bg-red-50 border-red-200';
  };

  if (!cvData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Prüfen & Optimieren</h2>
          <p className="text-gray-600">
            Erhalten Sie analytisches Feedback zur Qualität und ATS-Kompatibilität Ihres CVs.
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Kein CV geladen</p>
            <p className="text-sm">
              Gehen Sie zur "Start / CV laden"-Phase, um einen CV zu laden oder zu erstellen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Prüfen & Optimieren</h2>
        <p className="text-gray-600">
          Erhalten Sie analytisches Feedback zur Qualität und ATS-Kompatibilität Ihres CVs.
        </p>
      </div>

      {/* Current CV Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-medium text-blue-900">
                  Analyse: {cvData.personalData.firstName} {cvData.personalData.lastName}
                </h3>
                <p className="text-sm text-blue-700">
                  {cvData.personalData.profession || 'Keine Berufsbezeichnung'} • 
                  3 Sektionen • 
                  {layoutElements.length} Layout-Elemente
                </p>
              </div>
            </div>
            
            <button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Analysiere...
                </>
              ) : (
                <>
                  <Target className="w-4 h-4 mr-2" />
                  Analyse starten
                </>
              )}
            </button>
          </div>
      </div>

      {/* Analysis Results Summary */}
      {analysisResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className={`${getScoreBgColor(getOverallScore())} border rounded-lg p-4 text-center`}>
              <div className={`text-3xl font-bold ${getScoreColor(getOverallScore())} mb-2`}>
                {getOverallScore()}%
              </div>
              <div className="text-sm font-medium text-gray-700">Gesamt-Score</div>
          </div>
          
          <div className={`${getScoreBgColor(analysisResults.atsScore)} border rounded-lg p-4 text-center`}>
              <div className={`text-2xl font-bold ${getScoreColor(analysisResults.atsScore)} mb-2`}>
                {analysisResults.atsScore}%
              </div>
              <div className="text-sm font-medium text-gray-700">ATS-Score</div>
          </div>
          
          <div className={`${getScoreBgColor(analysisResults.clarityScore)} border rounded-lg p-4 text-center`}>
              <div className={`text-2xl font-bold ${getScoreColor(analysisResults.clarityScore)} mb-2`}>
                {analysisResults.clarityScore}%
              </div>
              <div className="text-sm font-medium text-gray-700">Klarheit</div>
          </div>
          
          <div className={`${getScoreBgColor(analysisResults.completenessScore)} border rounded-lg p-4 text-center`}>
              <div className={`text-2xl font-bold ${getScoreColor(analysisResults.completenessScore)} mb-2`}>
                {analysisResults.completenessScore}%
              </div>
              <div className="text-sm font-medium text-gray-700">Vollständigkeit</div>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysisResults && analysisResults.recommendations && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="p-6 border-b border-yellow-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2 text-yellow-900">
              <TrendingUp className="w-5 h-5" />
              <span>Verbesserungsvorschläge</span>
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-2">
              {analysisResults.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start space-x-2 text-yellow-800">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-center space-x-2">
        <button
          onClick={() => setActiveView('preview')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeView === 'preview' 
              ? 'bg-blue-600 text-white' 
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>Vorschau</span>
        </button>
        <button
          onClick={() => setActiveView('analysis')}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
            activeView === 'analysis' 
              ? 'bg-blue-600 text-white' 
              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>Detailanalyse</span>
        </button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - CV Preview */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>CV-Vorschau</span>
            </h3>
            <p className="text-sm text-gray-600">
              Live-Vorschau Ihres CVs mit aktuellen Design-Einstellungen
            </p>
          </div>
          <div className="p-6">
            <div className="max-h-96 overflow-y-auto border rounded-lg p-4">
              <div className="space-y-4" style={{ 
                fontFamily: styleConfig.font.family,
                fontSize: `${styleConfig.font.size}px`,
                color: styleConfig.font.color
              }}>
                <div>
                  <h1 style={{ color: styleConfig.colors.primary, fontSize: `${styleConfig.font.size + 6}px` }}>
                    {cvData.personalData.firstName} {cvData.personalData.lastName}
                  </h1>
                  <p style={{ color: styleConfig.colors.secondary }}>{cvData.personalData.profession}</p>
                </div>
                
                {cvData.personalData.summary && (
                  <div>
                    <h2 style={{ color: styleConfig.colors.primary }}>Profil</h2>
                    <p>{cvData.personalData.summary}</p>
                  </div>
                )}
                
                {cvData.workExperience.length > 0 && (
                  <div>
                    <h2 style={{ color: styleConfig.colors.primary }}>Berufserfahrung</h2>
                    {cvData.workExperience.map(exp => (
                      <div key={exp.id} className="mb-2">
                        <h3 className="font-medium">{exp.position}</h3>
                        <p className="text-sm opacity-75">{exp.company} • {exp.startDate} - {exp.endDate}</p>
                        <p className="text-sm">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            {/* Preview Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sektionen:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layout-Elemente:</span>
                <span className="font-medium">{layoutElements.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Schriftart:</span>
                <span className="font-medium">{styleConfig.font.family}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Primärfarbe:</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: styleConfig.colors.primary }}
                  />
                  <span className="font-mono text-xs">{styleConfig.colors.primary}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Analysis */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>Analyse & Optimierung</span>
            </h3>
            <p className="text-sm text-gray-600">
              KI-gestützte Analyse und Verbesserungsvorschläge
            </p>
          </div>
          <div className="p-6">
            {activeView === 'analysis' ? (
              <div className="max-h-96 overflow-y-auto">
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Detailanalyse</h4>
                  {analysisResults ? (
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h5 className="font-medium text-gray-900 mb-2">Analyse-Ergebnisse</h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span>ATS-Score:</span>
                            <span className={getScoreColor(analysisResults.atsScore)}>{analysisResults.atsScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Klarheit:</span>
                            <span className={getScoreColor(analysisResults.clarityScore)}>{analysisResults.clarityScore}%</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Vollständigkeit:</span>
                            <span className={getScoreColor(analysisResults.completenessScore)}>{analysisResults.completenessScore}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h5 className="font-medium text-yellow-900 mb-2">Empfehlungen</h5>
                        <ul className="space-y-1 text-sm text-yellow-800">
                          {analysisResults.recommendations.map((rec: string, index: number) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                      <p>Starten Sie eine Analyse für detaillierte Ergebnisse</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Quick Analysis Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Schnellanalyse</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Berufserfahrung:</span>
                      <span className="font-medium">{cvData.workExperience.length} Positionen</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ausbildung:</span>
                      <span className="font-medium">{cvData.education.length} Abschlüsse</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Fähigkeiten:</span>
                      <span className="font-medium">{cvData.skills.length} Skills</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profil-Text:</span>
                      <span className="font-medium">
                        {cvData.personalData.summary ? 'Vorhanden' : 'Fehlt'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Analysis Status */}
                {!analysisResults ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">
                      Starten Sie eine Analyse, um detailliertes Feedback zu erhalten
                    </p>
                    <button 
                      onClick={runAnalysis} 
                      disabled={isAnalyzing}
                      className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isAnalyzing ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Analysiere...
                        </>
                      ) : (
                        <>
                          <Target className="w-4 h-4 mr-2" />
                          Erste Analyse starten
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-2 text-green-800 mb-2">
                        <CheckCircle className="w-5 h-5" />
                        <span className="font-medium">Analyse abgeschlossen</span>
                      </div>
                      <p className="text-sm text-green-700">
                        {analysisResults.sectionsAnalyzed} Sektionen und {analysisResults.layoutElementsAnalyzed} Layout-Elemente analysiert.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => setActiveView('analysis')}
                      className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Detailanalyse anzeigen
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Analysis Actions */}
      {analysisResults && (
        <div className="flex justify-center space-x-4">
          <button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Erneut analysieren
          </button>
          
          <button
            onClick={() => setActiveView(activeView === 'preview' ? 'analysis' : 'preview')}
            className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            {activeView === 'preview' ? (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Zur Analyse
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                Zur Vorschau
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ReviewOptimizePanel;