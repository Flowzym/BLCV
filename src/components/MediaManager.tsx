/**
 * Media Manager Component
 * Professional interface for image management with cropping and processing
 */

import React, { useState, useCallback } from 'react';
import { useAdvancedMedia, ImageCropData, ImageProcessingOptions } from '@/hooks/useAdvancedMedia';
import { ImageCropper } from './ImageCropper';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Upload, 
  Crop, 
  Image as ImageIcon, 
  Trash2, 
  Download,
  Eye,
  Settings
} from 'lucide-react';

interface MediaManagerProps {
  onImageSelect: (imageSrc: string, thumbnail?: string) => void;
  currentImage?: string;
  aspectRatio?: number;
  shape?: 'rectangle' | 'circle';
  className?: string;
}

export const MediaManager: React.FC<MediaManagerProps> = ({
  onImageSelect,
  currentImage,
  aspectRatio = 1,
  shape = 'rectangle',
  className = ''
}) => {
  const { 
    processImage, 
    generateThumbnail, 
    isProcessing, 
    error, 
    processedImages,
    clearProcessedImages 
  } = useAdvancedMedia();

  const [selectedImage, setSelectedImage] = useState<string>(currentImage || '');
  const [isCropperOpen, setIsCropperOpen] = useState(false);
  const [showProcessed, setShowProcessed] = useState(false);

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please select a file smaller than 10MB.');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageSrc = e.target?.result as string;
        setSelectedImage(imageSrc);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('File upload failed:', error);
      alert('Failed to upload image');
    }
  }, []);

  const handleCropComplete = useCallback((croppedImage: string, thumbnail?: string) => {
    setSelectedImage(croppedImage);
    onImageSelect(croppedImage, thumbnail);
    setIsCropperOpen(false);
  }, [onImageSelect]);

  const handleQuickProcess = useCallback(async () => {
    if (!selectedImage) return;

    try {
      const options: ImageProcessingOptions = {
        maxWidth: 800,
        maxHeight: 800,
        quality: 0.9,
        generateThumbnail: true,
        thumbnailSize: 150
      };

      const result = await processImage(selectedImage, options);
      onImageSelect(result.processed, result.thumbnail);
    } catch (error) {
      console.error('Quick processing failed:', error);
    }
  }, [selectedImage, processImage, onImageSelect]);

  const handleRemoveImage = useCallback(() => {
    setSelectedImage('');
    onImageSelect('');
  }, [onImageSelect]);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Profile Image</Label>
        {processedImages.size > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowProcessed(!showProcessed)}
          >
            <Eye className="w-4 h-4 mr-1" />
            {showProcessed ? 'Hide' : 'Show'} Processed ({processedImages.size})
          </Button>
        )}
      </div>

      {/* Image Preview */}
      {selectedImage ? (
        <div className="relative">
          <div className={`w-32 h-32 border-2 border-gray-300 rounded-lg overflow-hidden bg-gray-50 ${
            shape === 'circle' ? 'rounded-full' : ''
          }`}>
            <img
              src={selectedImage}
              alt="Profile preview"
              className="w-full h-full object-cover"
            />
          </div>
          
          <div className="absolute -top-2 -right-2 flex space-x-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCropperOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Crop className="w-3 h-3" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRemoveImage}
              className="h-8 w-8 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      ) : (
        <div className={`w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 ${
          shape === 'circle' ? 'rounded-full' : ''
        }`}>
          <ImageIcon className="w-8 h-8 text-gray-400" />
        </div>
      )}

      {/* Upload Controls */}
      <div className="space-y-2">
        <div className="flex space-x-2">
          <label className="flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button variant="outline" size="sm" className="w-full" asChild>
              <span>
                <Upload className="w-4 h-4 mr-2" />
                Upload Image
              </span>
            </Button>
          </label>
          
          {selectedImage && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleQuickProcess}
              disabled={isProcessing}
            >
              <Settings className="w-4 h-4" />
            </Button>
          )}
        </div>

        {selectedImage && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCropperOpen(true)}
            className="w-full"
          >
            <Crop className="w-4 h-4 mr-2" />
            Crop & Adjust
          </Button>
        )}
      </div>

      {/* Processed Images List */}
      {showProcessed && processedImages.size > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-gray-600">Processed Images</Label>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearProcessedImages}
              className="text-xs"
            >
              Clear All
            </Button>
          </div>
          
          <div className="grid grid-cols-3 gap-2">
            {Array.from(processedImages.values()).map((processed, index) => (
              <div key={index} className="relative group">
                <img
                  src={processed.thumbnail || processed.processed}
                  alt={`Processed ${index + 1}`}
                  className="w-full h-16 object-cover rounded border cursor-pointer hover:border-blue-500"
                  onClick={() => onImageSelect(processed.processed, processed.thumbnail)}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded flex items-center justify-center">
                  <Download className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Image Cropper Dialog */}
      <ImageCropper
        isOpen={isCropperOpen}
        onClose={() => setIsCropperOpen(false)}
        imageSrc={selectedImage}
        onCropComplete={handleCropComplete}
        aspectRatio={aspectRatio}
        shape={shape}
      />
    </div>
  );
};

export default MediaManager;