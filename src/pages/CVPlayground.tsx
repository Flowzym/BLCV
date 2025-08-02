/**
 * CV Designer Playground - Phase 5: Playground-Komponenten-Integration
 * Central testbed for all CV-Designer features with consistent user experience
 */

import React, { useState } from 'react';
import { CvProvider } from '../modules/cv-designer/context/CvContext';
import StartLoadCV from '../modules/cv-designer/components/playground/StartLoadCV';
import ContentEditor from '../modules/cv-designer/components/playground/ContentEditor';
import DesignLayoutEditor from '../modules/cv-designer/components/playground/DesignLayoutEditor';
import ReviewOptimizePanel from '../modules/cv-designer/components/playground/ReviewOptimizePanel';
import ExportPhase from '../modules/cv-designer/components/playground/ExportPhase';
import MediaManagementPhase from '../modules/cv-designer/components/playground/MediaManagementPhase';
import { LayoutElement } from '../modules/cv-designer/types/section';
import { StyleConfig } from '../modules/cv-designer/types/styles';
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

// Default style config for playground
const defaultStyleConfig: StyleConfig = {
  font: {
    family: 'Inter',
    size: 14,
    weight: 'normal',
    color: '#1f2937'
  },
  colors: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    background: '#ffffff',
    text: '#1f2937'
  },
  spacing: {
    margin: 16,
    padding: 12,
    lineHeight: 1.6
  },
  borderRadius: 8,
  borderColor: '#e5e7eb',
  borderWidth: 1
};

function CVPlaygroundContent() {
  // Central state management
  const [cvData, setCVData] = useState<CVData | null>(null);
  const [layoutElements, setLayoutElements] = useState<LayoutElement[]>([]);
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultStyleConfig);
  const [currentPhase, setCurrentPhase] = useState<string>('start-load-cv');

  // Render phase content based on current phase
  const renderPhaseContent = () => {
    switch (currentPhase) {
      case 'start-load-cv':
        return (
          <StartLoadCV
            cvData={cvData}
            setCVData={setCVData}
            styleConfig={styleConfig}
            setStyleConfig={setStyleConfig}
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
            setStyleConfig={setStyleConfig}
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
            setCVData={setCVData}
            setStyleConfig={setStyleConfig}
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
              <button
                key={phase.id}
                onClick={() => setCurrentPhase(phase.id)}
                className={`w-full justify-start h-auto p-4 rounded-lg transition-colors ${
                  isActive ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'
                }`}
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
              </button>
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
    <CvProvider>
      <CVPlaygroundContent />
    </CvProvider>
  );
}