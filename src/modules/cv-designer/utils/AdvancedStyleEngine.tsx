// 📄 src/modules/cv-designer/components/AdvancedStyleEngine.tsx

import React, { useState, useCallback, useMemo } from 'react'
import { StyleConfig, ColorPreset } from '@/types/cv-designer'
import { Palette, Type, Layout, Space as Spacing, Eye, RotateCcw, Save, Star, Pipette } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AdvancedStyleEngineProps {
  config: StyleConfig
  onChange: (config: StyleConfig) => void
  showPreview?: boolean
  showPresets?: boolean
  compact?: boolean
  className?: string
}

interface StyleSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  component: React.ComponentType<StyleSectionProps>
}

interface StyleSectionProps {
  config: StyleConfig
  onChange: (updates: Partial<StyleConfig>) => void
  compact?: boolean
}

// Extended Color Presets with categories
const COLOR_PRESETS: (ColorPreset & { category: string })[] = [
  // Professional
  { name: 'Business Blue', primary: '#1e40af', accent: '#3b82f6', category: 'professional' },
  { name: 'Corporate Gray', primary: '#374151', accent: '#6b7280', category: 'professional' },
  { name: 'Forest Green', primary: '#059669', accent: '#10b981', category: 'professional' },
  { name: 'Navy Professional', primary: '#1e293b', accent: '#475569', category: 'professional' },
  
  // Creative
  { name: 'Royal Purple', primary: '#7c3aed', accent: '#a855f7', category: 'creative' },
  { name: 'Warm Orange', primary: '#ea580c', accent: '#f97316', category: 'creative' },
  { name: 'Crimson Bold', primary: '#dc2626', accent: '#ef4444', category: 'creative' },
  { name: 'Teal Creative', primary: '#0f766e', accent: '#14b8a6', category: 'creative' },
  
  // Minimal
  { name: 'Pure Black', primary: '#000000', accent: '#4b5563', category: 'minimal' },
  { name: 'Charcoal', primary: '#1f2937', accent: '#9ca3af', category: 'minimal' },
  { name: 'Slate', primary: '#334155', accent: '#64748b', category: 'minimal' }
]

