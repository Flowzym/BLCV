/**
 * Template Matching Assistant
 * AI-powered template recommendations based on CV content
 */

import React, { useState, useEffect } from 'react';
import { CVData } from '@/types/cv-designer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Sparkles, 
  FileText, 
  Star, 
  Eye,
  Download,
  Wand2
} from 'lucide-react';

interface TemplateMatchingAssistantProps {
  cvData: CVData;
  onTemplateSelect: (templateId: string) => void;
}

interface TemplateRecommendation {
  id: string;
  name: string;
  description: string;
  matchScore: number;
  reasons: string[];
  preview: string;
  category: 'professional' | 'creative' | 'academic' | 'modern';
}

export const TemplateMatchingAssistant: React.FC<TemplateMatchingAssistantProps> = ({
  cvData,
  onTemplateSelect
}) => {
  const [recommendations, setRecommendations] = useState<TemplateRecommendation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  // Mock AI analysis to generate template recommendations
  useEffect(() => {
    if (!cvData) return;

    setIsAnalyzing(true);
    
    // Simulate AI analysis delay
    setTimeout(() => {
      const mockRecommendations: TemplateRecommendation[] = [
        {
          id: 'modern-professional',
          name: 'Modern Professional',
          description: 'Sauberes, modernes Design für Fachkräfte',
          matchScore: 95,
          reasons: [
            'Passt zu Ihrer Berufserfahrung',
            'Professionelle Darstellung',
            'ATS-freundlich'
          ],
          preview: 'Zweispaltig mit Sidebar',
          category: 'professional'
        },
        {
          id: 'creative-portfolio',
          name: 'Creative Portfolio',
          description: 'Kreatives Design für Designer und Künstler',
          matchScore: 78,
          reasons: [
            'Betont visuelle Elemente',
            'Platz für Portfolio-Links',
            'Auffälliges Design'
          ],
          preview: 'Asymmetrisches Layout',
          category: 'creative'
        },
        {
          id: 'academic-classic',
          name: 'Academic Classic',
          description: 'Traditionelles Format für Wissenschaft',
          matchScore: 65,
          reasons: [
            'Fokus auf Publikationen',
            'Konservatives Design',
            'Detaillierte Darstellung'
          ],
          preview: 'Einspaltig, ausführlich',
          category: 'academic'
        }
      ];

      setRecommendations(mockRecommendations);
      setIsAnalyzing(false);
    }, 1500);
  }, [cvData]);

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplate(templateId);
    onTemplateSelect(templateId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'professional': return 'bg-blue-100 text-blue-800';
      case 'creative': return 'bg-purple-100 text-purple-800';
      case 'academic': return 'bg-green-100 text-green-800';
      case 'modern': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (isAnalyzing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-blue-600">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span className="font-medium">KI analysiert Ihren CV...</span>
        </div>
        
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded-lg"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center space-x-2 mb-4">
        <Wand2 className="w-5 h-5 text-purple-600" />
        <h3 className="font-semibold text-gray-900">KI-Template-Empfehlungen</h3>
      </div>

      {/* Analysis Summary */}
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Sparkles className="w-6 h-6 text-purple-600" />
            <div>
              <p className="font-medium text-purple-900">
                {recommendations.length} Templates analysiert
              </p>
              <p className="text-sm text-purple-700">
                Basierend auf: {cvData.workExperience.length} Positionen, {cvData.education.length} Ausbildungen, {cvData.skills.length} Skills
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Recommendations */}
      <div className="space-y-3">
        {recommendations.map(template => (
          <Card 
            key={template.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id 
                ? 'ring-2 ring-blue-500 bg-blue-50' 
                : 'hover:bg-gray-50'
            }`}
            onClick={() => handleTemplateSelect(template.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h4 className="font-semibold text-gray-900">{template.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(template.category)}`}>
                      {template.category}
                    </span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{template.matchScore}%</span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                  
                  <div className="space-y-1">
                    <p className="text-xs font-medium text-gray-700">Warum dieser Template:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      {template.reasons.map((reason, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                          <span>{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col items-end space-y-2">
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Layout:</p>
                    <p className="text-sm font-medium">{template.preview}</p>
                  </div>
                  
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Preview logic
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={selectedTemplate === template.id ? "default" : "outline"}
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTemplateSelect(template.id);
                      }}
                    >
                      {selectedTemplate === template.id ? 'Ausgewählt' : 'Auswählen'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      {selectedTemplate && (
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Template ausgewählt</p>
                  <p className="text-sm text-green-700">
                    {recommendations.find(t => t.id === selectedTemplate)?.name}
                  </p>
                </div>
              </div>
              <Button onClick={() => onTemplateSelect(selectedTemplate)}>
                <Download className="w-4 h-4 mr-2" />
                Template anwenden
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateMatchingAssistant;