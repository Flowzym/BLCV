/**
 * Review & Optimize Phase
 * Provides analytical feedback on CV quality and ATS compatibility
 */

import React, { useState, useEffect } from 'react';
import { CVData } from '@/types/cv-designer';
import { StyleConfig } from '@/types/cv-designer';
import { LayoutElement } from '@/modules/cv-designer/types/section';
import { CVPreview } from '../CVPreview';
import { AnalysisPanel } from '../AnalysisPanel';
import { useMapping } from '@/modules/cv-designer/hooks/useMapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  
  // Mapping hook to convert CV data to sections for preview
  const { mapCVData, lastMappingResult } = useMapping();
  const [mappedSections, setMappedSections] = useState<any[]>([]);

  // Map CV data when it changes
  useEffect(() => {
    if (cvData) {
      const result = mapCVData(cvData, {
        locale: 'de',
        layoutType: 'classic-one-column'
      });
      setMappedSections(result.sections);
    } else {
      setMappedSections([]);
    }
  }, [cvData, mapCVData]);

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
    // Template selection logic would be implemented here
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
        sectionsAnalyzed: mappedSections.length,
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
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
                  {mappedSections.length} Sektionen • 
                  {layoutElements.length} Layout-Elemente
                </p>
              </div>
            </div>
            
            <Button
              onClick={runAnalysis}
              disabled={isAnalyzing}
              className="bg-blue-600 hover:bg-blue-700"
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
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results Summary */}
      {analysisResults && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className={`${getScoreBgColor(getOverallScore())} border`}>
            <CardContent className="p-4 text-center">
              <div className={`text-3xl font-bold ${getScoreColor(getOverallScore())} mb-2`}>
                {getOverallScore()}%
              </div>
              <div className="text-sm font-medium text-gray-700">Gesamt-Score</div>
            </CardContent>
          </Card>
          
          <Card className={`${getScoreBgColor(analysisResults.atsScore)} border`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(analysisResults.atsScore)} mb-2`}>
                {analysisResults.atsScore}%
              </div>
              <div className="text-sm font-medium text-gray-700">ATS-Score</div>
            </CardContent>
          </Card>
          
          <Card className={`${getScoreBgColor(analysisResults.clarityScore)} border`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(analysisResults.clarityScore)} mb-2`}>
                {analysisResults.clarityScore}%
              </div>
              <div className="text-sm font-medium text-gray-700">Klarheit</div>
            </CardContent>
          </Card>
          
          <Card className={`${getScoreBgColor(analysisResults.completenessScore)} border`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(analysisResults.completenessScore)} mb-2`}>
                {analysisResults.completenessScore}%
              </div>
              <div className="text-sm font-medium text-gray-700">Vollständigkeit</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recommendations */}
      {analysisResults && analysisResults.recommendations && (
        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-yellow-900">
              <TrendingUp className="w-5 h-5" />
              <span>Verbesserungsvorschläge</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {analysisResults.recommendations.map((recommendation: string, index: number) => (
                <li key={index} className="flex items-start space-x-2 text-yellow-800">
                  <CheckCircle className="w-4 h-4 mt-0.5 text-yellow-600" />
                  <span className="text-sm">{recommendation}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* View Toggle */}
      <div className="flex items-center justify-center space-x-2">
        <Button
          variant={activeView === 'preview' ? 'default' : 'outline'}
          onClick={() => setActiveView('preview')}
          className="flex items-center space-x-2"
        >
          <Eye className="w-4 h-4" />
          <span>Vorschau</span>
        </Button>
        <Button
          variant={activeView === 'analysis' ? 'default' : 'outline'}
          onClick={() => setActiveView('analysis')}
          className="flex items-center space-x-2"
        >
          <Brain className="w-4 h-4" />
          <span>Detailanalyse</span>
        </Button>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - CV Preview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5 text-blue-600" />
              <span>CV-Vorschau</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Live-Vorschau Ihres CVs mit aktuellen Design-Einstellungen
            </p>
          </CardHeader>
          <CardContent>
            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <CVPreview
                sections={mappedSections}
                styleConfig={designConfig}
                cvData={cvData}
              />
            </div>
            
            {/* Preview Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Sektionen:</span>
                <span className="font-medium">{mappedSections.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Layout-Elemente:</span>
                <span className="font-medium">{layoutElements.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Schriftart:</span>
                <span className="font-medium">{designConfig.fontFamily}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Primärfarbe:</span>
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: designConfig.primaryColor }}
                  />
                  <span className="font-mono text-xs">{designConfig.primaryColor}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Side - Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Brain className="w-5 h-5 text-purple-600" />
              <span>Analyse & Optimierung</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              KI-gestützte Analyse und Verbesserungsvorschläge
            </p>
          </CardHeader>
          <CardContent>
            {activeView === 'analysis' ? (
              <div className="max-h-96 overflow-y-auto">
                <AnalysisPanel
                  styleConfig={styleConfig}
                  cvData={cvData}
                  styleConfig={styleConfig}
                  layoutElements={layoutElements}
                  onCVDataUpdate={handleCVDataUpdate}
                  onStyleConfigUpdate={handleStyleConfigUpdate}
                  onTemplateSelect={handleTemplateSelect}
                />
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
                  <span className="font-medium">{styleConfig.fontFamily}</span>
                      <span className="text-gray-600">Fähigkeiten:</span>
                      <span className="font-medium">{cvData.skills.length} Skills</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Profil-Text:</span>
                      <span className="font-medium">
                      style={{ backgroundColor: styleConfig.primaryColor }}
                      </span>
                    <span className="font-mono text-xs">{styleConfig.primaryColor}</span>
                  </div>
                </div>

                {/* Analysis Status */}
                {!analysisResults ? (
                  <div className="text-center py-8">
                    <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-gray-500 mb-4">
                      Starten Sie eine Analyse, um detailliertes Feedback zu erhalten
                    </p>
                    <Button onClick={runAnalysis} disabled={isAnalyzing}>
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
                    </Button>
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
                    
                    <Button
                      onClick={() => setActiveView('analysis')}
                      className="w-full"
                      variant="outline"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      Detailanalyse anzeigen
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Analysis Actions */}
      {analysisResults && (
        <div className="flex justify-center space-x-4">
          <Button
            onClick={runAnalysis}
            disabled={isAnalyzing}
            variant="outline"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isAnalyzing ? 'animate-spin' : ''}`} />
            Erneut analysieren
          </Button>
          
          <Button
            onClick={() => setActiveView(activeView === 'preview' ? 'analysis' : 'preview')}
            variant="outline"
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
          </Button>
        </div>
      )}
    </div>
  );
};

export default ReviewOptimizePanel;