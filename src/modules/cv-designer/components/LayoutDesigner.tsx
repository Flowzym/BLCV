// 📄 src/modules/cv-designer/components/LayoutDesigner.tsx

import React, { useState, useCallback } from 'react'
import { LayoutElement } from '../types/section'
import { useLayoutManager } from '@/hooks/useLayoutManager'
import { AdvancedLayoutCanvas } from '@/components/layout/AdvancedLayoutCanvas'
import { MultiColumnLayout } from '@/components/layout/MultiColumnLayout'
import { AdvancedStyleEngine } from '@/modules/cv-designer/utils/AdvancedStyleEngine'
import { SortableSection } from '@/components/SortableSection'
import { CanvasSettings } from '../layout-canvas/types'
import { StyleConfig } from '@/types/cv-designer'
import { useStyleConfig } from '@/context/StyleConfigContext'
import { 
  Layout, 
  Columns, 
  Palette, 
  Grid, 
  Eye, 
  Settings, 
  Save, 
  Upload,
  Download,
  RotateCcw,
  Maximize,
  Minimize
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface LayoutDesignerProps {
  initialLayout?: LayoutElement[]
  onLayoutChange?: (layout: LayoutElement[]) => void
  onSave?: (layout: LayoutElement[], style: StyleConfig) => void
  onLoad?: () => Promise<LayoutElement[]>
  className?: string
}

type ViewMode = 'canvas' | 'columns' | 'sections' | 'preview'
type PanelMode = 'sidebar' | 'bottom' | 'floating' | 'hidden'

export const LayoutDesigner: React.FC<LayoutDesignerProps> = ({
  initialLayout = [],
  onLayoutChange,
  onSave,
  onLoad,
  className
}) => {
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('canvas')
  const [panelMode, setPanelMode] = useState<PanelMode>('sidebar')
  const [showStylePanel, setShowStylePanel] = useState(true)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  // Canvas Settings
  const [canvasSettings, setCanvasSettings] = useState<CanvasSettings>({
    snapSize: 20,
    showGrid: true,
    canvasWidth: 800,
    canvasHeight: 1200,
    backgroundColor: '#f8fafc',
    gridColor: '#e2e8f0',
    snapEnabled: true
  })

  // Hooks
  const { styleConfig, updateStyleConfig } = useStyleConfig()
  const layoutManager = useLayoutManager(
    initialLayout,
    {
      gridSize: canvasSettings.snapSize,
      snapToGrid: canvasSettings.snapEnabled,
      canvasWidth: canvasSettings.canvasWidth,
      canvasHeight: canvasSettings.canvasHeight
    },
    {
      onLayoutChange,
      onSaveLayout: onSave ? (layout) => onSave(layout, styleConfig) : undefined,
      onLoadLayout: onLoad
    }
  )

  // Handlers
  const handleCanvasSettingsChange = useCallback((newSettings: CanvasSettings) => {
    setCanvasSettings(newSettings)
  }, [])

  const handleSaveLayout = useCallback(() => {
    if (onSave) {
      onSave(layoutManager.layout, styleConfig)
    } else {
      // Fallback: Download as JSON
      const data = {
        layout: layoutManager.layout,
        style: styleConfig,
        settings: canvasSettings,
        metadata: {
          createdAt: new Date().toISOString(),
          version: '1.0.0'
        }
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cv-layout.json'
      a.click()
      URL.revokeObjectURL(url)
    }
  }, [layoutManager.layout, styleConfig, canvasSettings, onSave])

  const handleLoadLayout = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    try {
      const text = await file.text()
      const data = JSON.parse(text)
      
      if (data.layout && Array.isArray(data.layout)) {
        layoutManager.actions.clearLayout()
        data.layout.forEach((element: LayoutElement) => {
          layoutManager.actions.addElement(element)
        })
      }
      
      if (data.style) {
        updateStyleConfig(data.style)
      }
      
      if (data.settings) {
        setCanvasSettings(data.settings)
      }
    } catch (error) {
      console.error('Fehler beim Laden des Layouts:', error)
      alert('Fehler beim Laden der Datei. Bitte überprüfen Sie das Format.')
    }
  }, [layoutManager.actions, updateStyleConfig])

  // Convert layout to sections for column view
  const sections = layoutManager.sections
  const handleSectionsChange = useCallback((newSections: any[]) => {
    // Update layout with new section data
    const updatedLayout = layoutManager.layout.map(element => {
      const updatedSection = newSections.find(s => s.id === element.id)
      return updatedSection ? { ...element, ...updatedSection } : element
    })
    
    // Add new sections that don't exist in layout
    const newElements = newSections
      .filter(section => !layoutManager.layout.find(el => el.id === section.id))
      .map((section, index) => ({
        ...section,
        x: 40 + (index % 3) * 320,
        y: 40 + Math.floor(index / 3) * 140,
        width: 300,
        height: 120
      }))

    const finalLayout = [...updatedLayout, ...newElements]
    layoutManager.actions.clearLayout()
    finalLayout.forEach(element => layoutManager.actions.addElement(element))
  }, [layoutManager])

  // Render Toolbar
  const renderToolbar = () => (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
      <div className="flex items-center space-x-4">
        {/* View Mode Selector */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {[
            { mode: 'canvas', icon: Grid, label: 'Canvas' },
            { mode: 'columns', icon: Columns, label: 'Spalten' },
            { mode: 'sections', icon: Layout, label: 'Sektionen' },
            { mode: 'preview', icon: Eye, label: 'Vorschau' }
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode as ViewMode)}
              className={cn(
                "flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                viewMode === mode
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              )}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Panel Mode Selector */}
        <div className="flex items-center space-x-1">
          {[
            { mode: 'sidebar', icon: Layout, label: 'Sidebar' },
            { mode: 'bottom', icon: Minimize, label: 'Unten' },
            { mode: 'hidden', icon: Eye, label: 'Ausblenden' }
          ].map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              onClick={() => setPanelMode(mode as PanelMode)}
              className={cn(
                "p-2 rounded transition-colors",
                panelMode === mode
                  ? "bg-blue-100 text-blue-600"
                  : "text-gray-400 hover:text-gray-600"
              )}
              title={label}
            >
              <Icon className="w-4 h-4" />
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        {/* Layout Actions */}
        <button
          onClick={handleSaveLayout}
          className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
        >
          <Save className="w-4 h-4" />
          <span>Speichern</span>
        </button>

        <label className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors cursor-pointer">
          <Upload className="w-4 h-4" />
          <span>Laden</span>
          <input
            type="file"
            accept=".json"
            onChange={handleLoadLayout}
            className="hidden"
          />
        </label>

        <button
          onClick={() => setShowStylePanel(!showStylePanel)}
          className={cn(
            "p-2 rounded transition-colors",
            showStylePanel
              ? "bg-purple-100 text-purple-600"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
          title="Style-Panel anzeigen/ausblenden"
        >
          <Palette className="w-4 h-4" />
        </button>

        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded transition-colors"
          title={isFullscreen ? "Vollbild verlassen" : "Vollbild"}
        >
          {isFullscreen ? (
            <Minimize className="w-4 h-4" />
          ) : (
            <Maximize className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )

  // Render Main Content
  const renderMainContent = () => {
    switch (viewMode) {
      case 'canvas':
        return (
          <AdvancedLayoutCanvas
            layout={layoutManager.layout}
            onChange={(layout) => {
              layoutManager.actions.clearLayout()
              layout.forEach(element => layoutManager.actions.addElement(element))
            }}
            settings={canvasSettings}
            onSettingsChange={handleCanvasSettingsChange}
            showToolbar={false} // We have our own toolbar
            className="h-full"
          />
        )

      case 'columns':
        return (
          <div className="p-6 h-full overflow-auto">
            <MultiColumnLayout
              sections={sections}
              onSectionsChange={handleSectionsChange}
            />
          </div>
        )

      case 'sections':
        return (
          <div className="p-6 h-full overflow-auto">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  Sektionen verwalten
                </h2>
                <button
                  onClick={() => layoutManager.actions.addElement({
                    type: 'custom',
                    title: 'Neue Sektion',
                    content: '',
                    x: 40,
                    y: 40,
                    width: 300,
                    height: 120
                  })}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                >
                  Sektion hinzufügen
                </button>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sections.map(section => (
                  <SortableSection
                    key={section.id}
                    section={section}
                    onUpdate={(updatedSection) => {
                      layoutManager.actions.updateElement(section.id, updatedSection)
                    }}
                    onRemove={(id) => layoutManager.actions.removeElement(id)}
                    onDuplicate={(id) => layoutManager.actions.duplicateElement(id)}
                    showControls={true}
                  />
                ))}
              </div>
            </div>
          </div>
        )

      case 'preview':
        return (
          <div className="p-6 h-full overflow-auto bg-gray-100">
            <div className="max-w-4xl mx-auto">
              <div 
                className="bg-white shadow-lg rounded-lg p-8"
                style={{
                  fontFamily: styleConfig.fontFamily,
                  fontSize: styleConfig.fontSize,
                  lineHeight: styleConfig.lineHeight,
                  color: styleConfig.textColor,
                  backgroundColor: styleConfig.backgroundColor
                }}
              >
                <h1 className="text-2xl font-bold mb-6" style={{ color: styleConfig.primaryColor }}>
                  Layout-Vorschau
                </h1>
                
                <div className="space-y-6">
                  {sections.map(section => (
                    <div 
                      key={section.id}
                      className="p-4 border rounded-lg"
                      style={{
                        borderColor: styleConfig.accentColor,
                        borderRadius: styleConfig.borderRadius,
                        boxShadow: styleConfig.boxShadow
                      }}
                    >
                      <h3 
                        className="font-semibold mb-2"
                        style={{ color: styleConfig.primaryColor }}
                      >
                        {section.title || section.type}
                      </h3>
                      {section.content && (
                        <p className="text-gray-700 whitespace-pre-wrap">
                          {section.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Render Style Panel
  const renderStylePanel = () => {
    if (!showStylePanel) return null

    return (
      <div className={cn(
        "bg-white border-l border-gray-200 overflow-auto",
        panelMode === 'sidebar' && "w-80",
        panelMode === 'bottom' && "h-80 border-l-0 border-t",
        panelMode === 'floating' && "absolute top-4 right-4 w-80 rounded-lg shadow-lg z-10",
        panelMode === 'hidden' && "hidden"
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Palette className="w-5 h-5 mr-2" />
              Style-Engine
            </h3>
            <button
              onClick={() => setShowStylePanel(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>

          <AdvancedStyleEngine
            config={styleConfig}
            onChange={updateStyleConfig}
            showPreview={panelMode !== 'floating'}
            showPresets={true}
            compact={panelMode === 'floating'}
          />
        </div>
      </div>
    )
  }

  // Render Statistics
  const renderStatistics = () => (
    <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 text-xs text-gray-600">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>Elemente: {layoutManager.stats.totalElements}</span>
          <span>Gruppen: {layoutManager.stats.totalGroups}</span>
          <span>Sektionen: {layoutManager.stats.totalSections}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          <span>Canvas: {canvasSettings.canvasWidth} × {canvasSettings.canvasHeight}</span>
          <span>Raster: {canvasSettings.snapSize}px</span>
          <span>Nutzung: {layoutManager.stats.canvasUsage}%</span>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn(
      "flex flex-col h-full bg-gray-50",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Toolbar */}
      {renderToolbar()}

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content */}
        <div className={cn(
          "flex-1 flex flex-col",
          panelMode === 'bottom' && showStylePanel && "pb-80"
        )}>
          <div className="flex-1 relative">
            {renderMainContent()}
          </div>
          
          {panelMode === 'bottom' && renderStylePanel()}
        </div>

        {/* Sidebar Style Panel */}
        {panelMode === 'sidebar' && renderStylePanel()}
      </div>

      {/* Floating Style Panel */}
      {panelMode === 'floating' && renderStylePanel()}

      {/* Statistics Bar */}
      {renderStatistics()}
    </div>
  )
}

export default LayoutDesigner