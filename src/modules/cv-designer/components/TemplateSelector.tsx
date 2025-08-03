/**
 * TemplateSelector Component
 * Displays a grid of predefined CV templates for quick selection
 */

import React, { useState } from 'react';
import { StyleConfig } from '../../../types/cv-designer';
import { LayoutElement } from '../types/section';
import { predefinedTemplates, getTemplateCategories } from '../config/template_registry';
import type { PredefinedTemplate } from '../config/template_registry';
import { Eye, Check, Filter } from 'lucide-react';

interface TemplateSelectorProps {
  onSelect: (style: StyleConfig, layout: LayoutElement[]) => void;
  selectedTemplateId?: string;
  showCategories?: boolean;
  compact?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  selectedTemplateId,
  showCategories = true,
  compact = false
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [hoveredTemplate, setHoveredTemplate] = useState<string | null>(null);

  // Filter templates by category
  const filteredTemplates = selectedCategory === 'all' 
    ? predefinedTemplates 
    : predefinedTemplates.filter(template => template.category === selectedCategory);

  const categories = getTemplateCategories();

  const handleTemplateSelect = (template: PredefinedTemplate) => {
    onSelect(template.styleConfig, template.layout);
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      classic: 'Klassisch',
      modern: 'Modern',
      minimal: 'Minimal',
      creative: 'Kreativ'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      {showCategories && (
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-gray-500" />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">Alle Kategorien</option>
            {categories.map(category => (
              <option key={category} value={category}>
                {getCategoryLabel(category)}
              </option>
            ))}
          </select>
          <span className="text-sm text-gray-500">
            {filteredTemplates.length} Template{filteredTemplates.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {/* Templates Grid */}
      <div className={`grid gap-4 ${compact ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className={`relative border-2 rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg ${
              selectedTemplateId === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => handleTemplateSelect(template)}
            onMouseEnter={() => setHoveredTemplate(template.id)}
            onMouseLeave={() => setHoveredTemplate(null)}
          >
            {/* Template Thumbnail */}
            <div 
              className="h-32 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center relative overflow-hidden"
              style={{
                background: `linear-gradient(135deg, ${template.styleConfig.backgroundColor} 0%, ${template.styleConfig.primaryColor}15 100%)`
              }}
            >
              {/* Mock Layout Preview */}
              <div className="w-full h-full p-2 relative">
                {template.layout.slice(0, 4).map((element, index) => (
                  <div
                    key={element.id}
                    className="absolute border rounded"
                    style={{
                      left: `${(element.x / 600) * 100}%`,
                      top: `${(element.y / 700) * 100}%`,
                      width: `${(element.width / 600) * 100}%`,
                      height: `${((element.height || 100) / 700) * 100}%`,
                      backgroundColor: index === 0 ? template.styleConfig.primaryColor : template.styleConfig.accentColor,
                      opacity: 0.7,
                      borderColor: template.styleConfig.primaryColor
                    }}
                  />
                ))}
              </div>

              {/* Selection Indicator */}
              {selectedTemplateId === template.id && (
                <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </div>
              )}

              {/* Hover Preview Button */}
              {hoveredTemplate === template.id && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <div className="flex items-center space-x-2 text-white">
                    <Eye className="w-4 h-4" />
                    <span className="text-sm font-medium">Auswählen</span>
                  </div>
                </div>
              )}
            </div>

            {/* Template Info */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <span 
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: `${template.styleConfig.primaryColor}20`,
                    color: template.styleConfig.primaryColor
                  }}
                >
                  {getCategoryLabel(template.category)}
                </span>
              </div>
              
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {template.description}
              </p>

              {/* Style Preview */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: template.styleConfig.primaryColor }}
                    title="Primärfarbe"
                  />
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: template.styleConfig.accentColor }}
                    title="Akzentfarbe"
                  />
                  <span className="text-xs text-gray-500 font-mono">
                    {template.styleConfig.fontFamily}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {template.layout.length} Elemente
                </div>
              </div>

              {/* Tags */}
              {!compact && template.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {template.tags.length > 3 && (
                    <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                      +{template.tags.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* No Templates Message */}
      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <Filter className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-lg font-medium mb-2">Keine Templates gefunden</p>
          <p className="text-sm">
            Versuchen Sie eine andere Kategorie oder wählen Sie "Alle Kategorien".
          </p>
        </div>
      )}

      {/* Template Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-medium text-blue-900 mb-2">💡 Template-Hinweise</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Klassisch:</strong> Traditionell, einspaltig, für konservative Branchen</li>
          <li>• <strong>Modern:</strong> Zweispaltig mit Sidebar, für Business & Tech</li>
          <li>• <strong>Minimal:</strong> Reduziert, fokussiert, für IT & Start-ups</li>
          <li>• <strong>Kreativ:</strong> Asymmetrisch, auffällig, für Designer & Kreative</li>
        </ul>
      </div>
    </div>
  );
};

export default TemplateSelector;