/**
 * Advanced Media Hook
 * Provides professional image handling with cropping, compression, and thumbnail generation
 */

import { useState, useCallback, useRef } from 'react';

export interface ImageCropData {
  x: number;
  y: number;
  width: number;
  height: number;
  aspect?: number;
}

export interface ImageProcessingOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp';
  generateThumbnail?: boolean;
  thumbnailSize?: number;
}

export interface ProcessedImage {
  original: string; // Base64 or URL
  processed: string; // Base64 or URL
  thumbnail?: string; // Base64 or URL
  metadata: {
    originalSize: { width: number; height: number };
    processedSize: { width: number; height: number };
    fileSize: number;
    format: string;
  };
}

export interface MediaState {
  isProcessing: boolean;
  error: string | null;
  processedImages: Map<string, ProcessedImage>;
}

export function useAdvancedMedia() {
  const [state, setState] = useState<MediaState>({
    isProcessing: false,
    error: null,
    processedImages: new Map()
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const createCanvas = useCallback(() => {
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
    }
    return canvasRef.current;
  }, []);

  const loadImage = useCallback((src: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = src;
    });
  }, []);

  const cropImage = useCallback(async (
    imageSrc: string,
    cropData: ImageCropData
  ): Promise<string> => {
    try {
      const img = await loadImage(imageSrc);
      const canvas = createCanvas();
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Set canvas size to crop dimensions
      canvas.width = cropData.width;
      canvas.height = cropData.height;

      // Draw cropped image
      ctx.drawImage(
        img,
        cropData.x, cropData.y, cropData.width, cropData.height,
        0, 0, cropData.width, cropData.height
      );

      return canvas.toDataURL('image/jpeg', 0.9);
    } catch (error) {
      throw new Error(`Image cropping failed: ${error}`);
    }
  }, [createCanvas, loadImage]);

  const resizeImage = useCallback(async (
    imageSrc: string,
    maxWidth: number,
    maxHeight: number,
    quality: number = 0.9
  ): Promise<string> => {
    try {
      const img = await loadImage(imageSrc);
      const canvas = createCanvas();
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas context not available');
      }

      // Calculate new dimensions maintaining aspect ratio
      let { width, height } = img;
      
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw resized image
      ctx.drawImage(img, 0, 0, width, height);

      return canvas.toDataURL('image/jpeg', quality);
    } catch (error) {
      throw new Error(`Image resizing failed: ${error}`);
    }
  }, [createCanvas, loadImage]);

  const generateThumbnail = useCallback(async (
    imageSrc: string,
    size: number = 150
  ): Promise<string> => {
    return resizeImage(imageSrc, size, size, 0.7);
  }, [resizeImage]);

  const processImage = useCallback(async (
    imageSrc: string,
    options: ImageProcessingOptions = {},
    cropData?: ImageCropData
  ): Promise<ProcessedImage> => {
    setState(prev => ({ ...prev, isProcessing: true, error: null }));

    try {
      const img = await loadImage(imageSrc);
      const originalSize = { width: img.width, height: img.height };

      let processedSrc = imageSrc;

      // Apply cropping if specified
      if (cropData) {
        processedSrc = await cropImage(imageSrc, cropData);
      }

      // Apply resizing if specified
      if (options.maxWidth || options.maxHeight) {
        processedSrc = await resizeImage(
          processedSrc,
          options.maxWidth || img.width,
          options.maxHeight || img.height,
          options.quality || 0.9
        );
      }

      // Generate thumbnail if requested
      let thumbnail: string | undefined;
      if (options.generateThumbnail) {
        thumbnail = await generateThumbnail(processedSrc, options.thumbnailSize);
      }

      // Get processed image dimensions
      const processedImg = await loadImage(processedSrc);
      const processedSize = { width: processedImg.width, height: processedImg.height };

      // Calculate file size (approximate)
      const fileSize = Math.round((processedSrc.length * 3) / 4); // Base64 to bytes approximation

      const result: ProcessedImage = {
        original: imageSrc,
        processed: processedSrc,
        thumbnail,
        metadata: {
          originalSize,
          processedSize,
          fileSize,
          format: options.format || 'jpeg'
        }
      };

      // Cache the result
      const imageId = btoa(imageSrc).substring(0, 16);
      setState(prev => ({
        ...prev,
        processedImages: new Map(prev.processedImages).set(imageId, result),
        isProcessing: false
      }));

      return result;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Image processing failed';
      setState(prev => ({ ...prev, isProcessing: false, error: errorMessage }));
      throw error;
    }
  }, [loadImage, cropImage, resizeImage, generateThumbnail]);

  const getProcessedImage = useCallback((imageSrc: string): ProcessedImage | null => {
    const imageId = btoa(imageSrc).substring(0, 16);
    return state.processedImages.get(imageId) || null;
  }, [state.processedImages]);

  const clearProcessedImages = useCallback(() => {
    setState(prev => ({
      ...prev,
      processedImages: new Map()
    }));
  }, []);

  const compressForExport = useCallback(async (
    imageSrc: string,
    targetFormat: ExportFormat,
    quality: ExportQuality
  ): Promise<string> => {
    const options: ImageProcessingOptions = {
      quality: quality.imageQuality,
      format: 'jpeg' // Most compatible for exports
    };

    // Adjust compression based on export format
    if (targetFormat === 'pdf') {
      options.maxWidth = quality.dpi === 72 ? 800 : quality.dpi === 300 ? 2400 : 4800;
      options.maxHeight = quality.dpi === 72 ? 600 : quality.dpi === 300 ? 1800 : 3600;
    } else if (targetFormat === 'docx') {
      options.maxWidth = 800; // DOCX has size limitations
      options.maxHeight = 600;
      options.quality = 0.8; // Smaller file size for DOCX
    }

    const processed = await processImage(imageSrc, options);
    return processed.processed;
  }, [processImage]);

  return {
    // State
    isProcessing: state.isProcessing,
    error: state.error,
    processedImages: state.processedImages,

    // Image processing
    processImage,
    cropImage,
    resizeImage,
    generateThumbnail,
    compressForExport,

    // Utilities
    getProcessedImage,
    clearProcessedImages
  };
}