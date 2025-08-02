/**
 * Media Manager Component
 * Handles image upload, cropping, and management for CV profile pictures
 */

import React, { useState, useRef } from 'react';

interface MediaManagerProps {
  onImageSelect: (imageSrc: string, thumbnail?: string) => void;
  currentImage?: string;
  aspectRatio?: number;
  shape?: 'circle' | 'square';
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  onImageSelect,
  currentImage,
  aspectRatio = 1,
  shape = 'circle'
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Bitte wählen Sie eine Bilddatei aus.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      alert('Die Datei ist zu groß. Bitte wählen Sie ein Bild unter 5MB.');
      return;
    }

    processImage(file);
  };

  const processImage = (file: File) => {
    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      
      // Create image element for processing
      const img = new Image();
      img.onload = () => {
        // Create canvas for cropping/resizing
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          setIsProcessing(false);
          return;
        }

        // Calculate dimensions for square crop
        const size = Math.min(img.width, img.height);
        canvas.width = 300; // Standard profile picture size
        canvas.height = 300;

        // Draw cropped and resized image
        const sourceX = (img.width - size) / 2;
        const sourceY = (img.height - size) / 2;
        
        ctx.drawImage(
          img,
          sourceX, sourceY, size, size, // Source rectangle
          0, 0, 300, 300 // Destination rectangle
        );

        // Convert to base64
        const processedImage = canvas.toDataURL('image/jpeg', 0.8);
        
        onImageSelect(processedImage);
        setIsProcessing(false);
      };
      
      img.src = result;
    };
    
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="media-manager space-y-4">
      {/* Current Image Preview */}
      {currentImage && (
        <div className="current-image-preview">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Aktuelles Profilbild
          </h4>
          <div className="flex items-center space-x-4">
            <img
              src={currentImage}
              alt="Current profile"
              className={`w-20 h-20 object-cover border-2 border-gray-300 ${
                shape === 'circle' ? 'rounded-full' : 'rounded-lg'
              }`}
            />
            <div className="text-sm text-gray-600">
              <p>Größe: ~{Math.round(currentImage.length / 1024)} KB</p>
              <p>Format: Base64 Image</p>
              <p>Form: {shape === 'circle' ? 'Kreisförmig' : 'Quadratisch'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Area */}
      <div
        className={`upload-area border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={triggerFileSelect}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />
        
        {isProcessing ? (
          <div className="space-y-2">
            <svg className="animate-spin h-8 w-8 text-blue-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-600">Bild wird verarbeitet...</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="text-4xl text-gray-400">📸</div>
            <div>
              <p className="text-sm font-medium text-gray-700">
                Profilbild hochladen
              </p>
              <p className="text-xs text-gray-500">
                Drag & Drop oder klicken zum Auswählen
              </p>
            </div>
            <div className="text-xs text-gray-400">
              JPG, PNG bis 5MB • Wird automatisch zugeschnitten
            </div>
          </div>
        )}
      </div>

      {/* Image Processing Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          🔧 Automatische Bildbearbeitung
        </h4>
        <ul className="text-xs text-blue-800 space-y-1">
          <li>• Automatischer Zuschnitt auf {aspectRatio}:1 Verhältnis</li>
          <li>• Größenanpassung auf 300x300 Pixel</li>
          <li>• Qualitätsoptimierung für Web und Print</li>
          <li>• {shape === 'circle' ? 'Kreisförmige' : 'Quadratische'} Darstellung im CV</li>
        </ul>
      </div>

      {/* Remove Image Button */}
      {currentImage && (
        <button
          onClick={() => onImageSelect('')}
          className="w-full px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50"
        >
          🗑️ Profilbild entfernen
        </button>
      )}
    </div>
  );
};

export default MediaManager;