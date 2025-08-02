import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, Palette, Eye, Brain, Sparkles, Layout, Type, Paintbrush, Layers } from 'lucide-react';

export default function DesignerPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('layout');

  // Designer tabs configuration
  const designerTabs = [
    { 
      id: 'layout', 
      label: 'Layout', 
      icon: Layout 
    },
    { 
      id: 'typography', 
      label: 'Typografie', 
      icon: Type 
    },
    { 
      id: 'colors', 
      label: 'Farben', 
      icon: Paintbrush 
    },
    { 
      id: 'elements', 
      label: 'Elemente', 
      icon: Layers 
    }
  ];

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="relative sticky top-0 z-20 bg-white shadow-md py-4">
        <h1 className="text-2xl font-bold text-center">Bewerbungsschreiben Generator</h1>
        <button
          onClick={() => navigate('/settings')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          title="Einstellungen öffnen"
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="flex-1">
        <div className="w-full flex flex-col gap-6 relative overflow-hidden p-6">
          {/* Header with tab navigation */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 p-4 border-b border-gray-200">
              <Palette className="h-6 w-6 mr-2" style={{ color: '#F29400' }} stroke="#F29400" fill="none" />
              <h2 className="text-lg font-semibold text-gray-900">Lebenslauf Designer</h2>
            </div>

            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-4">
                {designerTabs.map((tab) => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`py-3 px-1 border-b-2 font-medium text-sm ${
                        activeTab === tab.id
                          ? 'border-orange-500 text-orange-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        {tab.label}
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content grid with design tools, preview, and AI help */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_3fr_1fr] gap-6 relative overflow-hidden">
            {/* Left Column: Design Tools */}
            <div className="min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                  <Palette className="h-6 w-6" style={{ color: '#F29400' }} />
                  <h2 className="text-lg font-semibold text-gray-900">Design-Werkzeuge</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-2">Layout-Optionen</h3>
                    <p className="text-sm text-gray-600">
                      Hier werden Layout-Vorlagen, Spaltenaufteilungen und Strukturoptionen verfügbar sein.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-2">Typografie</h3>
                    <p className="text-sm text-gray-600">
                      Schriftarten, Größen, Abstände und Formatierungsoptionen.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-2">Farben & Stil</h3>
                    <p className="text-sm text-gray-600">
                      Farbschemata, Akzentfarben und visuelle Stiloptionen.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-gray-50">
                    <h3 className="font-medium text-gray-800 mb-2">Vorlagen</h3>
                    <p className="text-sm text-gray-600">
                      Vorgefertigte Design-Templates und Layouts.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Middle Column: Live Design Preview */}
            <div className="min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                  <Eye className="h-6 w-6" style={{ color: '#F29400' }} />
                  <h2 className="text-lg font-semibold text-gray-900">Live-Vorschau</h2>
                </div>
                
                <div className="h-full flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-64 h-80 mx-auto border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                      <div className="text-center">
                        <Eye className="h-12 w-12 mx-auto mb-3 text-gray-400" />
                        <h3 className="text-lg font-medium text-gray-700 mb-2">Design-Vorschau</h3>
                        <p className="text-sm text-gray-500">
                          Hier wird die Live-Vorschau des Lebenslauf-Designs angezeigt
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-medium text-gray-800">Geplante Features:</h4>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>• Echtzeit-Vorschau der Design-Änderungen</p>
                        <p>• Interaktive Bearbeitung von Elementen</p>
                        <p>• Zoom- und Skalierungsoptionen</p>
                        <p>• Export-Vorschau in verschiedenen Formaten</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: AI Assistant for Design */}
            <div className="min-w-0">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 h-full">
                <div className="flex items-center gap-2 mb-4 border-b border-gray-200 pb-3">
                  <Brain className="h-6 w-6" style={{ color: '#F29400' }} />
                  <h2 className="text-lg font-semibold text-gray-900">Design-KI</h2>
                  <Sparkles className="h-4 w-4 text-yellow-500" />
                </div>
                
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 bg-purple-50">
                    <h3 className="font-medium text-purple-800 mb-2">Layout-Optimierung</h3>
                    <p className="text-sm text-purple-600">
                      KI-gestützte Vorschläge für optimale Layout-Strukturen basierend auf Ihren Daten.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-blue-50">
                    <h3 className="font-medium text-blue-800 mb-2">Design-Analyse</h3>
                    <p className="text-sm text-blue-600">
                      Automatische Analyse und Verbesserungsvorschläge für Ihr Lebenslauf-Design.
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 bg-green-50">
                    <h3 className="font-medium text-green-800 mb-2">Branchenspezifische Anpassungen</h3>
                    <p className="text-sm text-green-600">
                      Design-Empfehlungen basierend auf Ihrer Zielbranche und Position.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Weitere geplante Funktionen:</h4>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">Farb-Harmonien</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">Typografie-Matching</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">Responsive Anpassungen</span>
                      </div>
                      <div className="flex items-center gap-2 p-2 bg-gray-50 rounded text-sm">
                        <span className="text-gray-700">ATS-Optimierung</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}