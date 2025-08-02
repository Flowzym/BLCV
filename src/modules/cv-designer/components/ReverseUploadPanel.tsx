import React, { useState } from 'react';
import { LayoutElement } from '../types/section';
import { StyleConfig } from '@/types/cv-designer';

interface ReverseUploadPanelProps {
  onImport: (layout: LayoutElement[]) => void;
  onCreateTemplate: (template: any) => void;
  defaultStyle: StyleConfig;
}

export const ReverseUploadPanel: React.FC<ReverseUploadPanelProps> = ({
  onImport,
  onCreateTemplate,
  defaultStyle
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileUpload = async (file: File) => {
    setUploadStatus('uploading');
    
    try {
      // Mock file processing
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create mock layout elements
      const mockLayout: LayoutElement[] = [
        {
          id: 'imported-header',
          type: 'profil',
          title: 'Imported Profile',
          content: 'This is imported content from the uploaded file.',
          position: { x: 0, y: 0 },
          size: { width: 100, height: 20 },
          style: {}
        }
      ];
      
      onImport(mockLayout);
      setUploadStatus('success');
      
      // Create template from import
      const template = {
        id: `template-${Date.now()}`,
        name: `Imported from ${file.name}`,
        description: 'Template created from file import',
        layout: mockLayout,
        style: defaultStyle
      };
      
      onCreateTemplate(template);
      
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadStatus('error');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  return (
    <div className="space-y-4">
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onDragEnter={() => setIsDragging(true)}
        onDragLeave={() => setIsDragging(false)}
      >
        <div className="space-y-4">
          <div className="text-4xl">📄</div>
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Datei hochladen
            </h3>
            <p className="text-gray-600 mb-4">
              Ziehen Sie eine Datei hierher oder klicken Sie zum Auswählen
            </p>
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".pdf,.docx,.json"
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
            >
              Datei auswählen
            </label>
          </div>
          <p className="text-sm text-gray-500">
            Unterstützte Formate: PDF, DOCX, JSON
          </p>
        </div>
      </div>

      {uploadStatus === 'uploading' && (
        <div className="text-center py-4">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <p className="mt-2 text-sm text-gray-600">Datei wird verarbeitet...</p>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-green-800">
            <span className="text-green-600">✓</span>
            <span className="font-medium">Datei erfolgreich importiert!</span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            Template wurde erstellt und Layout-Elemente wurden geladen.
          </p>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-800">
            <span className="text-red-600">✗</span>
            <span className="font-medium">Import fehlgeschlagen</span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            Die Datei konnte nicht verarbeitet werden. Bitte versuchen Sie es erneut.
          </p>
        </div>
      )}
    </div>
  );
};