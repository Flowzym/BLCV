/**
 * Style Editor Component
 * Provides comprehensive styling controls for CV design
 */

import React, { useState } from 'react';
import { StyleConfig } from '@/types/cv-designer';

interface StyleEditorProps {
  config: StyleConfig;
  onChange: (config: StyleConfig) => void;
  sections?: string[];
  showPresets?: boolean;
  showLivePreview?: boolean;
  compact?: boolean;
}

export const StyleEditor: React.FC<StyleEditorProps> = ({
  config,
  onChange,
  sections = ['colors', 'typography', 'layout', 'spacing'],
  showPresets = true,
  compact = false
}) => {
  const [activeSection, setActiveSection] = useState(sections[0]);

  const handleConfigChange = (updates: Partial<StyleConfig>) => {
    const newConfig = { ...config, ...updates };
    onChange(newConfig);
  };

  const colorPresets = [
    { name: 'Professional Blue', primary: '#1e40af', accent: '#3b82f6' },
    { name: 'Corporate Gray', primary: '#374151', accent: '#6b7280' },
    { name: 'Modern Green', primary: '#059669', accent: '#10b981' },
    { name: 'Creative Purple', primary: '#7c3aed', accent: '#a855f7' },
    { name: 'Classic Black', primary: '#000000', accent: '#404040' }
  ];

  const fontFamilies = [
    'Inter',
    'Roboto',
    'Open Sans',
    'Lato',
    'Source Sans Pro',
    'Poppins',
    'Montserrat'
  ];

  const fontSizes = [
    { label: 'Klein', value: 'small' },
    { label: 'Normal', value: 'medium' },
    { label: 'Groß', value: 'large' }
  ];

  const renderColorsSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Farben</h3>
      
      {/* Color Presets */}
      {showPresets && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Farbvorlagen
          </label>
          <div className="grid grid-cols-1 gap-2">
            {colorPresets.map((preset, index) => (
              <button
                key={index}
                onClick={() => handleConfigChange({
                  primaryColor: preset.primary,
                  accentColor: preset.accent
                })}
                className="flex items-center space-x-3 p-2 border rounded-lg hover:bg-gray-50 text-left"
              >
                <div className="flex space-x-1">
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: preset.primary }}
                  />
                  <div 
                    className="w-4 h-4 rounded border"
                    style={{ backgroundColor: preset.accent }}
                  />
                </div>
                <span className="text-sm">{preset.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Custom Colors */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Primärfarbe
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.primaryColor}
              onChange={(e) => handleConfigChange({ primaryColor: e.target.value })}
              className="w-8 h-8 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.primaryColor}
              onChange={(e) => handleConfigChange({ primaryColor: e.target.value })}
              className="flex-1 px-2 py-1 text-xs font-mono border rounded"
              placeholder="#1e40af"
            />
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Akzentfarbe
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              value={config.accentColor}
              onChange={(e) => handleConfigChange({ accentColor: e.target.value })}
              className="w-8 h-8 border rounded cursor-pointer"
            />
            <input
              type="text"
              value={config.accentColor}
              onChange={(e) => handleConfigChange({ accentColor: e.target.value })}
              className="flex-1 px-2 py-1 text-xs font-mono border rounded"
              placeholder="#3b82f6"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderTypographySection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Typografie</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schriftart
        </label>
        <select
          value={config.fontFamily}
          onChange={(e) => handleConfigChange({ fontFamily: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          {fontFamilies.map(font => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Schriftgröße
        </label>
        <div className="grid grid-cols-3 gap-2">
          {fontSizes.map(size => (
            <button
              key={size.value}
              onClick={() => handleConfigChange({ fontSize: size.value as any })}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                config.fontSize === size.value
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {size.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Zeilenabstand: {config.lineHeight}
        </label>
        <input
          type="range"
          min="1.2"
          max="2.0"
          step="0.1"
          value={config.lineHeight}
          onChange={(e) => handleConfigChange({ lineHeight: parseFloat(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Eng (1.2)</span>
          <span>Normal (1.6)</span>
          <span>Weit (2.0)</span>
        </div>
      </div>
    </div>
  );

  const renderLayoutSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Layout</h3>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Seitenränder
        </label>
        <div className="grid grid-cols-3 gap-2">
          {['compact', 'normal', 'wide'].map(margin => (
            <button
              key={margin}
              onClick={() => handleConfigChange({ margin: margin as any })}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors capitalize ${
                config.margin === margin
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              {margin === 'compact' ? 'Kompakt' : margin === 'normal' ? 'Normal' : 'Weit'}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSpacingSection = () => (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-900">Abstände</h3>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 mb-3">
          Abstände werden automatisch basierend auf den Layout-Einstellungen berechnet.
        </p>
        
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Sektionsabstand:</span>
            <span className="font-medium">
              {config.margin === 'compact' ? '16px' : config.margin === 'normal' ? '24px' : '32px'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Elementabstand:</span>
            <span className="font-medium">
              {config.margin === 'compact' ? '8px' : config.margin === 'normal' ? '12px' : '16px'}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Zeilenabstand:</span>
            <span className="font-medium">{config.lineHeight}</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (compact) {
    return (
      <div className="space-y-4">
        {sections.includes('colors') && renderColorsSection()}
        {sections.includes('typography') && renderTypographySection()}
        {sections.includes('layout') && renderLayoutSection()}
        {sections.includes('spacing') && renderSpacingSection()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {sections.map(section => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeSection === section
                  ? 'text-blue-600 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 border-transparent'
              }`}
            >
              {section === 'colors' ? 'Farben' : 
               section === 'typography' ? 'Typografie' :
               section === 'layout' ? 'Layout' : 'Abstände'}
            </button>
          ))}
        </nav>
      </div>

      {/* Section Content */}
      <div>
        {activeSection === 'colors' && renderColorsSection()}
        {activeSection === 'typography' && renderTypographySection()}
        {activeSection === 'layout' && renderLayoutSection()}
        {activeSection === 'spacing' && renderSpacingSection()}
      </div>
    </div>
  );
};