/**
 * CV Designer Playground - Phase 1: Core Structure & Navigation
 * Central testbed for all CV-Designer features with consistent user experience
 */

import React, { useState } from 'react';
import { CVData, DesignConfig } from '@/types/cv-designer';
import { LayoutElement } from '@/modules/cv-designer/types/section';
import { StyleConfigProvider, useStyleConfig } from '@/context/StyleConfigContext';

// Import playground-specific phase components
import {
  StartLoadCV,
  ContentEditor,
  DesignLayoutEditor,
  ReviewOptimizePanel,
  ExportPhase,
  MediaManagementPhase
} from '@/modules/cv-designer/components/playground';

import { Button } from '@/components/ui/button';
import { 
  Folder, 
  FileText, 
  Palette, 
  BarChart3, 
  Download, 
  Image as ImageIcon,
  Wand2,
  CheckCircle
} from 'lucide-react';

// Phase definitions for navigation
interface Phase {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const phases: Phase[] = [
  {
    id: 'start-load-cv',
    name: 'Start / CV laden',
    icon: Folder,
    description: 'Neuen CV erstellen oder bestehenden laden'
  },
  {
    id: 'edit-content',
    name: 'Inhalt bearbeiten',
    icon: FileText,
    description: 'Texte eingeben und mit KI optimieren'
  },
  {
    id: 'design-layout',
    name: 'Design & Layout',
    icon: Palette,
    description: 'Visuelles Design und Struktur gestalten'
  },
  {
    id: 'review-optimize',
    name: 'Prüfen & Optimieren',
    icon: BarChart3,
    description: 'ATS-Analyse und Qualitätsprüfung'
  },
  {
    id: 'export',
    name: 'Exportieren',
    icon: Download,
    description: 'CV in verschiedenen Formaten herunterladen'
  },
  {
    id: 'media-management',
    name: 'Medien verwalten',
    icon: ImageIcon,
    description: 'Profilbilder hochladen und bearbeiten'
  }
];

function CVPlaygroundContent() {
  // Central state management
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [currentPhase, setCurrentPhase] = useState<string>('start-load-cv');
  
  // Use StyleConfig from context
  const { styleConfig, updateStyleConfig } = useStyleConfig();
  
  // Debug log for styleConfig state
  console.log('CVPlayground styleConfig state:', styleConfig);

  // Render phase content based on current phase
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'start-load-cv':
        return (
          <StartLoadCV
            cvData={cvData}
            setCVData={setCVData}
            styleConfig={styleConfig}
            setStyleConfig={updateStyleConfig}
            layoutElements={layoutElements}
            setLayoutElements={setLayoutElements}
          />
        );
      
      case 'edit-content':
        return (
          <ContentEditor
            cvData={cvData}
            setCVData={setCVData}
          />
        );
      
      case 'design-layout':
        return (
          <DesignLayoutEditor
            cvData={cvData}
            styleConfig={styleConfig}
            setStyleConfig={updateStyleConfig}
            layoutElements={layoutElements}
            setLayoutElements={setLayoutElements}
            setCVData={setCVData}
          />
        );
      
      case 'review-optimize':
        return (
          <ReviewOptimizePanel
            cvData={cvData}
            styleConfig={styleConfig}
            layoutElements={layoutElements}
          />
        );
      
      case 'export':
        return (
          <ExportPhase
            cvData={cvData}
            styleConfig={styleConfig}
          />
        );
      
      case 'media-management':
        return (
          <MediaManagementPhase
            cvData={cvData}
            setCVData={setCVData}
          />
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Wand2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Unbekannte Phase: {currentPhase}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar Navigation */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900 flex items-center">
            <Wand2 className="w-6 h-6 mr-2 text-blue-600" />
            CV Designer
          </h1>
          <p className="text-sm text-gray-600 mt-1">Playground - Konsistente User Experience</p>
        </div>

        {/* Phase Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {phases.map((phase, index) => {
            const Icon = phase.icon;
            const isActive = currentPhase === phase.id;
            
            return (
              <Button
                key={phase.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-4 ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
                onClick={() => setCurrentPhase(phase.id)}
              >
                <div className="flex items-center space-x-3 w-full">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-opacity-20 bg-current">
                      <span className="text-sm font-bold">{index + 1}</span>
                    </div>
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <div className="text-left flex-1">
                      <div className="font-medium">{phase.name}</div>
                      <div className={`text-xs ${
                        isActive ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {phase.description}
                      </div>
                    </div>
                  </div>
                  {/* Progress indicator */}
                  {isActive && (
                    <CheckCircle className="w-4 h-4 text-blue-200" />
                  )}
                </div>
              </Button>
            );
          })}
        </nav>

        {/* Footer - Current State Info */}
        <div className="p-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div>CV geladen: {cvData ? 'Ja' : 'Nein'}</div>
            <div>Layout Elemente: {layoutElements.length}</div>
            <div>Aktuelle Phase: {phases.find(p => p.id === currentPhase)?.name}</div>
            <div>Profilbild: {cvData?.personalData.profileImage ? 'Ja' : 'Nein'}</div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {phases.find(p => p.id === currentPhase)?.name || 'CV Designer Playground'}
              </h2>
              <p className="text-sm text-gray-600">
                {phases.find(p => p.id === currentPhase)?.description || 'Konsistente User Experience für CV-Erstellung'}
              </p>
            </div>
            
            <div className="flex items-center space-x-3">
              {cvData && (
                <div className="text-sm text-gray-600">
                  CV: <span className="font-medium">
                    {cvData.personalData.firstName} {cvData.personalData.lastName}
                  </span>
                </div>
              )}
              
              <div className="text-sm text-gray-600">
                Phase {phases.findIndex(p => p.id === currentPhase) + 1} von {phases.length}
              </div>
            </div>
          </div>
        </div>

        {/* Phase Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderPhaseContent()}
        </div>
      </div>
    </div>
  );
}

export default function CVPlayground() {
  return (
    <StyleConfigProvider>
      <CVPlaygroundContent />
    </StyleConfigProvider>
  );
}