// Advanced Typography Options
const FONT_FAMILIES = [
  { value: 'Inter', label: 'Inter', category: 'Sans-Serif', description: 'Modern, tech-orientiert' },
  { value: 'Roboto', label: 'Roboto', category: 'Sans-Serif', description: 'Neutral, universell' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Sans-Serif', description: 'Freundlich, zugänglich' },
  { value: 'Source Sans Pro', label: 'Source Sans Pro', category: 'Sans-Serif', description: 'Adobe, professionell' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Sans-Serif', description: 'Geometrisch, modern' },
  { value: 'Georgia', label: 'Georgia', category: 'Serif', description: 'Klassisch, elegant' },
  { value: 'Merriweather', label: 'Merriweather', category: 'Serif', description: 'Seriös, traditionell' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Display', description: 'Luxuriös, kreativ' },
  { value: 'Lora', label: 'Lora', category: 'Serif', description: 'Elegant, lesbar' }
]

// Sub-Components
const ColorPicker: React.FC<{
  label: string
  value: string
  onChange: (color: string) => void
  showPresets?: boolean
  compact?: boolean
}> = ({ label, value, onChange, showPresets = false, compact = false }) => {
  const [showPicker, setShowPicker] = useState(false)

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="flex items-center space-x-3">
        <div className="relative">
          <button
            onClick={() => setShowPicker(!showPicker)}
            className="w-12 h-10 rounded-lg border-2 border-gray-300 cursor-pointer transition-all hover:border-gray-400"
            style={{ backgroundColor: value }}
            title="Farbwähler öffnen"
          />
          {showPicker && (
            <div className="absolute top-12 left-0 z-10 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
              <input
                type="color"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-32 h-32 border-0 cursor-pointer"
              />
            </div>
          )}
        </div>
        
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
          placeholder="#1e40af"
        />
        
        {!compact && (
          <div 
            className="w-8 h-8 rounded border border-gray-300 flex-shrink-0"
            style={{ backgroundColor: value }}
            title="Vorschau"
          />
        )}
      </div>

      {showPresets && (
        <div className="grid grid-cols-3 gap-1 mt-2">
          {COLOR_PRESETS.slice(0, 6).map((preset, index) => (
            <button
              key={index}
              onClick={() => onChange(preset.primary)}
              className="w-8 h-6 rounded border border-gray-300 hover:scale-110 transition-transform"
              style={{ backgroundColor: preset.primary }}
              title={preset.name}
            />
          ))}
        </div>
      )}
    </div>
  )
}

const SliderControl: React.FC<{
  label: string
  value: number
  min: number
  max: number
  step: number
  onChange: (value: number) => void
  formatValue?: (value: number) => string
  showInput?: boolean
}> = ({ label, value, min, max, step, onChange, formatValue, showInput = true }) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {showInput && (
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          min={min}
          max={max}
          step={step}
        />
      )}
    </div>
    <div className="space-y-1">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
      />
      <div className="flex justify-between text-xs text-gray-500 px-1">
        <span>{formatValue ? formatValue(min) : min}</span>
        <span className="font-medium">{formatValue ? formatValue(value) : value}</span>
        <span>{formatValue ? formatValue(max) : max}</span>
      </div>
    </div>
  </div>
)

const ButtonGroup: React.FC<{
  label: string
  value: string
  options: Array<{ value: string; label: string; description?: string }>
  onChange: (value: string) => void
  compact?: boolean
}> = ({ label, value, options, onChange, compact }) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "p-3 text-center border-2 rounded-lg transition-all",
            value === option.value
              ? "border-blue-500 bg-blue-50 text-blue-700"
              : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <div className="font-medium">{option.label}</div>
          {!compact && option.description && (
            <div className="text-xs text-gray-500 mt-1">{option.description}</div>
          )}
        </button>
      ))}
    </div>
  </div>
)

