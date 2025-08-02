/**
 * Advanced Image Cropper Component
 * Professional image cropping interface with aspect ratio controls and preview
 */

import React, { useState, useCallback } from 'react';
import { useAdvancedMedia, ImageCropData, ImageProcessingOptions } from '@/hooks/useAdvancedMedia';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Crop, 
  RotateCw, 
  ZoomIn, 
  ZoomOut, 
  Square, 
  Circle,
  Loader,
  Download
} from 'lucide-react';

interface ImageCropperProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  onCropComplete: (croppedImage: string, thumbnail?: string) => void;
  aspectRatio?: number;
  shape?: 'rectangle' | 'circle';
}

const ASPECT_RATIOS = [
  { label: 'Free', value: 0 },
  { label: 'Square (1:1)', value: 1 },
  { label: 'Portrait (3:4)', value: 3/4 },
  { label: 'Landscape (4:3)', value: 4/3 },
  { label: 'Wide (16:9)', value: 16/9 }
];

export const ImageCropper: React.FC<ImageCropperProps> = ({
  isOpen,
  onClose,
  imageSrc,
  onCropComplete,
  aspectRatio = 1,
  shape = 'rectangle'
}) => {
  const { processImage, isProcessing, error } = useAdvancedMedia();
  
  const [cropData, setCropData] = useState<ImageCropData>({
    x: 0,
    y: 0,
    width: 200,
    height: 200,
    aspect: aspectRatio
  });
  
  const [selectedAspectRatio, setSelectedAspectRatio] = useState(aspectRatio);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [generateThumbnail, setGenerateThumbnail] = useState(true);
  const [quality, setQuality] = useState(0.9);

  const handleCrop = useCallback(async () => {
    try {
      const options: ImageProcessingOptions = {
        quality,
        generateThumbnail,
        thumbnailSize: 150,
        format: 'jpeg'
      };

      const result = await processImage(imageSrc, options, cropData);
      onCropComplete(result.processed, result.thumbnail);
      onClose();
    } catch (error) {
      console.error('Cropping failed:', error);
    }
  }, [imageSrc, cropData, quality, generateThumbnail, processImage, onCropComplete, onClose]);

  const updateCropData = (updates: Partial<ImageCropData>) => {
    setCropData(prev => ({ ...prev, ...updates }));
  };

  const handleAspectRatioChange = (value: string) => {
    const ratio = parseFloat(value);
    setSelectedAspectRatio(ratio);
    updateCropData({ aspect: ratio || undefined });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Crop className="w-5 h-5" />
            <span>Crop Image</span>
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Image Preview Area */}
          <div className="lg:col-span-2">
            <div className="relative bg-gray-100 rounded-lg overflow-hidden" style={{ height: '400px' }}>
              {imageSrc ? (
                <div className="relative w-full h-full flex items-center justify-center">
                  <img
                    src={imageSrc}
                    alt="Crop preview"
                    className="max-w-full max-h-full object-contain"
                    style={{
                      transform: `scale(${zoom}) rotate(${rotation}deg)`,
                      transition: 'transform 0.2s ease'
                    }}
                  />
                  
                  {/* Crop Overlay */}
                  <div 
                    className={`absolute border-2 border-blue-500 ${
                      shape === 'circle' ? 'rounded-full' : 'rounded'
                    }`}
                    style={{
                      left: `${cropData.x}px`,
                      top: `${cropData.y}px`,
                      width: `${cropData.width}px`,
                      height: `${cropData.height}px`,
                      boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)'
                    }}
                  />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  No image selected
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Aspect Ratio */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Aspect Ratio</Label>
              <Select value={selectedAspectRatio.toString()} onValueChange={handleAspectRatioChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ASPECT_RATIOS.map((ratio) => (
                    <SelectItem key={ratio.value} value={ratio.value.toString()}>
                      {ratio.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shape */}
            <div>
              <Label className="text-sm font-medium mb-2 block">Shape</Label>
              <div className="flex space-x-2">
                <Button
                  variant={shape === 'rectangle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {/* Shape change logic */}}
                >
                  <Square className="w-4 h-4" />
                </Button>
                <Button
                  variant={shape === 'circle' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => {/* Shape change logic */}}
                >
                  <Circle className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Zoom */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Zoom ({Math.round(zoom * 100)}%)
              </Label>
              <div className="flex items-center space-x-2">
                <ZoomOut className="w-4 h-4 text-gray-500" />
                <Slider
                  value={[zoom]}
                  onValueChange={([value]) => setZoom(value)}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="flex-1"
                />
                <ZoomIn className="w-4 h-4 text-gray-500" />
              </div>
            </div>

            {/* Rotation */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Rotation ({rotation}°)
              </Label>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(prev => prev - 90)}
                >
                  <RotateCw className="w-4 h-4 transform scale-x-[-1]" />
                </Button>
                <Slider
                  value={[rotation]}
                  onValueChange={([value]) => setRotation(value)}
                  min={-180}
                  max={180}
                  step={1}
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRotation(prev => prev + 90)}
                >
                  <RotateCw className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Quality */}
            <div>
              <Label className="text-sm font-medium mb-2 block">
                Quality ({Math.round(quality * 100)}%)
              </Label>
              <Slider
                value={[quality]}
                onValueChange={([value]) => setQuality(value)}
                min={0.1}
                max={1}
                step={0.05}
              />
            </div>

            {/* Options */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="thumbnail"
                  checked={generateThumbnail}
                  onCheckedChange={(checked) => setGenerateThumbnail(!!checked)}
                />
                <Label htmlFor="thumbnail" className="text-sm">Generate thumbnail</Label>
              </div>
            </div>

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-sm text-red-800">{error}</div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <div className="flex justify-between w-full">
            <div className="text-sm text-gray-600">
              Crop: {cropData.width} × {cropData.height}px
            </div>
            
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleCrop} disabled={isProcessing}>
                {isProcessing ? (
                  <Loader className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Apply Crop
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImageCropper;