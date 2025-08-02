/**
 * CV Designer Module Main Export
 * Provides the main API for the CV Designer module
 */

// Types
export * from './types';

// Components
export * from './components';

// Hooks
export { useMockData } from './hooks/useMockData';
export { useMapping } from './hooks/useMapping';

// Services
export { exportService, exportCV, exportToDocx, exportToPdf, exportToJson } from './export';
export { mappingRegistry, registerAllMappers } from './mapping/mappers';

// Mock Data
export * from '@/mocks';