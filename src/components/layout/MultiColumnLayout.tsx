// 📄 src/modules/cv-designer/components/MultiColumnLayout.tsx

import React, { useState, useCallback } from 'react'
import { DndContext, DragEndEvent, DragOverEvent, DragStartEvent, closestCenter, pointerWithin } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { Section } from '../types/section'
import { SortableSection } from '../SortableSection'
import { cn } from '@/lib/utils'
import { Plus, Columns, Grid3X3, LayoutGrid, Settings } from 'lucide-react'

interface Column {
  id: string
  title: string
  sections: Section[]
  width: number // Percentage of total width
  minWidth?: number
  maxWidth?: number
  backgroundColor?: string
  padding?: string
}

interface MultiColumnLayoutProps {
  sections: Section[]
  onSectionsChange: (sections: Section[]) => void
  initialColumns?: Column[]
  onColumnsChange?: (columns: Column[]) => void
  className?: string
}

const DEFAULT_COLUMNS: Column[] = [
  {
    id: 'left',
    title: 'Linke Spalte',
    sections: [],
    width: 35,
    minWidth: 20,
    maxWidth: 60,
    backgroundColor: '#f8fafc',
    padding: '1rem'
  },
  {
    id: 'right',
    title: 'Rechte Spalte',
    sections: [],
    width: 65,
    minWidth: 40,
    maxWidth: 80,
    backgroundColor: '#ffffff',
    padding: '1rem'
  }
]

