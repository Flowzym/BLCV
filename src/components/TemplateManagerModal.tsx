import React, { useState, useEffect } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Edit3, 
  Save, 
  Download, 
  Upload, 
  FileText,
  Check,
  AlertCircle
} from 'lucide-react';

export interface Template {
  id: string;
  name: string;
  content: string;
  createdAt: string;
  thumbnail?: string;
}

interface TemplateManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInsertTemplate: (template: Template) => void;
  templates: Template[];
  onTemplatesChange: (templates: Template[]) => void;
}

export default function TemplateManagerModal({
  isOpen,
  onClose,
  onInsertTemplate,
  templates,
  onTemplatesChange
}: TemplateManagerModalProps) {
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  interface NewTemplateData {
    name: string;
    content: string;
  }

  const [newTemplate, setNewTemplate] = useState<NewTemplateData>({
    name: '',
    content: ''
  });
  const [showNewTemplateForm, setShowNewTemplateForm] = useState(false);
  const [importError, setImportError] = useState<string>('');
  const [importSuccess, setImportSuccess] = useState<string>('');

  // Close modal with Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const generateThumbnail = (content: string): string => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    const text = tempDiv.textContent || tempDiv.innerText || '';
    return text.substring(0, 150) + (text.length > 150 ? '...' : '');
  };

  const saveNewTemplate = () => {
    if (!newTemplate.name.trim() || !newTemplate.content.trim()) return;
    
    const template: Template = {
      id: Date.now().toString(),
      name: newTemplate.name.trim(),
      content: newTemplate.content.trim(),
      createdAt: new Date().toISOString(),
      thumbnail: generateThumbnail(newTemplate.content.trim())
    };
    
    onTemplatesChange([...templates, template]);
    setNewTemplate({ name: '', content: '' });
    setShowNewTemplateForm(false);
  };

  const updateTemplate = (template: Template) => {
    const updatedTemplates = templates.map(t => 
      t.id === template.id 
        ? { ...template, thumbnail: generateThumbnail(template.content) }
        : t
    );
    onTemplatesChange(updatedTemplates);
    setEditingTemplate(null);
  };

  const deleteTemplate = (id: string) => {
    if (confirm('Möchten Sie diese Vorlage wirklich löschen?')) {
      onTemplatesChange(templates.filter(t => t.id !== id));
    }
  };

  const exportTemplates = () => {
    const dataStr = JSON.stringify(templates, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'quill-editor-templates.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importTemplates = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImportError('');
    setImportSuccess('');

    try {
      const content = await file.text();
      const importedTemplates: Template[] = JSON.parse(content); // parse result typed
      
      if (!Array.isArray(importedTemplates)) {
        throw new Error('Ungültiges Dateiformat. Erwartet wird ein Array von Templates.');
      }

      // Validate template structure
      for (const template of importedTemplates) {
        if (!template.id || !template.name || !template.content || !template.createdAt) {
          throw new Error('Ungültiges Template-Format. Fehlende erforderliche Felder.');
        }
      }

      // Add thumbnails if missing
      const templatesWithThumbnails = importedTemplates.map(template => ({
        ...template,
        thumbnail: template.thumbnail || generateThumbnail(template.content)
      }));

      onTemplatesChange([...templates, ...templatesWithThumbnails]);
      setImportSuccess(`${importedTemplates.length} Vorlagen erfolgreich importiert!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => setImportSuccess(''), 3000);
    } catch (error) {
      setImportError(error instanceof Error ? error.message : 'Unbekannter Fehler beim Importieren');
    }
    
    event.target.value = '';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-h-[95vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6" style={{ color: '#F29400' }} />
            <h2 className="text-xl font-semibold text-gray-900">Vorlagen verwalten</h2>
            <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
              {templates.length} Vorlagen
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={exportTemplates}
              disabled={templates.length === 0}
              className="flex items-center space-x-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              title="Alle Vorlagen exportieren"
            >
              <Download className="h-4 w-4" />
              <span>Exportieren</span>
            </button>
            <label className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 cursor-pointer transition-colors duration-200">
              <Upload className="h-4 w-4" />
              <span>Importieren</span>
              <input
                type="file"
                accept=".json"
                onChange={importTemplates}
                className="hidden"
              />
            </label>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
        </div>

        {/* Import/Export Messages */}
        {(importError || importSuccess) && (
          <div className="px-6 py-3 border-b border-gray-200">
            {importError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-red-700">
                  <AlertCircle className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm font-medium">Import-Fehler:</p>
                </div>
                <p className="text-red-600 text-sm mt-1">{importError}</p>
              </div>
            )}
            {importSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-green-700">
                  <Check className="h-4 w-4 flex-shrink-0" />
                  <p className="text-sm font-medium">{importSuccess}</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Template Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map(template => (
                <div key={template.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-900 truncate flex-1">{template.name}</h3>
                    <div className="flex space-x-1 ml-2">
                      <button
                        onClick={() => onInsertTemplate(template)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors duration-200"
                        title="Vorlage einfügen"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setEditingTemplate(template)}
                        className="p-1 text-gray-600 hover:bg-gray-50 rounded transition-colors duration-200"
                        title="Vorlage bearbeiten"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => deleteTemplate(template.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors duration-200"
                        title="Vorlage löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-md p-3 mb-3 h-24 overflow-hidden text-xs text-gray-600 leading-relaxed">
                    {template.thumbnail || generateThumbnail(template.content)}
                  </div>
                  <div className="text-xs text-gray-500">
                    Erstellt: {new Date(template.createdAt).toLocaleDateString('de-DE')}
                  </div>
                </div>
              ))}
              
              {/* Add New Template Card */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center hover:border-gray-400 transition-colors duration-200">
                <button
                  onClick={() => setShowNewTemplateForm(true)}
                  className="flex flex-col items-center space-y-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                >
                  <Plus className="h-8 w-8" />
                  <span className="text-sm font-medium">Neue Vorlage</span>
                </button>
              </div>
            </div>
            
            {templates.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Vorlagen vorhanden</h3>
                <p className="text-gray-600 mb-4">
                  Erstellen Sie Ihre erste Vorlage, um Zeit bei wiederkehrenden Texten zu sparen.
                </p>
                <button
                  onClick={() => setShowNewTemplateForm(true)}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors duration-200 mx-auto"
                  style={{ backgroundColor: '#F29400' }}
                >
                  <Plus className="h-4 w-4" />
                  <span>Erste Vorlage erstellen</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* New Template Form Modal */}
        {showNewTemplateForm && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Neue Vorlage erstellen</h3>
                <button
                  onClick={() => {
                    setShowNewTemplateForm(false);
                    setNewTemplate({ name: '', content: '' });
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vorlagenname</label>
                  <input
                    type="text"
                    value={newTemplate.name}
                    onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#F29400' } as React.CSSProperties}
                    placeholder="z.B. Standard Bewerbung"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
                  <textarea
                    value={newTemplate.content}
                    onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 resize-vertical"
                    style={{ '--tw-ring-color': '#F29400' } as React.CSSProperties}
                    placeholder="Geben Sie hier den Inhalt der Vorlage ein..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => {
                    setShowNewTemplateForm(false);
                    setNewTemplate({ name: '', content: '' });
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Abbrechen
                </button>
                <button
                  onClick={saveNewTemplate}
                  disabled={!newTemplate.name.trim() || !newTemplate.content.trim()}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  style={{ backgroundColor: '#F29400' }}
                >
                  <Save className="h-4 w-4" />
                  <span>Vorlage speichern</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Template Modal */}
        {editingTemplate && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-h-[90vh] flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Vorlage bearbeiten</h3>
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="flex-1 p-6 space-y-4 overflow-y-auto">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vorlagenname</label>
                  <input
                    type="text"
                    value={editingTemplate.name}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ '--tw-ring-color': '#F29400' } as React.CSSProperties}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Inhalt</label>
                  <textarea
                    value={editingTemplate.content}
                    onChange={(e) => setEditingTemplate({ ...editingTemplate, content: e.target.value })}
                    rows={12}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 resize-vertical"
                    style={{ '--tw-ring-color': '#F29400' } as React.CSSProperties}
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 p-6 border-t border-gray-200">
                <button
                  onClick={() => setEditingTemplate(null)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  Abbrechen
                </button>
                <button
                  onClick={() => updateTemplate(editingTemplate)}
                  disabled={!editingTemplate.name.trim() || !editingTemplate.content.trim()}
                  className="flex items-center space-x-2 px-4 py-2 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  style={{ backgroundColor: '#F29400' }}
                >
                  <Save className="h-4 w-4" />
                  <span>Änderungen speichern</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}