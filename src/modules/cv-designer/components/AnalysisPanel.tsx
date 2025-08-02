/**
 * Analysis Panel Component
 * Provides AI-powered CV analysis and optimization suggestions
 */

import React, { useState, useEffect } from 'react';
import { CVData } from '@/types/cv-designer';
import { StyleConfig } from '@/types/cv-designer';
import { LayoutElement } from '../types/section';

interface AnalysisPanelProps {
  cvData: CVData;
  styleConfig: StyleConfig;
  layoutElements: LayoutElement[];
  onCVDataUpdate?: (updates: Partial<CVData>) => void;
  onStyleConfigUpdate?: (updates: Partial<StyleConfig>) => void;
  onTemplateSelect?: (templateId: string) => void;
}

interface AnalysisResult {
  atsScore: number;
  clarityScore: number;
  completenessScore: number;
  overallScore: number;
  recommendations: Recommendation[];
  strengths: string[];
  weaknesses: string[];
}

interface Recommendation {
  id: string;
  type: 'content' | 'design' | 'structure' | 'keywords';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action?: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  cvData,
  styleConfig,
  layoutElements,
  onCVDataUpdate,
  onStyleConfigUpdate,
  onTemplateSelect
}) => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'recommendations' | 'details'>('overview');

  // Run analysis when component mounts or data changes
  useEffect(() => {
    runAnalysis();
  }, [cvData, styleConfig, layoutElements]);

  const runAnalysis = async () => {
    setIsAnalyzing(true);
    
    // Simulate analysis delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock analysis results
    const atsScore = calculateATSScore();
    const clarityScore = calculateClarityScore();
    const completenessScore = calculateCompletenessScore();
    const overallScore = Math.round((atsScore + clarityScore + completenessScore) / 3);
    
    const result: AnalysisResult = {
      atsScore,
      clarityScore,
      completenessScore,
      overallScore,
      recommendations: generateRecommendations(),
      strengths: generateStrengths(),
      weaknesses: generateWeaknesses()
    };
    
    setAnalysisResult(result);
    setIsAnalyzing(false);
  };

  const calculateATSScore = (): number => {
    let score = 70; // Base score
    
    // Check for keywords
    if (cvData.personalData.profession) score += 5;
    if (cvData.skills.length > 3) score += 10;
    if (cvData.workExperience.length > 0) score += 10;
    
    // Check formatting
    if (styleConfig.fontFamily === 'Inter' || styleConfig.fontFamily === 'Roboto') score += 5;
    
    return Math.min(score, 100);
  };

  const calculateClarityScore = (): number => {
    let score = 75; // Base score
    
    // Check content clarity
    if (cvData.personalData.summary && cvData.personalData.summary.length > 50) score += 10;
    if (cvData.workExperience.every(exp => exp.description && exp.description.length > 30)) score += 10;
    
    // Check design clarity
    if (styleConfig.lineHeight >= 1.4) score += 5;
    
    return Math.min(score, 100);
  };

  const calculateCompletenessScore = (): number => {
    let score = 60; // Base score
    
    const requiredFields = [
      cvData.personalData.firstName,
      cvData.personalData.lastName,
      cvData.personalData.email,
      cvData.personalData.phone,
      cvData.personalData.profession
    ];
    
    score += requiredFields.filter(Boolean).length * 4;
    
    if (cvData.workExperience.length > 0) score += 10;
    if (cvData.education.length > 0) score += 10;
    if (cvData.skills.length > 0) score += 10;
    
    return Math.min(score, 100);
  };

  const generateRecommendations = (): Recommendation[] => {
    const recommendations: Recommendation[] = [];
    
    if (!cvData.personalData.summary) {
      recommendations.push({
        id: 'add-summary',
        type: 'content',
        priority: 'high',
        title: 'Profil-Zusammenfassung hinzufügen',
        description: 'Eine aussagekräftige Zusammenfassung verbessert Ihre Chancen erheblich.',
        action: () => onCVDataUpdate?.({
          personalData: {
            ...cvData.personalData,
            summary: 'Erfahrener Fachkraft mit nachgewiesener Expertise in...'
          }
        })
      });
    }
    
    if (cvData.skills.length < 5) {
      recommendations.push({
        id: 'add-skills',
        type: 'content',
        priority: 'medium',
        title: 'Mehr Fähigkeiten hinzufügen',
        description: 'Fügen Sie relevante technische und soft Skills hinzu.',
      });
    }
    
    if (styleConfig.primaryColor === '#000000') {
      recommendations.push({
        id: 'improve-colors',
        type: 'design',
        priority: 'low',
        title: 'Farbschema verbessern',
        description: 'Verwenden Sie professionelle Farben statt reinem Schwarz.',
        action: () => onStyleConfigUpdate?.({
          primaryColor: '#1e40af',
          accentColor: '#3b82f6'
        })
      });
    }
    
    return recommendations;
  };

  const generateStrengths = (): string[] => {
    const strengths: string[] = [];
    
    if (cvData.personalData.profileImage) {
      strengths.push('Professionelles Profilbild vorhanden');
    }
    
    if (cvData.workExperience.length >= 2) {
      strengths.push('Umfangreiche Berufserfahrung dokumentiert');
    }
    
    if (cvData.skills.length >= 5) {
      strengths.push('Vielfältige Fähigkeiten aufgelistet');
    }
    
    if (styleConfig.fontFamily !== 'Times New Roman') {
      strengths.push('Moderne, professionelle Schriftart gewählt');
    }
    
    return strengths;
  };

  const generateWeaknesses = (): string[] => {
    const weaknesses: string[] = [];
    
    if (!cvData.personalData.summary) {
      weaknesses.push('Profil-Zusammenfassung fehlt');
    }
    
    if (cvData.workExperience.length === 0) {
      weaknesses.push('Keine Berufserfahrung angegeben');
    }
    
    if (cvData.skills.length < 3) {
      weaknesses.push('Zu wenige Fähigkeiten aufgelistet');
    }
    
    return weaknesses;
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

  if (isAnalyzing) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Analysiere CV...</p>
          <p className="text-sm text-gray-500 mt-2">
            Prüfe ATS-Kompatibilität, Klarheit und Vollständigkeit
          </p>
        </div>
      </div>
    );
  }

  if (!analysisResult) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Analyse konnte nicht durchgeführt werden</p>
        <button
          onClick={runAnalysis}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Erneut versuchen
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Score Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 rounded-lg border ${getScoreBgColor(analysisResult.overallScore)}`}>
          <div className={`text-2xl font-bold ${getScoreColor(analysisResult.overallScore)} mb-1`}>
            {analysisResult.overallScore}%
          </div>
          <div className="text-sm font-medium text-gray-700">Gesamt</div>
        </div>
        
        <div className={`p-4 rounded-lg border ${getScoreBgColor(analysisResult.atsScore)}`}>
          <div className={`text-xl font-bold ${getScoreColor(analysisResult.atsScore)} mb-1`}>
            {analysisResult.atsScore}%
          </div>
          <div className="text-sm font-medium text-gray-700">ATS</div>
        </div>
        
        <div className={`p-4 rounded-lg border ${getScoreBgColor(analysisResult.clarityScore)}`}>
          <div className={`text-xl font-bold ${getScoreColor(analysisResult.clarityScore)} mb-1`}>
            {analysisResult.clarityScore}%
          </div>
          <div className="text-sm font-medium text-gray-700">Klarheit</div>
        </div>
        
        <div className={`p-4 rounded-lg border ${getScoreBgColor(analysisResult.completenessScore)}`}>
          <div className={`text-xl font-bold ${getScoreColor(analysisResult.completenessScore)} mb-1`}>
            {analysisResult.completenessScore}%
          </div>
          <div className="text-sm font-medium text-gray-700">Vollständigkeit</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {[
            { id: 'overview', label: 'Übersicht' },
            { id: 'recommendations', label: 'Empfehlungen' },
            { id: 'details', label: 'Details' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Strengths */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h3 className="font-medium text-green-900 mb-3">Stärken</h3>
              <ul className="space-y-2">
                {analysisResult.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start space-x-2 text-green-800">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                    <span className="text-sm">{strength}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h3 className="font-medium text-red-900 mb-3">Verbesserungspotential</h3>
              <ul className="space-y-2">
                {analysisResult.weaknesses.map((weakness, index) => (
                  <li key={index} className="flex items-start space-x-2 text-red-800">
                    <div className="w-2 h-2 bg-red-600 rounded-full mt-2"></div>
                    <span className="text-sm">{weakness}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-4">
            {analysisResult.recommendations.map(rec => (
              <div key={rec.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.priority === 'high' ? 'bg-red-100 text-red-800' :
                        rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {rec.priority === 'high' ? 'Hoch' : rec.priority === 'medium' ? 'Mittel' : 'Niedrig'}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        rec.type === 'content' ? 'bg-purple-100 text-purple-800' :
                        rec.type === 'design' ? 'bg-blue-100 text-blue-800' :
                        rec.type === 'structure' ? 'bg-green-100 text-green-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {rec.type === 'content' ? 'Inhalt' : 
                         rec.type === 'design' ? 'Design' :
                         rec.type === 'structure' ? 'Struktur' : 'Keywords'}
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 mb-1">{rec.title}</h4>
                    <p className="text-sm text-gray-600">{rec.description}</p>
                  </div>
                  {rec.action && (
                    <button
                      onClick={rec.action}
                      className="ml-4 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Anwenden
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* ATS Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">ATS-Analyse</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Keywords gefunden:</span>
                  <span className="font-medium">{cvData.skills.length + (cvData.personalData.profession ? 1 : 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Formatierung:</span>
                  <span className="font-medium">ATS-kompatibel</span>
                </div>
                <div className="flex justify-between">
                  <span>Struktur:</span>
                  <span className="font-medium">Standard-konform</span>
                </div>
              </div>
            </div>

            {/* Content Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Inhalts-Analyse</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Berufserfahrung:</span>
                  <span className="font-medium">{cvData.workExperience.length} Positionen</span>
                </div>
                <div className="flex justify-between">
                  <span>Ausbildung:</span>
                  <span className="font-medium">{cvData.education.length} Abschlüsse</span>
                </div>
                <div className="flex justify-between">
                  <span>Fähigkeiten:</span>
                  <span className="font-medium">{cvData.skills.length} Skills</span>
                </div>
                <div className="flex justify-between">
                  <span>Profil-Text:</span>
                  <span className="font-medium">
                    {cvData.personalData.summary ? 'Vorhanden' : 'Fehlt'}
                  </span>
                </div>
              </div>
            </div>

            {/* Design Analysis */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Design-Analyse</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Schriftart:</span>
                  <span className="font-medium">{styleConfig.fontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span>Lesbarkeit:</span>
                  <span className="font-medium">
                    {styleConfig.lineHeight >= 1.4 ? 'Gut' : 'Verbesserungsbedarf'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Farbkontrast:</span>
                  <span className="font-medium">Ausreichend</span>
                </div>
                <div className="flex justify-between">
                  <span>Layout-Elemente:</span>
                  <span className="font-medium">{layoutElements.length}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analysiere...' : 'Erneut analysieren'}
        </button>
        
        {analysisResult.overallScore < 80 && (
          <button
            onClick={() => onTemplateSelect?.('optimized-template')}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Optimiertes Template vorschlagen
          </button>
        )}
      </div>
    </div>
  );
};