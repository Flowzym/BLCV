/**
 * Smart Layout Generator
 * AI-powered layout generation based on CV content analysis
 */

import React, { useState } from 'react';
import { CVData } from '@/types/cv-designer';
import { LayoutElement } from '@/modules/cv-designer/types/section';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  Grid, 
  Zap,
  RefreshCw,
  CheckCircle,
  Settings
} from 'lucide-react';

interface SmartLayoutGeneratorProps {
  cvData: CVData;
  onLayoutGenerated: (layout: LayoutElement[]) => void;
}

interface LayoutSuggestion {
  id: string;
  name: string;
  description: string;
  layout: LayoutElement[];
  reasoning: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

export const SmartLayoutGenerator: React.FC<SmartLayoutGeneratorProps> = ({
  cvData,
  onLayoutGenerated
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<LayoutSuggestion[]>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState<string | null>(null);

  // Generate layout suggestions based on CV content
  const generateLayouts = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      const mockSuggestions: LayoutSuggestion[] = [
        {
          id: 'professional-two-column',
          name: 'Professional Two-Column',
          description: 'Klassisches zweispaltiges Layout mit Sidebar',
          complexity: 'simple',
          reasoning: [
            'Optimal für Ihre Berufserfahrung',
            'Gute Lesbarkeit',
            'ATS-kompatibel'
          ],
          layout: [
            {
              id: 'header',
              type: 'header',
              content: 'Personal Data',
              position: { x: 0, y: 0, width: 100, height: 15 },
              style: { backgroundColor: '#f8f9fa' }
            },
            {
              id: 'sidebar',
              type: 'sidebar',
              content: 'Skills & Contact',
              position: { x: 0, y: 15, width: 30, height: 85 },
              style: { backgroundColor: '#e9ecef' }
            },
            {
              id: 'main',
              type: 'main',
              content: 'Experience & Education',
              position: { x: 30, y: 15, width: 70, height: 85 },
              style: { backgroundColor: '#ffffff' }
            }
          ]
        },
        {
          id: 'modern-single-column',
          name: 'Modern Single-Column',
          description: 'Modernes einspaltige Layout mit Akzenten',
          complexity: 'moderate',
          reasoning: [
            'Zeitgemäßes Design',
            'Mobile-freundlich',
            'Fokus auf Content'
          ],
          layout: [
            {
              id: 'hero',
              type: 'hero',
              content: 'Profile Header',
              position: { x: 0, y: 0, width: 100, height: 25 },
              style: { backgroundColor: '#3b82f6' }
            },
            {
              id: 'content',
              type: 'content',
              content: 'Main Content',
              position: { x: 0, y: 25, width: 100, height: 75 },
              style: { backgroundColor: '#ffffff' }
            }
          ]
        },
        {
          id: 'creative-asymmetric',
          name: 'Creative Asymmetric',
          description: 'Kreatives asymmetrisches Layout',
          complexity: 'complex',
          reasoning: [
            'Hebt Sie von anderen ab',
            'Kreative Darstellung',
            'Visuell ansprechend'
          ],
          layout: [
            {
              id: 'profile',
              type: 'profile',
              content: 'Profile Section',
              position: { x: 0, y: 0, width: 40, height: 40 },
              style: { backgroundColor: '#8b5cf6' }
            },
            {
              id: 'experience',
              type: 'experience',
              content: 'Experience',
              position: { x: 40, y: 0, width: 60, height: 60 },
              style: { backgroundColor: '#f3f4f6' }
            },
            {
              id: 'skills',
              type: 'skills',
              content: 'Skills & Education',
              position: { x: 0, y: 40, width: 100, height: 60 },
              style: { backgroundColor: '#ffffff' }
            }
          ]
        }
      ];

      setSuggestions(mockSuggestions);
      setIsGenerating(false);
    }, 2000);
  };

  const handleApplyLayout = (suggestion: LayoutSuggestion) => {
    setSelectedSuggestion(suggestion.id);
    onLayoutGenerated(suggestion.layout);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'moderate': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Grid className="w-5 h-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">KI-Layout-Generator</h3>
        </div>
        <Button 
          onClick={generateLayouts}
          disabled={isGenerating}
          className="flex items-center space-x-2"
        >
          {isGenerating ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Zap className="w-4 h-4" />
          )}
          <span>{isGenerating ? 'Generiere...' : 'Layouts generieren'}</span>
        </Button>
      </div>

      {/* CV Analysis Summary */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-blue-600" />
            <div>
              <p className="font-medium text-blue-900">CV-Analyse</p>
              <p className="text-sm text-blue-700">
                {cvData.workExperience.length} Positionen • {cvData.education.length} Ausbildungen • {cvData.skills.length} Skills
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isGenerating && (
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-purple-600">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Analysiere CV-Struktur...</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-600">
            <Grid className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Generiere Layout-Optionen...</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-600">
            <Settings className="w-4 h-4 animate-pulse" />
            <span className="text-sm">Optimiere für ATS-Kompatibilität...</span>
          </div>
        </div>
      )}

      {/* Layout Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-900">Empfohlene Layouts:</h4>
          
          {suggestions.map(suggestion => (
            <Card 
              key={suggestion.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                selectedSuggestion === suggestion.id 
                  ? 'ring-2 ring-purple-500 bg-purple-50' 
                  : 'hover:bg-gray-50'
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h5 className="font-semibold text-gray-900">{suggestion.name}</h5>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor(suggestion.complexity)}`}>
                        {suggestion.complexity}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>
                    
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-gray-700">KI-Begründung:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {suggestion.reasoning.map((reason, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-purple-500 rounded-full"></div>
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Elemente:</p>
                      <p className="text-sm font-medium">{suggestion.layout.length}</p>
                    </div>
                    
                    <Button
                      variant={selectedSuggestion === suggestion.id ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApplyLayout(suggestion);
                      }}
                    >
                      {selectedSuggestion === suggestion.id ? (
                        <>
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Angewendet
                        </>
                      ) : (
                        'Anwenden'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {suggestions.length === 0 && !isGenerating && (
        <Card className="border-dashed border-2 border-gray-300">
          <CardContent className="p-8 text-center">
            <Grid className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <h4 className="font-medium text-gray-900 mb-2">Keine Layouts generiert</h4>
            <p className="text-sm text-gray-600 mb-4">
              Klicken Sie auf "Layouts generieren", um KI-basierte Layout-Vorschläge zu erhalten.
            </p>
            <Button onClick={generateLayouts}>
              <Zap className="w-4 h-4 mr-2" />
              Jetzt generieren
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default SmartLayoutGenerator;