// Style Sections
const ColorsSection: React.FC<StyleSectionProps> = ({ config, onChange, compact }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const filteredPresets = selectedCategory === 'all' 
    ? COLOR_PRESETS 
    : COLOR_PRESETS.filter(p => p.category === selectedCategory)

  const handlePresetSelect = (preset: ColorPreset) => {
    onChange({
      primaryColor: preset.primary,
      accentColor: preset.accent
    })
  }

  return (
    <div className="space-y-6">
      {/* Color Presets */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-medium text-gray-900">Farbpaletten</h4>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Alle</option>
            <option value="professional">Professionell</option>
            <option value="creative">Kreativ</option>
            <option value="minimal">Minimal</option>
          </select>
        </div>
        
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {filteredPresets.map((preset, index) => (
            <button
              key={index}
              onClick={() => handlePresetSelect(preset)}
              className={cn(
                "flex items-center space-x-2 p-2 rounded-lg border-2 transition-all hover:shadow-sm",
                config.primaryColor === preset.primary && config.accentColor === preset.accent
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              )}
            >
              <div className="flex space-x-1">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.primary }}
                />
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: preset.accent }}
                />
              </div>
              <span className="text-xs font-medium text-gray-700 truncate">
                {preset.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Individual Color Pickers */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ColorPicker
          label="Primärfarbe"
          value={config.primaryColor}
          onChange={(color) => onChange({ primaryColor: color })}
          showPresets={true}
          compact={compact}
        />
        <ColorPicker
          label="Akzentfarbe"
          value={config.accentColor}
          onChange={(color) => onChange({ accentColor: color })}
          showPresets={true}
          compact={compact}
        />
      </div>

      {/* Additional Colors */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <ColorPicker
          label="Hintergrundfarbe"
          value={config.backgroundColor || '#ffffff'}
          onChange={(color) => onChange({ backgroundColor: color })}
          compact={compact}
        />
        <ColorPicker
          label="Textfarbe"
          value={config.textColor || '#000000'}
          onChange={(color) => onChange({ textColor: color })}
          compact={compact}
        />
      </div>

      {/* Color Harmony Tools */}
      {!compact && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
            <Pipette className="w-4 h-4 mr-2" />
            Farbharmonie-Tools
          </h4>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => {
                // Generate complementary color
                const hsl = hexToHsl(config.primaryColor)
                const complementary = hslToHex((hsl.h + 180) % 360, hsl.s, hsl.l)
                onChange({ accentColor: complementary })
              }}
              className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Komplementär
            </button>
            <button
              onClick={() => {
                // Generate analogous color
                const hsl = hexToHsl(config.primaryColor)
                const analogous = hslToHex((hsl.h + 30) % 360, hsl.s, hsl.l)
                onChange({ accentColor: analogous })
              }}
              className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Analog
            </button>
            <button
              onClick={() => {
                // Generate triadic color
                const hsl = hexToHsl(config.primaryColor)
                const triadic = hslToHex((hsl.h + 120) % 360, hsl.s, hsl.l)
                onChange({ accentColor: triadic })
              }}
              className="px-3 py-2 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50"
            >
              Triadisch
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

const TypographySection: React.FC<StyleSectionProps> = ({ config, onChange, compact }) => {
  const [selectedFontCategory, setSelectedFontCategory] = useState<string>('all')
  
  const filteredFonts = selectedFontCategory === 'all' 
    ? FONT_FAMILIES 
    : FONT_FAMILIES.filter(f => f.category === selectedFontCategory)

  return (
    <div className="space-y-6">
      {/* Font Family */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700">Schriftart</label>
          <select
            value={selectedFontCategory}
            onChange={(e) => setSelectedFontCategory(e.target.value)}
            className="text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="all">Alle</option>
            <option value="Sans-Serif">Sans-Serif</option>
            <option value="Serif">Serif</option>
            <option value="Display">Display</option>
          </select>
        </div>
        
        <select
          value={config.fontFamily}
          onChange={(e) => onChange({ fontFamily: e.target.value as any })}
          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        >
          {filteredFonts.map((font) => (
            <option key={font.value} value={font.value}>
              {font.label} - {font.description}
            </option>
          ))}
        </select>
      </div>

      {/* Font Size */}
      <ButtonGroup
        label="Schriftgröße"
        value={config.fontSize}
        options={[
          { value: 'small', label: 'Klein', description: 'Kompakt, mehr Inhalt' },
          { value: 'medium', label: 'Normal', description: 'Ausgewogen, standard' },
          { value: 'large', label: 'Groß', description: 'Prominenter, weniger Inhalt' }
        ]}
        onChange={(fontSize) => onChange({ fontSize: fontSize as any })}
        compact={compact}
      />

      {/* Advanced Typography Controls */}
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
        <SliderControl
          label="Zeilenabstand"
          value={config.lineHeight}
          min={1.2}
          max={2.0}
          step={0.1}
          onChange={(lineHeight) => onChange({ lineHeight })}
          formatValue={(val) => val.toFixed(1)}
        />

        <SliderControl
          label="Zeichenabstand"
          value={parseFloat(config.letterSpacing?.replace('px', '') || '0')}
          min={-2}
          max={4}
          step={0.1}
          onChange={(value) => onChange({ letterSpacing: `${value}px` })}
          formatValue={(val) => `${val}px`}
        />
      </div>

      {/* Font Weight */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Schriftstärke</label>
        <div className="grid grid-cols-4 gap-2">
          {[
            { value: '300', label: 'Light' },
            { value: '400', label: 'Normal' },
            { value: '600', label: 'Semibold' },
            { value: '700', label: 'Bold' }
          ].map((weight) => (
            <button
              key={weight.value}
              onClick={() => onChange({ fontWeight: weight.value })}
              className={cn(
                "p-2 text-center border-2 rounded transition-all",
                config.fontWeight === weight.value
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-200 hover:border-gray-300"
              )}
              style={{ fontWeight: weight.value }}
            >
              {weight.label}
            </button>
          ))}
        </div>
      </div>

      {/* Typography Preview */}
      {!compact && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Schriftvorschau</h4>
          <div 
            style={{ 
              fontFamily: config.fontFamily,
              lineHeight: config.lineHeight,
              letterSpacing: config.letterSpacing,
              fontWeight: config.fontWeight
            }}
          >
            <div 
              className={`font-bold mb-2 ${
                config.fontSize === 'small' ? 'text-lg' :
                config.fontSize === 'medium' ? 'text-xl' : 'text-2xl'
              }`}
              style={{ color: config.primaryColor }}
            >
              Max Mustermann
            </div>
            <div 
              className={`font-medium mb-2 ${
                config.fontSize === 'small' ? 'text-base' :
                config.fontSize === 'medium' ? 'text-lg' : 'text-xl'
              }`}
              style={{ color: config.accentColor }}
            >
              Software Engineer
            </div>
            <div className={`text-gray-700 ${
              config.fontSize === 'small' ? 'text-sm' :
              config.fontSize === 'medium' ? 'text-base' : 'text-lg'
            }`}>
              Dies ist eine Beispiel-Vorschau der gewählten Typografie-Einstellungen.
              Hier können Sie sehen, wie sich Schriftart, -größe und Zeilenabstand
              auf die Lesbarkeit auswirken.
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const LayoutSection: React.FC<StyleSectionProps> = ({ config, onChange, compact }) => (
  <div className="space-y-6">
    {/* Margins */}
    <ButtonGroup
      label="Seitenränder"
      value={config.margin}
      options={[
        { value: 'narrow', label: 'Eng', description: 'Maximaler Inhalt' },
        { value: 'normal', label: 'Normal', description: 'Ausgewogen' },
        { value: 'wide', label: 'Breit', description: 'Luftiger, eleganter' }
      ]}
      onChange={(margin) => onChange({ margin: margin as any })}
      compact={compact}
    />

    {/* Border Radius */}
    <SliderControl
      label="Eckenrundung"
      value={parseInt(config.borderRadius?.replace('px', '') || '0')}
      min={0}
      max={32}
      step={1}
      onChange={(value) => onChange({ borderRadius: `${value}px` })}
      formatValue={(val) => `${val}px`}
    />

    {/* Border Width */}
    <SliderControl
      label="Rahmenbreite"
      value={parseInt(config.border?.split(' ')[0]?.replace('px', '') || '0')}
      min={0}
      max={8}
      step={1}
      onChange={(value) => onChange({ border: `${value}px solid #e5e7eb` })}
      formatValue={(val) => `${val}px`}
    />

    {/* Box Shadow */}
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">Schatten</label>
      <div className="grid grid-cols-2 gap-2">
        {[
          { value: 'none', label: 'Kein Schatten' },
          { value: '0 1px 3px rgba(0,0,0,0.1)', label: 'Leicht' },
          { value: '0 4px 6px rgba(0,0,0,0.1)', label: 'Normal' },
          { value: '0 10px 15px rgba(0,0,0,0.1)', label: 'Stark' }
        ].map((shadow) => (
          <button
            key={shadow.value}
            onClick={() => onChange({ boxShadow: shadow.value })}
            className={cn(
              "p-3 text-center border-2 rounded transition-all",
              config.boxShadow === shadow.value
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-gray-200 hover:border-gray-300"
            )}
            style={{ boxShadow: shadow.value !== 'none' ? shadow.value : undefined }}
          >
            {shadow.label}
          </button>
        ))}
      </div>
    </div>
  </div>
)

const SpacingSection: React.FC<StyleSectionProps> = ({ config, onChange }) => (
  <div className="space-y-6">
    {/* Section Spacing */}
    <SliderControl
      label="Abschnittsabstand"
      value={config.sectionSpacing || 24}
      min={8}
      max={64}
      step={4}
      onChange={(sectionSpacing) => onChange({ sectionSpacing })}
      formatValue={(val) => `${val}px`}
    />

    {/* Padding */}
    <SliderControl
      label="Innenabstand"
      value={parseInt(config.padding?.replace('px', '') || '8')}
      min={0}
      max={32}
      step={2}
      onChange={(value) => onChange({ padding: `${value}px` })}
      formatValue={(val) => `${val}px`}
    />

    {/* Width Percentage */}
    <SliderControl
      label="Inhaltsbreite"
      value={config.widthPercent || 100}
      min={60}
      max={100}
      step={5}
      onChange={(widthPercent) => onChange({ widthPercent })}
      formatValue={(val) => `${val}%`}
    />

    {/* Snap Size */}
    <SliderControl
      label="Raster-Größe"
      value={config.snapSize || 20}
      min={5}
      max={50}
      step={5}
      onChange={(snapSize) => onChange({ snapSize })}
      formatValue={(val) => `${val}px`}
    />
  </div>
)

// Main Component
export const AdvancedStyleEngine: React.FC<AdvancedStyleEngineProps> = ({
  config,
  onChange,
  showPreview = true,
  showPresets = true,
  compact = false,
  className
}) => {
  const [activeSection, setActiveSection] = useState<string>('colors')
  const [presets, setPresets] = useState<Array<{ id: string; name: string; config: StyleConfig }>>([])

  const sections: StyleSection[] = useMemo(() => [
    {
      id: 'colors',
      label: 'Farben',
      icon: Palette,
      component: ColorsSection
    },
    {
      id: 'typography',
      label: 'Typografie',
      icon: Type,
      component: TypographySection
    },
    {
      id: 'layout',
      label: 'Layout',
      icon: Layout,
      component: LayoutSection
    },
    {
      id: 'spacing',
      label: 'Abstände',
      icon: Spacing,
      component: SpacingSection
    }
  ], [])

  const handleReset = useCallback(() => {
    const defaultConfig: StyleConfig = {
      primaryColor: '#1e40af',
      accentColor: '#3b82f6',
      fontFamily: 'Inter',
      fontSize: 'medium',
      lineHeight: 1.5,
      margin: 'normal',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      borderRadius: '8px',
      sectionSpacing: 24,
      snapSize: 20,
      widthPercent: 100
    }
    onChange(defaultConfig)
  }, [onChange])

  const handleSavePreset = useCallback(() => {
    const name = prompt('Preset-Name eingeben:')
    if (!name) return

    const newPreset = {
      id: `preset-${Date.now()}`,
      name: name.trim(),
      config: { ...config }
    }

    setPresets(prev => [...prev, newPreset])
  }, [config])

  const handleLoadPreset = useCallback((preset: { config: StyleConfig }) => {
    onChange(preset.config)
  }, [onChange])

  const currentSection = sections.find(s => s.id === activeSection)
  const CurrentSectionComponent = currentSection?.component

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Erweiterte Style-Engine
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Professionelle Design-Kontrollen für perfekte Layouts
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={handleSavePreset}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Preset speichern</span>
            </button>
            
            <button
              onClick={handleReset}
              className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
      )}

      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0" aria-label="Style Sections">
          {sections.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                activeSection === id
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 border-transparent"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
          
          {showPresets && (
            <button
              onClick={() => setActiveSection('presets')}
              className={cn(
                "flex items-center space-x-2 px-4 py-3 text-sm font-medium transition-colors border-b-2",
                activeSection === 'presets'
                  ? "text-blue-600 border-blue-600"
                  : "text-gray-500 hover:text-gray-700 border-transparent"
              )}
            >
              <Star className="w-4 h-4" />
              <span>Presets</span>
            </button>
          )}
        </nav>
      </div>

      {/* Section Content */}
      <div className="min-h-64">
        {activeSection === 'presets' && showPresets ? (
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900">Gespeicherte Presets</h3>
            {presets.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Star className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Noch keine Presets gespeichert</p>
                <p className="text-sm">Speichere deine aktuellen Einstellungen als Preset</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleLoadPreset(preset)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{preset.name}</h4>
                      <div className="flex space-x-1">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.config.primaryColor }}
                        />
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: preset.config.accentColor }}
                        />
                      </div>
                    </div>
                    <div className="text-xs text-gray-600">
                      {preset.config.fontFamily} • {preset.config.fontSize} • {preset.config.margin}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : CurrentSectionComponent ? (
          <CurrentSectionComponent
            config={config}
            onChange={onChange}
            compact={compact}
          />
        ) : (
          <div className="text-center py-8 text-gray-500">
            Sektion nicht verfügbar
          </div>
        )}
      </div>

      {/* Live Preview */}
      {showPreview && !compact && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
            <Eye className="w-4 h-4 mr-2" />
            Live-Vorschau
          </h4>
          <div 
            className="space-y-4 p-4 rounded-lg"
            style={{
              backgroundColor: config.backgroundColor,
              color: config.textColor,
              fontFamily: config.fontFamily,
              lineHeight: config.lineHeight,
              letterSpacing: config.letterSpacing,
              fontWeight: config.fontWeight,
              padding: config.padding,
              border: config.border,
              borderRadius: config.borderRadius,
              boxShadow: config.boxShadow
            }}
          >
            <h1 
              className="text-2xl font-bold"
              style={{ color: config.primaryColor }}
            >
              Max Mustermann
            </h1>
            <h2 
              className="text-lg font-medium"
              style={{ color: config.accentColor }}
            >
              Software Engineer
            </h2>
            <p className="text-base">
              Dies ist eine Live-Vorschau Ihrer Style-Konfiguration. 
              Alle Änderungen werden sofort hier reflektiert.
            </p>
            <div className="flex space-x-4 text-sm">
              <span style={{ color: config.primaryColor }}>Primärfarbe</span>
              <span style={{ color: config.accentColor }}>Akzentfarbe</span>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Summary */}
      {!compact && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="text-sm font-medium text-blue-900 mb-2">Aktuelle Konfiguration</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
            <div className="flex justify-between">
              <span className="text-blue-700">Primärfarbe:</span>
              <span className="font-mono text-blue-900">{config.primaryColor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Akzentfarbe:</span>
              <span className="font-mono text-blue-900">{config.accentColor}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Schriftart:</span>
              <span className="font-mono text-blue-900">{config.fontFamily}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Schriftgröße:</span>
              <span className="font-mono text-blue-900">{config.fontSize}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Zeilenabstand:</span>
              <span className="font-mono text-blue-900">{config.lineHeight}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-blue-700">Ränder:</span>
              <span className="font-mono text-blue-900">{config.margin}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Helper functions for color harmony
function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255

  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  let h = 0, s = 0, l = (max + min) / 2

  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break
      case g: h = (b - r) / d + 2; break
      case b: h = (r - g) / d + 4; break
    }
    h /= 6
  }

  return { h: h * 360, s: s * 100, l: l * 100 }
}

function hslToHex(h: number, s: number, l: number): string {
  h /= 360
  s /= 100
  l /= 100

  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs((h * 6) % 2 - 1))
  const m = l - c / 2
  let r = 0, g = 0, b = 0

  if (0 <= h && h < 1/6) {
    r = c; g = x; b = 0
  } else if (1/6 <= h && h < 1/3) {
    r = x; g = c; b = 0
  } else if (1/3 <= h && h < 1/2) {
    r = 0; g = c; b = x
  } else if (1/2 <= h && h < 2/3) {
    r = 0; g = x; b = c
  } else if (2/3 <= h && h < 5/6) {
    r = x; g = 0; b = c
  } else if (5/6 <= h && h < 1) {
    r = c; g = 0; b = x
  }

  r = Math.round((r + m) * 255)
  g = Math.round((g + m) * 255)
  b = Math.round((b + m) * 255)

  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
}

export default AdvancedStyleEngine