export const MultiColumnLayout: React.FC<MultiColumnLayoutProps> = ({
  sections,
  onSectionsChange,
  initialColumns = DEFAULT_COLUMNS,
  onColumnsChange,
  className
}) => {
  const [columns, setColumns] = useState<Column[]>(initialColumns)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [draggedSection, setDraggedSection] = useState<Section | null>(null)
  const [showSettings, setShowSettings] = useState(false)

  // Get unassigned sections (not in any column)
  const assignedSectionIds = columns.flatMap(col => col.sections.map(s => s.id))
  const unassignedSections = sections.filter(s => !assignedSectionIds.includes(s.id))

  // Update parent when columns change
  const updateColumns = useCallback((newColumns: Column[]) => {
    setColumns(newColumns)
    onColumnsChange?.(newColumns)
    
    // Update sections with column assignments
    const allSections = newColumns.flatMap(col => 
      col.sections.map(section => ({
        ...section,
        props: {
          ...section.props,
          columnId: col.id,
          columnTitle: col.title
        }
      }))
    )
    onSectionsChange([...allSections, ...unassignedSections])
  }, [onColumnsChange, onSectionsChange, unassignedSections])

  // Column Management
  const addColumn = useCallback(() => {
    const newColumn: Column = {
      id: `column-${Date.now()}`,
      title: `Spalte ${columns.length + 1}`,
      sections: [],
      width: Math.floor(100 / (columns.length + 1)),
      minWidth: 15,
      maxWidth: 70,
      backgroundColor: '#ffffff',
      padding: '1rem'
    }

    // Redistribute widths
    const totalWidth = 100
    const newColumnCount = columns.length + 1
    const redistributedColumns = columns.map(col => ({
      ...col,
      width: Math.floor(totalWidth / newColumnCount)
    }))

    updateColumns([...redistributedColumns, newColumn])
  }, [columns, updateColumns])

  const removeColumn = useCallback((columnId: string) => {
    const columnToRemove = columns.find(col => col.id === columnId)
    if (!columnToRemove) return

    // Move sections from removed column to unassigned
    const updatedSections = [...unassignedSections, ...columnToRemove.sections]
    const remainingColumns = columns.filter(col => col.id !== columnId)

    // Redistribute widths
    const totalWidth = 100
    const redistributedColumns = remainingColumns.map(col => ({
      ...col,
      width: Math.floor(totalWidth / remainingColumns.length)
    }))

    updateColumns(redistributedColumns)
    onSectionsChange(updatedSections)
  }, [columns, unassignedSections, updateColumns, onSectionsChange])

  const updateColumnWidth = useCallback((columnId: string, newWidth: number) => {
    const updatedColumns = columns.map(col => 
      col.id === columnId ? { ...col, width: Math.max(col.minWidth || 15, Math.min(col.maxWidth || 85, newWidth)) } : col
    )
    updateColumns(updatedColumns)
  }, [columns, updateColumns])

  const updateColumnSettings = useCallback((columnId: string, settings: Partial<Column>) => {
    const updatedColumns = columns.map(col => 
      col.id === columnId ? { ...col, ...settings } : col
    )
    updateColumns(updatedColumns)
  }, [columns, updateColumns])

  // Drag and Drop Handlers
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id as string)
    
    // Find the dragged section
    const section = sections.find(s => s.id === active.id) ||
                   columns.flatMap(col => col.sections).find(s => s.id === active.id)
    setDraggedSection(section || null)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Find source and target columns
    const sourceColumn = columns.find(col => col.sections.some(s => s.id === activeId))
    const targetColumn = columns.find(col => col.id === overId || col.sections.some(s => s.id === overId))

    if (!targetColumn) return

    // If moving between columns
    if (sourceColumn && sourceColumn.id !== targetColumn.id) {
      const sourceSection = sourceColumn.sections.find(s => s.id === activeId)
      if (!sourceSection) return

      const updatedColumns = columns.map(col => {
        if (col.id === sourceColumn.id) {
          return {
            ...col,
            sections: col.sections.filter(s => s.id !== activeId)
          }
        }
        if (col.id === targetColumn.id) {
          return {
            ...col,
            sections: [...col.sections, sourceSection]
          }
        }
        return col
      })

      updateColumns(updatedColumns)
    }
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)
    setDraggedSection(null)

    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Handle reordering within the same column
    const sourceColumn = columns.find(col => col.sections.some(s => s.id === activeId))
    if (sourceColumn) {
      const oldIndex = sourceColumn.sections.findIndex(s => s.id === activeId)
      const newIndex = sourceColumn.sections.findIndex(s => s.id === overId)

      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        const updatedColumns = columns.map(col => {
          if (col.id === sourceColumn.id) {
            return {
              ...col,
              sections: arrayMove(col.sections, oldIndex, newIndex)
            }
          }
          return col
        })
        updateColumns(updatedColumns)
      }
    }
  }

  // Preset Layouts
  const applyPresetLayout = useCallback((preset: 'two-column' | 'three-column' | 'sidebar-main' | 'header-two-column') => {
    let newColumns: Column[] = []

    switch (preset) {
      case 'two-column':
        newColumns = [
          { ...DEFAULT_COLUMNS[0], width: 50 },
          { ...DEFAULT_COLUMNS[1], width: 50 }
        ]
        break
      case 'three-column':
        newColumns = [
          { ...DEFAULT_COLUMNS[0], width: 33, title: 'Linke Spalte' },
          { ...DEFAULT_COLUMNS[1], width: 34, title: 'Mittlere Spalte', id: 'center' },
          { id: 'right', title: 'Rechte Spalte', sections: [], width: 33, backgroundColor: '#f8fafc', padding: '1rem' }
        ]
        break
      case 'sidebar-main':
        newColumns = [
          { ...DEFAULT_COLUMNS[0], width: 30, title: 'Sidebar' },
          { ...DEFAULT_COLUMNS[1], width: 70, title: 'Hauptbereich' }
        ]
        break
      case 'header-two-column':
        newColumns = [
          { id: 'header', title: 'Header', sections: [], width: 100, backgroundColor: '#f1f5f9', padding: '1rem' },
          { ...DEFAULT_COLUMNS[0], width: 50, title: 'Linke Spalte' },
          { ...DEFAULT_COLUMNS[1], width: 50, title: 'Rechte Spalte' }
        ]
        break
    }

    updateColumns(newColumns)
  }, [updateColumns])

  // Render Column Settings
  const renderColumnSettings = (column: Column) => (
    <div className="space-y-3 p-3 bg-gray-50 rounded border">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-gray-900">{column.title}</h4>
        <button
          onClick={() => removeColumn(column.id)}
          className="text-xs text-red-600 hover:text-red-800"
          disabled={columns.length <= 1}
        >
          Entfernen
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Titel
          </label>
          <input
            type="text"
            value={column.title}
            onChange={(e) => updateColumnSettings(column.id, { title: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Breite (%)
          </label>
          <input
            type="number"
            value={column.width}
            onChange={(e) => updateColumnWidth(column.id, Number(e.target.value))}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
            min={column.minWidth || 15}
            max={column.maxWidth || 85}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Hintergrund
          </label>
          <input
            type="color"
            value={column.backgroundColor}
            onChange={(e) => updateColumnSettings(column.id, { backgroundColor: e.target.value })}
            className="w-full h-8 border border-gray-300 rounded cursor-pointer"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Padding
          </label>
          <select
            value={column.padding}
            onChange={(e) => updateColumnSettings(column.id, { padding: e.target.value })}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
          >
            <option value="0.5rem">Klein</option>
            <option value="1rem">Normal</option>
            <option value="1.5rem">Groß</option>
            <option value="2rem">Sehr groß</option>
          </select>
        </div>
      </div>
    </div>
  )

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 flex items-center">
            <Columns className="w-5 h-5 mr-2" />
            Multi-Column Layout
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Organisiere Sektionen in anpassbaren Spalten per Drag & Drop
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={cn(
              "p-2 rounded-md transition-colors",
              showSettings ? "bg-blue-100 text-blue-600" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            )}
            title="Spalten-Einstellungen"
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={addColumn}
            className="px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-1" />
            Spalte hinzufügen
          </button>
        </div>
      </div>

      {/* Preset Layouts */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Vorlagen:</span>
        <div className="flex space-x-2">
          {[
            { key: 'two-column', label: '2 Spalten', icon: Columns },
            { key: 'three-column', label: '3 Spalten', icon: Grid3X3 },
            { key: 'sidebar-main', label: 'Sidebar + Main', icon: LayoutGrid },
            { key: 'header-two-column', label: 'Header + 2 Spalten', icon: LayoutGrid }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => applyPresetLayout(key as any)}
              className="flex items-center space-x-1 px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
            >
              <Icon className="w-3 h-3" />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Column Settings */}
      {showSettings && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {columns.map(column => (
            <div key={column.id}>
              {renderColumnSettings(column)}
            </div>
          ))}
        </div>
      )}

      {/* Unassigned Sections */}
      {unassignedSections.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-3 flex items-center">
            <Grid3X3 className="w-4 h-4 mr-2" />
            Nicht zugewiesene Sektionen ({unassignedSections.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {unassignedSections.map(section => (
              <SortableSection
                key={section.id}
                section={section}
                compact={true}
                showControls={false}
                className="cursor-move hover:shadow-md"
              />
            ))}
          </div>
        </div>
      )}

      {/* Multi-Column Layout */}
      <DndContext
        sensors={[]}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="grid gap-4 min-h-96"
          style={{
            gridTemplateColumns: columns.map(col => `${col.width}fr`).join(' ')
          }}
        >
          {columns.map(column => (
            <div
              key={column.id}
              className="border-2 border-dashed border-gray-300 rounded-lg transition-colors hover:border-gray-400"
              style={{
                backgroundColor: column.backgroundColor,
                padding: column.padding
              }}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-200">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {column.title}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {column.sections.length} Sektionen • {column.width}% Breite
                  </p>
                </div>
                
                <div className="text-xs text-gray-400">
                  {column.id}
                </div>
              </div>

              {/* Column Content */}
              <SortableContext
                items={column.sections.map(s => s.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-32">
                  {column.sections.length === 0 ? (
                    <div className="flex items-center justify-center h-32 text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                      Sektionen hier hinziehen
                    </div>
                  ) : (
                    column.sections.map(section => (
                      <SortableSection
                        key={section.id}
                        section={section}
                        onUpdate={(updatedSection) => {
                          const updatedColumns = columns.map(col => {
                            if (col.id === column.id) {
                              return {
                                ...col,
                                sections: col.sections.map(s => 
                                  s.id === updatedSection.id ? updatedSection : s
                                )
                              }
                            }
                            return col
                          })
                          updateColumns(updatedColumns)
                        }}
                        onRemove={(sectionId) => {
                          const updatedColumns = columns.map(col => {
                            if (col.id === column.id) {
                              return {
                                ...col,
                                sections: col.sections.filter(s => s.id !== sectionId)
                              }
                            }
                            return col
                          })
                          updateColumns(updatedColumns)
                        }}
                        onDuplicate={(sectionId) => {
                          const sectionToDuplicate = column.sections.find(s => s.id === sectionId)
                          if (sectionToDuplicate) {
                            const duplicatedSection: Section = {
                              ...sectionToDuplicate,
                              id: `${sectionToDuplicate.id}-copy-${Date.now()}`,
                              title: `${sectionToDuplicate.title} (Kopie)`
                            }
                            
                            const updatedColumns = columns.map(col => {
                              if (col.id === column.id) {
                                return {
                                  ...col,
                                  sections: [...col.sections, duplicatedSection]
                                }
                              }
                              return col
                            })
                            updateColumns(updatedColumns)
                          }
                        }}
                        compact={true}
                      />
                    ))
                  )}
                </div>
              </SortableContext>
            </div>
          ))}
        </div>
      </DndContext>

      {/* Layout Statistics */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">Layout-Statistiken</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Spalten:</span>
            <span className="ml-2 font-medium">{columns.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Zugewiesene Sektionen:</span>
            <span className="ml-2 font-medium">{assignedSectionIds.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Nicht zugewiesen:</span>
            <span className="ml-2 font-medium">{unassignedSections.length}</span>
          </div>
          <div>
            <span className="text-gray-600">Gesamt:</span>
            <span className="ml-2 font-medium">{sections.length}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MultiColumnLayout