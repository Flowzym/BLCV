import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Deep merge utility for nested objects
 * Recursively merges source into target without overwriting nested properties
 * Includes array merge strategy for patching instead of replacement
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const result = { ...target };

  for (const key in source) {
    if (Object.prototype.hasOwnProperty.call(source, key)) {
      const sourceValue = source[key];
      const targetValue = result[key];

      if (sourceValue === null || sourceValue === undefined) {
        // Explicitly set null/undefined values
        result[key] = sourceValue;
      } else if (Array.isArray(sourceValue) && Array.isArray(targetValue)) {
        // Array merge strategy: patch index-wise instead of replacement
        const mergedArray = [...targetValue];
        sourceValue.forEach((item, index) => {
          if (item !== undefined) {
            if (typeof item === "object" && item !== null && 
                typeof mergedArray[index] === "object" && mergedArray[index] !== null) {
              // Deep merge array objects
              mergedArray[index] = deepMerge(mergedArray[index], item);
            } else {
              // Direct assignment for primitives or when target doesn't exist
              mergedArray[index] = item;
            }
          }
        });
        result[key] = mergedArray;
      } else if (
        typeof sourceValue === "object" &&
        !Array.isArray(sourceValue) &&
        typeof targetValue === "object" &&
        !Array.isArray(targetValue) &&
        targetValue !== null
      ) {
        // Recursively merge nested objects
        result[key] = deepMerge(targetValue, sourceValue);
      } else {
        // Direct assignment for primitives or when target is null/undefined
        result[key] = sourceValue;
      }
    }
  }

  return result;
}
