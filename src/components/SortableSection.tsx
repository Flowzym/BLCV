// 📄 src/modules/cv-designer/components/SortableSection.tsx

import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Section } from '../types/section'
import { GripVertical, Edit3, Trash2, Copy, Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SortableSectionProps {
  section: Section
  onUpdate?: (section: Section) => void
  onRemove?: (id: string) => void
  onDuplicate?: (id: string) => void
  onToggleVisibility?: (id: string) => void
  showControls?: boolean
  compact?: boolean
  className?: string
}

export const SortableSection: React.FC<SortableSectionProps> = ({
  section,
  onUpdate,
  onRemove,
  onDuplicate,
  onToggleVisibility,
  showControls = true,
  compact = false,
  className
}) => {
  const [isEditing, setIsEditing] = useState(false)
  const [editedSection, setEditedSection] = useState(section)

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
    isOver
  } = useSortable({ 
    id: section.id,
    data: {
      type: 'section',
      section
    }
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const handleSave = () => {
    onUpdate?.(editedSection)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setEditedSection(section)
    setIsEditing(false)
  }

  const handleFieldChange = (field: keyof Section, value: any) => {
    setEditedSection(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const getSectionIcon = (type: string) => {
    const iconMap: Record<string, string> = {
      'profil': '👤',
      'erfahrung': '💼',
      'ausbildung': '🎓',
      'kenntnisse': '🧠',
      'sprachen': '🌍',
      'projekte': '🚀',
      'zertifikate': '📜',
      'referenzen': '👥',
      'hobbys': '🎨',
      'photo': '📷',
      'kontakt': '📞',
      'footer': '📄',
      'custom': '📝'
    }
    return iconMap[type] || '📄'
  }

  const getSectionTypeLabel = (type: string) => {
    const labelMap: Record<string, string> = {
      'profil': 'Profil',
      'erfahrung': 'Berufserfahrung',
      'ausbildung': 'Ausbildung',
      'kenntnisse': 'Fähigkeiten',
      'sprachen': 'Sprachen',
      'projekte': 'Projekte',
      'zertifikate': 'Zertifikate',
      'referenzen': 'Referenzen',
      'hobbys': 'Hobbys',
      'photo': 'Foto',
      'kontakt': 'Kontakt',
      'footer': 'Fußzeile',
      'custom': 'Benutzerdefiniert'
    }
    return labelMap[type] || type
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-white border rounded-lg shadow-sm transition-all duration-200",
        "hover:shadow-md hover:border-blue-300",
        isDragging && "opacity-50 shadow-lg scale-105 rotate-1",
        isOver && "border-blue-500 bg-blue-50",
        section.props?.visible === false && "opacity-60 bg-gray-50",
        compact ? "p-3" : "p-4",
        className
      )}
      {...attributes}
    >
      {/* Drag Handle */}
      <div
        {...listeners}
        className="absolute left-2 top-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <GripVertical className="w-4 h-4 text-gray-400 hover:text-gray-600" />
      </div>

      {/* Section Header */}
      <div className="flex items-start justify-between mb-2 ml-6">
        <div className="flex items-center space-x-2 min-w-0 flex-1">
          <span className="text-lg">{getSectionIcon(section.type)}</span>
          <div className="min-w-0 flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editedSection.title || ''}
                onChange={(e) => handleFieldChange('title', e.target.value)}
                className="w-full px-2 py-1 text-sm font-medium border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Titel eingeben..."
                autoFocus
              />
            ) : (
              <h3 className={cn(
                "font-medium text-gray-900 truncate",
                compact ? "text-sm" : "text-base"
              )}>
                {section.title || getSectionTypeLabel(section.type)}
              </h3>
            )}
            <p className="text-xs text-gray-500 truncate">
              {getSectionTypeLabel(section.type)} • ID: {section.id.slice(-8)}
            </p>
          </div>
        </div>

        {/* Controls */}
        {showControls && (
          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleVisibility && (
              <button
                onClick={() => onToggleVisibility(section.id)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title={section.props?.visible === false ? "Einblenden" : "Ausblenden"}
              >
                {section.props?.visible === false ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            )}
            
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-100 rounded"
              title="Bearbeiten"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            
            {onDuplicate && (
              <button
                onClick={() => onDuplicate(section.id)}
                className="p-1 text-gray-400 hover:text-green-600 hover:bg-green-100 rounded"
                title="Duplizieren"
              >
                <Copy className="w-4 h-4" />
              </button>
            )}
            
            {onRemove && (
              <button
                onClick={() => onRemove(section.id)}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-100 rounded"
                title="Löschen"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Section Content */}
      <div className="space-y-3">
        {isEditing ? (
          <div className="space-y-3">
            {/* Content Editor */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Inhalt
              </label>
              <textarea
                value={editedSection.content || ''}
                onChange={(e) => handleFieldChange('content', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={compact ? 2 : 3}
                placeholder="Inhalt eingeben..."
              />
            </div>

            {/* Type Selector */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Typ
              </label>
              <select
                value={editedSection.type}
                onChange={(e) => handleFieldChange('type', e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="profil">Profil</option>
                <option value="erfahrung">Berufserfahrung</option>
                <option value="ausbildung">Ausbildung</option>
                <option value="kenntnisse">Fähigkeiten</option>
                <option value="sprachen">Sprachen</option>
                <option value="projekte">Projekte</option>
                <option value="zertifikate">Zertifikate</option>
                <option value="referenzen">Referenzen</option>
                <option value="hobbys">Hobbys</option>
                <option value="photo">Foto</option>
                <option value="kontakt">Kontakt</option>
                <option value="footer">Fußzeile</option>
                <option value="custom">Benutzerdefiniert</option>
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors"
              >
                Abbrechen
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 text-xs font-medium text-white bg-blue-600 border border-transparent rounded hover:bg-blue-700 transition-colors"
              >
                Speichern
              </button>
            </div>
          </div>
        ) : (
          <div>
            {section.content ? (
              <p className={cn(
                "text-gray-700 whitespace-pre-wrap",
                compact ? "text-xs line-clamp-2" : "text-sm line-clamp-3"
              )}>
                {section.content}
              </p>
            ) : (
              <p className="text-xs text-gray-400 italic">
                Kein Inhalt vorhanden
              </p>
            )}
          </div>
        )}
      </div>

      {/* Section Metadata */}
      {!compact && !isEditing && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span>Position: {section.x || 0}, {section.y || 0}</span>
              <span>Größe: {section.width || 0} × {section.height || 0}</span>
            </div>
            <div className="flex items-center space-x-2">
              {section.props?.gridSpan && (
                <span className="px-2 py-1 bg-gray-100 rounded text-xs">
                  Span: {section.props.gridSpan}
                </span>
              )}
              {section.props?.visible === false && (
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                  Ausgeblendet
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Drag Overlay */}
      {isDragging && (
        <div className="absolute inset-0 bg-blue-500 bg-opacity-20 rounded-lg pointer-events-none" />
      )}
    </div>
  )
}

export default SortableSection