/**
 * Layout Element Validation Utilities
 * Validates LayoutElement arrays for import/export operations
 */

import { LayoutElement } from '../types/section';

/**
 * Validates if an object is a valid LayoutElement
 */
export function isValidLayoutElement(obj: any): obj is LayoutElement {
  if (!obj || typeof obj !== 'object') {
    return false;
  }

  // Required properties
  const hasRequiredProps = 
    typeof obj.id === 'string' &&
    typeof obj.type === 'string' &&
    typeof obj.x === 'number' &&
    typeof obj.y === 'number' &&
    typeof obj.width === 'number';

  if (!hasRequiredProps) {
    return false;
  }

  // Optional properties validation
  if (obj.height !== undefined && typeof obj.height !== 'number') {
    return false;
  }

  if (obj.title !== undefined && typeof obj.title !== 'string') {
    return false;
  }

  if (obj.content !== undefined && typeof obj.content !== 'string') {
    return false;
  }

  // Group-specific validation
  if (obj.type === 'group') {
    if (!Array.isArray(obj.children)) {
      return false;
    }
    
    // Validate all children
    return obj.children.every((child: any) => isValidLayoutElement(child));
  }

  return true;
}

/**
 * Validates if an array contains only valid LayoutElements
 */
export function isValidLayoutElementArray(arr: any): arr is LayoutElement[] {
  if (!Array.isArray(arr)) {
    return false;
  }

  return arr.every(item => isValidLayoutElement(item));
}

/**
 * Sanitizes a LayoutElement to ensure all required properties exist
 */
export function sanitizeLayoutElement(obj: any): LayoutElement | null {
  if (!obj || typeof obj !== 'object') {
    return null;
  }

  try {
    const sanitized: LayoutElement = {
      id: obj.id || `element-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: obj.type || 'text',
      x: typeof obj.x === 'number' ? obj.x : 0,
      y: typeof obj.y === 'number' ? obj.y : 0,
      width: typeof obj.width === 'number' ? obj.width : 300,
      height: typeof obj.height === 'number' ? obj.height : 100,
      title: typeof obj.title === 'string' ? obj.title : '',
      content: typeof obj.content === 'string' ? obj.content : '',
      ...obj
    };

    // Handle group-specific properties
    if (sanitized.type === 'group' && Array.isArray(obj.children)) {
      (sanitized as any).children = obj.children
        .map(sanitizeLayoutElement)
        .filter(Boolean);
    }

    return sanitized;
  } catch (error) {
    console.error('Error sanitizing layout element:', error);
    return null;
  }
}

/**
 * Sanitizes an array of LayoutElements
 */
export function sanitizeLayoutElementArray(arr: any): LayoutElement[] {
  if (!Array.isArray(arr)) {
    return [];
  }

  return arr
    .map(sanitizeLayoutElement)
    .filter((element): element is LayoutElement => element !== null);
}

/**
 * Validates and provides detailed error information for debugging
 */
export function validateLayoutElementWithDetails(obj: any): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!obj || typeof obj !== 'object') {
    errors.push('Object is null, undefined, or not an object');
    return { isValid: false, errors, warnings };
  }

  // Check required properties
  if (typeof obj.id !== 'string') {
    errors.push('Property "id" must be a string');
  }

  if (typeof obj.type !== 'string') {
    errors.push('Property "type" must be a string');
  }

  if (typeof obj.x !== 'number') {
    errors.push('Property "x" must be a number');
  }

  if (typeof obj.y !== 'number') {
    errors.push('Property "y" must be a number');
  }

  if (typeof obj.width !== 'number') {
    errors.push('Property "width" must be a number');
  }

  // Check optional properties
  if (obj.height !== undefined && typeof obj.height !== 'number') {
    errors.push('Property "height" must be a number if provided');
  }

  if (obj.title !== undefined && typeof obj.title !== 'string') {
    warnings.push('Property "title" should be a string if provided');
  }

  if (obj.content !== undefined && typeof obj.content !== 'string') {
    warnings.push('Property "content" should be a string if provided');
  }

  // Group-specific validation
  if (obj.type === 'group') {
    if (!Array.isArray(obj.children)) {
      errors.push('Group elements must have a "children" array');
    } else {
      obj.children.forEach((child: any, index: number) => {
        const childValidation = validateLayoutElementWithDetails(child);
        if (!childValidation.isValid) {
          errors.push(`Child element at index ${index} is invalid: ${childValidation.errors.join(', ')}`);
        }
      });
    }
  }

  // Warnings for common issues
  if (obj.width < 50) {
    warnings.push('Width is very small (< 50px), might not be visible');
  }

  if (obj.height && obj.height < 30) {
    warnings.push('Height is very small (< 30px), might not be visible');
  }

  if (obj.x < 0 || obj.y < 0) {
    warnings.push('Negative position values might cause display issues');
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}