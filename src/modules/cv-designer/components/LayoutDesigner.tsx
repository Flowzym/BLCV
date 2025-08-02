/**
 * Layout Designer Component
 * Drag & Drop interface for arranging CV layout elements
 */

import React, { useState, useCallback } from 'react';
import { LayoutElement } from '../types/section';
import { StyleConfig } from '@/types/cv-designer';

interface LayoutDesignerProps {
  initialLayout: LayoutElement[];
  onLayoutChange: (layout: LayoutElement[]) => void;
  onSave: (layout: LayoutElement[], style: StyleConfig) => void;
}

export const LayoutDesigner: React.FC<LayoutDesignerProps> = ({
  initialLayout,
  onLayoutChange,
  onSave
}) => {
  const [layout, setLayout] = useState<LayoutElement[]>(initialLayout);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [draggedElement, setDraggedElement] = useState<string | null>(null);

  // Available element types
  const elementTypes = [
    { type: 'header', label: 'Kopfzeile', icon: '📋' },
    { type: 'section', label: 'Sektion', icon: '📄' },
    { type: 'text', label: 'Text', icon: '📝' },
    { type: 'image', label: 'Bild', icon: '🖼️' },
    { type: 'divider', label: 'Trennlinie', icon: '➖' }
  ];

  // Handle element selection
  const handleElementSelect = (elementId: string) => {
    setSelectedElement(elementId === selectedElement ? null : elementId);
  };

  // Handle drag start
  const handleDragStart = (elementId: string) => {
    setDraggedElement(elementId);
  };

  // Handle drag over
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // Handle drop
  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    
    if (!draggedElement) return;
    
    const draggedIndex = layout.findIndex(el => el.id === draggedElement);
    if (draggedIndex === -1) return;
    
    const newLayout = [...layout];
    const [draggedItem] = newLayout.splice(draggedIndex, 1);
    newLayout.splice(targetIndex, 0, draggedItem);
    
    // Update positions
    const updatedLayout = newLayout.map((element, index) => ({
      ...element,
      y: index * 100 // Simple vertical stacking
    }));
    
    setLayout(updatedLayout);
    onLayoutChange(updatedLayout);
    setDraggedElement(null);
  };

  // Add new element
  const addElement = (type: string) => {
    const newElement: LayoutElement = {
      id: `element-${Date.now()}`,
      type,
      x: 0,
      y: layout.length * 100,
      width: 100,
      height: 80,
      content: {
        text: `Neues ${type} Element`,
        style: {}
      },
      style: {
        backgroundColor: '#ffffff',
        borderColor: '#e5e7eb',
        borderWidth: 1
      }
    };
    
    const newLayout = [...layout, newElement];
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  // Remove element
  const removeElement = (elementId: string) => {
    const newLayout = layout.filter(el => el.id !== elementId);
    setLayout(newLayout);
    onLayoutChange(newLayout);
    setSelectedElement(null);
  };

  // Update element properties
  const updateElement = (elementId: string, updates: Partial<LayoutElement>) => {
    const newLayout = layout.map(element =>
      element.id === elementId ? { ...element, ...updates } : element
    );
    setLayout(newLayout);
    onLayoutChange(newLayout);
  };

  return (
    <div className="h-full flex">
      {/* Element Palette */}
      <div className="w-64 bg-gray-50 border-r p-4">
        <h3 className="font-medium text-gray-900 mb-4">Elemente</h3>
        
        <div className="space-y-2">
          {elementTypes.map(elementType => (
            <button
              key={elementType.type}
              onClick={() => addElement(elementType.type)}
              className="w-full flex items-center space-x-3 p-3 bg-white border rounded-lg hover:bg-gray-50 text-left"
            >
              <span className="text-lg">{elementType.icon}</span>
              <span className="text-sm font-medium">{elementType.label}</span>
            </button>
          ))}
        </div>

        {/* Element List */}
        <div className="mt-6">
          <h4 className="font-medium text-gray-900 mb-3">Layout ({layout.length})</h4>
          <div className="space-y-1">
            {layout.map((element, index) => (
              <div
                key={element.id}
                draggable
                onDragStart={() => handleDragStart(element.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onClick={() => handleElementSelect(element.id)}
                className={`p-2 border rounded cursor-move text-sm ${
                  selectedElement === element.id
                    ? 'bg-blue-50 border-blue-300'
                    : 'bg-white border-gray-200 hover:bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{element.type}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeElement(element.id);
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {element.width}×{element.height}px
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 p-4">
        <div className="bg-white border rounded-lg h-full relative overflow-auto">
          {/* Canvas Header */}
          <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between">
            <h3 className="font-medium text-gray-900">Layout Canvas</h3>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500">{layout.length} Elemente</span>
              <button
                onClick={() => onSave(layout, {
                  primaryColor: '#1e40af',
                  accentColor: '#3b82f6',
                  fontFamily: 'Inter',
                  fontSize: 'medium',
                  lineHeight: 1.6,
                  margin: 'normal'
                })}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Speichern
              </button>
            </div>
          </div>

          {/* Canvas Content */}
          <div className="p-4 min-h-96">
            {layout.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <div className="text-4xl mb-4">📋</div>
                  <p className="text-lg font-medium mb-2">Leeres Layout</p>
                  <p className="text-sm">
                    Fügen Sie Elemente aus der Palette hinzu, um Ihr Layout zu gestalten.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {layout.map((element, index) => (
                  <div
                    key={element.id}
                    onClick={() => handleElementSelect(element.id)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, index)}
                    className={`relative border-2 border-dashed p-4 rounded-lg cursor-pointer transition-colors ${
                      selectedElement === element.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    style={{
                      minHeight: `${element.height}px`,
                      backgroundColor: element.style?.backgroundColor || '#ffffff'
                    }}
                  >
                    {/* Element Content */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700 capitalize">
                        {element.type}
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {element.width}×{element.height}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            removeElement(element.id);
                          }}
                          className="text-red-500 hover:text-red-700"
                        >
                          ×
                        </button>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-600">
                      {element.content?.text || `${element.type} Inhalt`}
                    </div>

                    {/* Element Controls */}
                    {selectedElement === element.id && (
                      <div className="absolute top-2 right-2 bg-white border rounded shadow-lg p-2">
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={element.width}
                            onChange={(e) => updateElement(element.id, { width: parseInt(e.target.value) })}
                            className="w-16 px-1 py-1 text-xs border rounded"
                            placeholder="Breite"
                          />
                          <span className="text-xs text-gray-500">×</span>
                          <input
                            type="number"
                            value={element.height}
                            onChange={(e) => updateElement(element.id, { height: parseInt(e.target.value) })}
                            className="w-16 px-1 py-1 text-xs border rounded"
                            placeholder="Höhe"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedElement && (
        <div className="w-64 bg-gray-50 border-l p-4">
          <h3 className="font-medium text-gray-900 mb-4">Eigenschaften</h3>
          
          {(() => {
            const element = layout.find(el => el.id === selectedElement);
            if (!element) return null;
            
            return (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Typ
                  </label>
                  <input
                    type="text"
                    value={element.type}
                    readOnly
                    className="w-full px-2 py-1 text-sm border rounded bg-gray-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inhalt
                  </label>
                  <textarea
                    value={element.content?.text || ''}
                    onChange={(e) => updateElement(element.id, {
                      content: { ...element.content, text: e.target.value }
                    })}
                    className="w-full px-2 py-1 text-sm border rounded"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Breite
                    </label>
                    <input
                      type="number"
                      value={element.width}
                      onChange={(e) => updateElement(element.id, { width: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Höhe
                    </label>
                    <input
                      type="number"
                      value={element.height}
                      onChange={(e) => updateElement(element.id, { height: parseInt(e.target.value) })}
                      className="w-full px-2 py-1 text-sm border rounded"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Hintergrundfarbe
                  </label>
                  <input
                    type="color"
                    value={element.style?.backgroundColor || '#ffffff'}
                    onChange={(e) => updateElement(element.id, {
                      style: { ...element.style, backgroundColor: e.target.value }
                    })}
                    className="w-full h-8 border rounded cursor-pointer"
                  />
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};