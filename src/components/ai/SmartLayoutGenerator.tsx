/**
 * AI-gestützter Smart-Layout-Generator
 * Generiert optimale Layout-Anordnungen basierend auf CV-Daten
 */

import React, { useState } from 'react';
import { CVData, LayoutElement } from '@/types/cv-designer';
import { useAI, SmartLayoutResult } from '@/hooks/useAI';
import { Layout, Loader, CheckCircle, AlertCircle, Wand2, Grid, Eye, Settings } from 'lucide-react';

interface SmartLayoutGeneratorProps {
  cvData: CVData;
  onLayoutGenerated: (layout: LayoutElement[]) => void;
  className?: string;
}

interface LayoutPreferences {
  layoutStyle: 'modern' | 'classic' | 'creative' | 'minimal';
  priority: 'readability' | 'visual-impact' | 'ats-optimization' | 'balance';
  pageCount: '1' | '2' | 'auto';
  emphasis: 'experience' | 'education' | 'skills' | 'balanced';
}

export const SmartLayoutGenerator: React.FC<SmartLayoutGeneratorProps> = ({
  cvData,
  onLayoutGenerated,
  className = ''
}) => {
  const { generateSmartLayout, smartLayout, isLoading, error } = useAI();
  const [preferences, setPreferences] = useState<LayoutPreferences>({
    layoutStyle: 'modern',
    priority: 'balance',
    pageCount: '1',
    emphasis: 'balanced'
  });
  const [showPreview, setShowPreview] = useState(false);

  const handleGenerate = async () => {
    try {
      await generateSmartLayout(cvData, preferences);
    } catch (err) {
      console.error('Smart-Layout-Generierung fehlgeschlagen:', err);
    }
  };

  const handleApplyLayout = () => {
    if (smartLayout?.layout) {
      onLayoutGenerated(smartLayout.layout);
    }
  };

  const updatePreference = <K extends keyof LayoutPreferences>(
    key: K, 
    value: LayoutPreferences[K]
  ) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-1 flex items-center">
              <Layout className="w-4 h-4 mr-2" />
              Smart Layout Generator
            </h3>
            <p className="text-sm text-gray-600">
              Lass die KI ein optimales Layout für deinen Lebenslauf erstellen
            </p>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Layout-Stil
              </label>
              <select
                value={preferences.layoutStyle}
                onChange={(e) => updatePreference('layoutStyle', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="modern">Modern & Clean</option>
                <option value="classic">Klassisch & Traditionell</option>
                <option value="creative">Kreativ & Auffällig</option>
                <option value="minimal">Minimal & Fokussiert</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priorität
              </label>
              <select
                value={preferences.priority}
                onChange={(e) => updatePreference('priority', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="readability">Lesbarkeit</option>
                <option value="visual-impact">Visuelle Wirkung</option>
                <option value="ats-optimization">ATS-Optimierung</option>
                <option value="balance">Ausgewogenheit</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seitenzahl
              </label>
              <select
                value={preferences.pageCount}
                onChange={(e) => updatePreference('pageCount', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="1">1 Seite (kompakt)</option>
                <option value="2">2 Seiten (ausführlich)</option>
                <option value="auto">Automatisch</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schwerpunkt
              </label>
              <select
                value={preferences.emphasis}
                onChange={(e) => updatePreference('emphasis', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="experience">Berufserfahrung</option>
                <option value="education">Ausbildung</option>
                <option value="skills">Fähigkeiten</option>
                <option value="balanced">Ausgewogen</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {isLoading ? (
            <>
              <Loader className="w-4 h-4 animate-spin mr-2" />
              Generiere Smart Layout...
            </>
          ) : (
            <>
              <Wand2 className="w-4 h-4 mr-2" />
              Smart Layout generieren
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
        {smartLayout && (
          <div className="mt-4 space-y-4">
            {/* Layout Info */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-green-900 flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Smart Layout generiert
                </h4>
                <div className="flex items-center space-x-2">
                  <Grid className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-700">
                    {smartLayout.layout.length} Elemente
                  </span>
                </div>
              </div>

              <div className="bg-white rounded border border-green-200 p-3 mb-3">
                <h5 className="text-sm font-medium text-gray-900 mb-1">Begründung:</h5>
                <p className="text-sm text-gray-700">{smartLayout.reasoning}</p>
              </div>

              {smartLayout.atsOptimized && (
                <div className="flex items-center space-x-2 text-sm text-green-700 mb-3">
                  <Target className="w-4 h-4" />
                  <span>ATS-optimiert</span>
                </div>
              )}

              <div className="flex space-x-2">
                <button
                  onClick={handleApplyLayout}
                  className="flex-1 px-4 py-2 bg-green-600 text-white font-medium rounded hover:bg-green-700 transition-colors"
                >
                  Layout anwenden
                </button>
                
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className="px-4 py-2 bg-white text-green-700 border border-green-300 rounded hover:bg-green-50 transition-colors"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Improvements List */}
            {smartLayout.improvements.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Layout-Verbesserungen
                </h4>
                
                <ul className="space-y-2">
                  {smartLayout.improvements.map((improvement, index) => (
                    <li key={index} className="flex items-start space-x-2">
                      <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm text-blue-800">{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Layout Preview */}
            {showPreview && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Layout-Vorschau
                </h4>
                
                <div className="bg-white border rounded-lg p-4 max-h-64 overflow-auto">
                  <div className="relative" style={{ width: '600px', height: '400px' }}>
                    {smartLayout.layout.map((element, index) => (
                      <div
                        key={element.id}
                        className="absolute border border-gray-300 bg-gray-100 rounded text-xs p-1 overflow-hidden"
                        style={{
                          left: `${(element.x / 600) * 100}%`,
                          top: `${(element.y / 400) * 100}%`,
                          width: `${(element.width / 600) * 100}%`,
                          height: `${((element.height || 100) / 400) * 100}%`
                        }}
                      >
                        <div className="font-medium truncate">
                          {element.title || element.type}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartLayoutGenerator;