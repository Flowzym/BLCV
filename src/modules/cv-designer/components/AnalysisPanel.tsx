/**
 * Analysis Panel Component
 * Combines all analysis features in a unified interface
 */

import React, { useState } from 'react';
import { CVData } from '@/types/cv-designer';
import { StyleConfig } from '@/types/cv-designer';
import { LayoutElement } from '@/modules/cv-designer/types/section';
import { SectionAnalysisBox } from '@/components/ai/SectionAnalysisBox';
import { LayoutAnalysisBox } from '@/components/ai/LayoutAnalysisBox';
import { ATSOptimizer } from '@/components/ai/ATSOptimizer';
import { TemplateMatchingAssistant } from '@/components/ai/TemplateMatchingAssistant';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  Target, 
  FileText, 
  Wand2,
  Brain,
  TrendingUp
} from 'lucide-react';

interface AnalysisPanelProps {
  cvData?: CVData;
  styleConfig?: StyleConfig;
  layoutElements: LayoutElement[];
  onCVDataUpdate?: (updates: Partial<CVData>) => void;
  onStyleConfigUpdate?: (updates: Partial<StyleConfig>) => void;
  onTemplateSelect?: (templateId: string) => void;
  className?: string;
}

type AnalysisTab = 'ats' | 'layout' | 'sections' | 'templates';

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  cvData,
  styleConfig,
  layoutElements,
  onCVDataUpdate,
  onStyleConfigUpdate,
  onTemplateSelect,
  className = ''
}) => {
  const [activeTab, setActiveTab] = useState<AnalysisTab>('ats');

  const analysisTabs = [
    {
      id: 'ats' as AnalysisTab,
      label: 'ATS Optimizer',
      icon: Target,
      description: 'Optimize for Applicant Tracking Systems'
    },
    {
      id: 'layout' as AnalysisTab,
      label: 'Layout Analysis',
      icon: BarChart3,
      description: 'Analyze layout structure and readability'
    },
    {
      id: 'sections' as AnalysisTab,
      label: 'Section Analysis',
      icon: FileText,
      description: 'Analyze individual CV sections'
    },
    {
      id: 'templates' as AnalysisTab,
      label: 'Template Matching',
      icon: Wand2,
      description: 'AI-powered template recommendations'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'ats':
        return cvData ? (
          <ATSOptimizer
            cvData={cvData}
            onContentUpdate={onCVDataUpdate || (() => {})}
            targetJob={cvData.personalData.profession}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a CV from Mock Data to run ATS analysis</p>
            </div>
          </div>
        );

      case 'layout':
        return (
          <LayoutAnalysisBox
            layout={layoutElements}
            autoStart={true}
            language="de"
          />
        );

      case 'sections':
        return layoutElements.length > 0 ? (
          <SectionAnalysisBox
            sections={layoutElements.filter(el => el.type !== 'group')}
            autoAnalyze={true}
            language="de"
            goals={["ATS", "Clarity", "Tone", "Keywords"]}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Add sections to the canvas to analyze them</p>
            </div>
          </div>
        );

      case 'templates':
        return cvData ? (
          <TemplateMatchingAssistant
            cvData={cvData}
            onTemplateSelect={onTemplateSelect || (() => {})}
          />
        ) : (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <Wand2 className="w-16 h-16 mx-auto mb-4 text-gray-300" />
              <p>Select a CV from Mock Data to get template recommendations</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`analysis-panel space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 flex items-center">
            <Brain className="w-6 h-6 mr-2 text-purple-600" />
            Analysis & Optimization
          </h2>
          <p className="text-gray-600 mt-1">
            Analyze and optimize your CV with AI-powered insights
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-600">
            {layoutElements.length} elements • {cvData ? 'CV loaded' : 'No CV'}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {analysisTabs.map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            {React.createElement(analysisTabs.find(t => t.id === activeTab)?.icon || Brain, { 
              className: "w-5 h-5" 
            })}
            <span>{analysisTabs.find(t => t.id === activeTab)?.label}</span>
          </CardTitle>
          <p className="text-sm text-gray-600">
            {analysisTabs.find(t => t.id === activeTab)?.description}
          </p>
        </CardHeader>
        <CardContent>
          {renderTabContent()}
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisPanel;