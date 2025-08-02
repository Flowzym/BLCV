// 📄 src/modules/cv-designer/components/AdvancedLayoutCanvas.tsx

import React, { useState, useRef, useEffect, useCallback } from 'react'
import { Rnd } from 'react-rnd'
import { LayoutElement, LayoutGroup, Section } from '../types/section'
import { PositionedSection, CanvasSettings, DragState, ResizeState, SelectionState } from '../layout-canvas/types'
import { snap, snapPosition, snapSize, getSnapGuides, magneticSnap, isSnapEnabled } from '../layout-canvas/snapGrid'
import { DEFAULT_CANVAS_SETTINGS, ELEMENT_DEFAULTS, RESIZE_HANDLES, GRID_PATTERNS } from '../layout-canvas/config'
import { useLayoutManager } from '@/hooks/useLayoutManager'
import { cn } from '@/lib/utils'
import { Ruler, Grid, Move, RotateCcw, Maximize, Minimize } from 'lucide-react'

interface AdvancedLayoutCanvasProps {
  layout: LayoutElement[]
  onChange: (layout: LayoutElement[]) => void
  settings?: Partial<CanvasSettings>
  onSettingsChange?: (settings: CanvasSettings) => void
  showToolbar?: boolean
  showRulers?: boolean
  showGuides?: boolean
  className?: string
}

export const AdvancedLayoutCanvas: React.FC<AdvancedLayoutCanvasProps> = ({
  layout,
  onChange,
  settings: externalSettings,
  onSettingsChange,
  showToolbar = true,
  showRulers = true,
  showGuides = true,
  className
}) => {
  // Canvas Settings
  const [settings, setSettings] = useState<CanvasSettings>({
    ...DEFAULT_CANVAS_SETTINGS,
    ...externalSettings
  })

  // Layout Manager
  const layoutManager = useLayoutManager(layout, {
    gridSize: settings.snapSize,
    snapToGrid: settings.snapEnabled,
    canvasWidth: settings.canvasWidth,
    canvasHeight: settings.canvasHeight
  }, {
    onLayoutChange: onChange
  })

  // Canvas State
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedElementId: null,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 }
  })

  const [resizeState, setResizeState] = useState<ResizeState>({
    isResizing: false,
    resizedElementId: null,
    resizeHandle: null,
    startSize: { width: 0, height: 0 },
    startPosition: { x: 0, y: 0 }
  })

  const [selectionState, setSelectionState] = useState<SelectionState>({
    selectedElementIds: [],
    selectionBox: null
  })

  const [guides, setGuides] = useState<Array<{ type: 'vertical' | 'horizontal'; position: number }>>([])
  const [isFullscreen, setIsFullscreen] = useState(false)

  const canvasRef = useRef<HTMLDivElement>(null)

  // Update external settings when internal settings change
  useEffect(() => {
    onSettingsChange?.(settings)
  }, [settings, onSettingsChange])

  // Update layout manager config when settings change
  useEffect(() => {
    layoutManager.actions.setGridSize(settings.snapSize)
    layoutManager.actions.toggleSnapToGrid()
  }, [settings.snapSize, settings.snapEnabled])

  // Settings Handlers
  const updateSettings = useCallback((updates: Partial<CanvasSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }))
  }, [])

  const handleSnapSizeChange = useCallback((size: number) => {
    updateSettings({ snapSize: size })
  }, [updateSettings])

  const toggleGrid = useCallback(() => {
    updateSettings({ showGrid: !settings.showGrid })
  }, [settings.showGrid, updateSettings])

  const toggleSnap = useCallback(() => {
    updateSettings({ snapEnabled: !settings.snapEnabled })
  }, [settings.snapEnabled, updateSettings])

  // Element Handlers
  const handleElementDragStop = useCallback((id: string, data: { x: number; y: number }) => {
    const snappedPosition = snapPosition(data, settings.snapSize)
    layoutManager.actions.moveElement(id, snappedPosition.x, snappedPosition.y)
    setDragState({
      isDragging: false,
      draggedElementId: null,
      startPosition: { x: 0, y: 0 },
      currentPosition: { x: 0, y: 0 }
    })
    setGuides([])
  }, [layoutManager.actions, settings.snapSize])

  const handleElementResizeStop = useCallback((
    id: string,
    ref: HTMLElement,
    position: { x: number; y: number }
  ) => {
    const snappedSize = snapSize({
      width: ref.offsetWidth,
      height: ref.offsetHeight
    }, settings.snapSize)
    
    const snappedPosition = snapPosition(position, settings.snapSize)

    layoutManager.actions.updateElement(id, {
      x: snappedPosition.x,
      y: snappedPosition.y,
      width: snappedSize.width,
      height: snappedSize.height
    })

    setResizeState({
      isResizing: false,
      resizedElementId: null,
      resizeHandle: null,
      startSize: { width: 0, height: 0 },
      startPosition: { x: 0, y: 0 }
    })
  }, [layoutManager.actions, settings.snapSize])

  const handleElementDrag = useCallback((id: string, data: { x: number; y: number }) => {
    if (!showGuides) return

    const currentElement = layoutManager.layout.find(el => el.id === id)
    if (!currentElement) return

    const otherElements = layoutManager.layout.filter(el => el.id !== id)
    const elementWithNewPosition = {
      ...currentElement,
      x: data.x,
      y: data.y
    }

    const snapGuides = getSnapGuides(otherElements, elementWithNewPosition)
    setGuides(snapGuides)

    setDragState({
      isDragging: true,
      draggedElementId: id,
      startPosition: { x: currentElement.x, y: currentElement.y },
      currentPosition: data
    })
  }, [layoutManager.layout, showGuides])

  // Selection Handlers
  const handleElementSelect = useCallback((id: string, multiSelect: boolean = false) => {
    setSelectionState(prev => {
      if (multiSelect) {
        const isSelected = prev.selectedElementIds.includes(id)
        return {
          ...prev,
          selectedElementIds: isSelected
            ? prev.selectedElementIds.filter(selectedId => selectedId !== id)
            : [...prev.selectedElementIds, id]
        }
      } else {
        return {
          ...prev,
          selectedElementIds: [id]
        }
      }
    })
  }, [])

  const clearSelection = useCallback(() => {
    setSelectionState({
      selectedElementIds: [],
      selectionBox: null
    })
  }, [])

  // Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target !== document.body) return

      switch (e.key) {
        case 'Delete':
        case 'Backspace':
          selectionState.selectedElementIds.forEach(id => {
            layoutManager.actions.removeElement(id)
          })
          clearSelection()
          break
        case 'Escape':
          clearSelection()
          break
        case 'a':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            layoutManager.actions.selectAll()
          }
          break
        case 'd':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            selectionState.selectedElementIds.forEach(id => {
              layoutManager.actions.duplicateElement(id)
            })
          }
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [selectionState.selectedElementIds, layoutManager.actions, clearSelection])

  // Render Grid Background
  const renderGridBackground = () => {
    if (!settings.showGrid) return null

    const gridPattern = GRID_PATTERNS.dots
    return (
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: gridPattern,
          backgroundSize: `${settings.snapSize}px ${settings.snapSize}px`,
          opacity: 0.5
        }}
      />
    )
  }

  // Render Rulers
  const renderRulers = () => {
    if (!showRulers) return null

    return (
      <>
        {/* Horizontal Ruler */}
        <div className="absolute top-0 left-8 right-0 h-8 bg-gray-100 border-b border-gray-300 flex items-end">
          {Array.from({ length: Math.ceil(settings.canvasWidth / 50) }, (_, i) => (
            <div
              key={i}
              className="relative"
              style={{ width: '50px' }}
            >
              <div className="absolute bottom-0 left-0 w-px h-2 bg-gray-400" />
              <div className="absolute bottom-2 left-1 text-xs text-gray-600">
                {i * 50}
              </div>
            </div>
          ))}
        </div>

        {/* Vertical Ruler */}
        <div className="absolute top-8 left-0 bottom-0 w-8 bg-gray-100 border-r border-gray-300 flex flex-col justify-start">
          {Array.from({ length: Math.ceil(settings.canvasHeight / 50) }, (_, i) => (
            <div
              key={i}
              className="relative"
              style={{ height: '50px' }}
            >
              <div className="absolute top-0 right-0 h-px w-2 bg-gray-400" />
              <div className="absolute top-1 right-2 text-xs text-gray-600 transform -rotate-90 origin-center">
                {i * 50}
              </div>
            </div>
          ))}
        </div>
      </>
    )
  }

  // Render Snap Guides
  const renderSnapGuides = () => {
    if (!showGuides || guides.length === 0) return null

    return (
      <div className="absolute inset-0 pointer-events-none">
        {guides.map((guide, index) => (
          <div
            key={index}
            className={cn(
              "absolute bg-blue-500 opacity-75",
              guide.type === 'vertical' ? "w-px h-full" : "h-px w-full"
            )}
            style={{
              [guide.type === 'vertical' ? 'left' : 'top']: `${guide.position}px`
            }}
          />
        ))}
      </div>
    )
  }

  // Render Toolbar
  const renderToolbar = () => {
    if (!showToolbar) return null

    return (
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-4">
          {/* Grid Controls */}
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleGrid}
              className={cn(
                "p-2 rounded-md transition-colors",
                settings.showGrid
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              title="Raster anzeigen/ausblenden"
            >
              <Grid className="w-4 h-4" />
            </button>

            <button
              onClick={toggleSnap}
              className={cn(
                "p-2 rounded-md transition-colors",
                settings.snapEnabled
                  ? "bg-green-100 text-green-600"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              )}
              title="Snap-to-Grid aktivieren/deaktivieren"
            >
              <Move className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">
                Raster:
              </label>
              <input
                type="number"
                value={settings.snapSize}
                onChange={(e) => handleSnapSizeChange(Number(e.target.value))}
                className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                min={5}
                max={100}
                step={5}
              />
              <span className="text-sm text-gray-500">px</span>
            </div>
          </div>

          {/* Layout Actions */}
          <div className="flex items-center space-x-2 border-l pl-4">
            <button
              onClick={layoutManager.actions.autoArrange}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            >
              Auto-Anordnung
            </button>

            <button
              onClick={layoutManager.actions.snapAllToGrid}
              className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            >
              Alle ausrichten
            </button>

            <button
              onClick={layoutManager.actions.clearLayout}
              className="px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded hover:bg-red-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Zurücksetzen
            </button>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Canvas Info */}
          <div className="text-sm text-gray-600">
            Elemente: {layoutManager.stats.totalElements} |
            Gruppen: {layoutManager.stats.totalGroups} |
            Nutzung: {layoutManager.stats.canvasUsage}%
          </div>

          {/* Fullscreen Toggle */}
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
  }

  // Render Element
  const renderElement = (element: LayoutElement) => {
    const isSelected = selectionState.selectedElementIds.includes(element.id)
    const isGroup = element.type === 'group' && 'children' in element

    return (
      <Rnd
        key={element.id}
        size={{ width: element.width, height: element.height || ELEMENT_DEFAULTS.height }}
        position={{ x: element.x, y: element.y }}
        bounds="parent"
        dragGrid={settings.snapEnabled ? [settings.snapSize, settings.snapSize] : [1, 1]}
        resizeGrid={settings.snapEnabled ? [settings.snapSize, settings.snapSize] : [1, 1]}
        minWidth={ELEMENT_DEFAULTS.minWidth}
        minHeight={ELEMENT_DEFAULTS.minHeight}
        maxWidth={ELEMENT_DEFAULTS.maxWidth}
        maxHeight={ELEMENT_DEFAULTS.maxHeight}
        onDrag={(e, data) => handleElementDrag(element.id, data)}
        onDragStop={(e, data) => handleElementDragStop(element.id, data)}
        onResize={(e, direction, ref, delta, position) => {
          // Live resize feedback could go here
        }}
        onResizeStop={(e, direction, ref, delta, position) => {
          handleElementResizeStop(element.id, ref, position)
        }}
        className={cn(
          "group transition-all duration-200",
          isSelected && "ring-2 ring-blue-500 ring-opacity-50"
        )}
        enableResizing={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true
        }}
        resizeHandleStyles={{
          topRight: { cursor: 'ne-resize' },
          bottomRight: { cursor: 'se-resize' },
          bottomLeft: { cursor: 'sw-resize' },
          topLeft: { cursor: 'nw-resize' },
          top: { cursor: 'n-resize' },
          right: { cursor: 'e-resize' },
          bottom: { cursor: 's-resize' },
          left: { cursor: 'w-resize' }
        }}
      >
        <div
          className={cn(
            "h-full w-full border rounded-lg shadow-sm bg-white overflow-hidden",
            "hover:shadow-md transition-shadow duration-200",
            isSelected && "border-blue-500",
            isGroup && "border-dashed border-purple-400 bg-purple-50"
          )}
          onClick={(e) => {
            e.stopPropagation()
            handleElementSelect(element.id, e.ctrlKey || e.metaKey)
          }}
          style={{
            backgroundColor: element.props?.backgroundColor || 'white',
            borderColor: isSelected ? '#3b82f6' : (element.props?.borderColor || '#e5e7eb'),
            borderWidth: element.props?.borderWidth || '1px',
            borderRadius: element.props?.borderRadius || '8px'
          }}
        >
          {/* Element Header */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-700">
                {element.title || element.type}
              </span>
              {isGroup && (
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded">
                  Gruppe
                </span>
              )}
            </div>
            
            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  layoutManager.actions.duplicateElement(element.id)
                }}
                className="p-1 text-gray-400 hover:text-blue-600 rounded"
                title="Duplizieren"
              >
                📄
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  layoutManager.actions.removeElement(element.id)
                }}
                className="p-1 text-gray-400 hover:text-red-600 rounded"
                title="Löschen"
              >
                🗑️
              </button>
            </div>
          </div>

          {/* Element Content */}
          <div className="p-3 h-[calc(100%-48px)] overflow-auto">
            {isGroup ? (
              <div className="space-y-2">
                <div className="text-sm font-medium text-purple-700">
                  Gruppe: {(element as LayoutGroup).children.length} Elemente
                </div>
                <div className="space-y-1">
                  {(element as LayoutGroup).children.map((child, index) => (
                    <div key={child.id} className="text-xs text-gray-600 bg-white p-2 rounded border">
                      {child.title || child.type}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-800">
                  {element.title || element.type}
                </div>
                {element.content && (
                  <div className="text-xs text-gray-600 line-clamp-3">
                    {element.content}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Selection Indicator */}
          {isSelected && (
            <div className="absolute inset-0 border-2 border-blue-500 rounded-lg pointer-events-none" />
          )}
        </div>
      </Rnd>
    )
  }

  return (
    <div className={cn(
      "relative bg-white border rounded-lg overflow-hidden",
      isFullscreen && "fixed inset-0 z-50",
      className
    )}>
      {/* Toolbar */}
      {renderToolbar()}

      {/* Canvas Container */}
      <div className="relative overflow-auto" style={{ height: isFullscreen ? 'calc(100vh - 80px)' : '600px' }}>
        {/* Rulers */}
        {renderRulers()}

        {/* Main Canvas */}
        <div
          ref={canvasRef}
          className="relative"
          style={{
            width: settings.canvasWidth,
            height: settings.canvasHeight,
            backgroundColor: settings.backgroundColor,
            marginLeft: showRulers ? '32px' : '0',
            marginTop: showRulers ? '32px' : '0'
          }}
          onClick={clearSelection}
        >
          {/* Grid Background */}
          {renderGridBackground()}

          {/* Snap Guides */}
          {renderSnapGuides()}

          {/* Layout Elements */}
          {layoutManager.layout.map(renderElement)}

          {/* Selection Box */}
          {selectionState.selectionBox && (
            <div
              className="absolute border-2 border-blue-500 bg-blue-500 bg-opacity-10 pointer-events-none"
              style={{
                left: selectionState.selectionBox.x,
                top: selectionState.selectionBox.y,
                width: selectionState.selectionBox.width,
                height: selectionState.selectionBox.height
              }}
            />
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex items-center justify-between text-xs text-gray-600">
        <div className="flex items-center space-x-4">
          <span>Canvas: {settings.canvasWidth} × {settings.canvasHeight}</span>
          <span>Raster: {settings.snapSize}px</span>
          <span>Snap: {settings.snapEnabled ? 'Ein' : 'Aus'}</span>
        </div>
        
        <div className="flex items-center space-x-4">
          {selectionState.selectedElementIds.length > 0 && (
            <span>{selectionState.selectedElementIds.length} ausgewählt</span>
          )}
          <span>Zoom: 100%</span>
        </div>
      </div>
    </div>
  )
}

export default AdvancedLayoutCanvas