/**
 * CV-Designer Module - Main Export
 * Phase 1-2: Entry point for headless integration into Better_Letter
 * 
 * IMPORTANT: Only export headless-compatible core functionality
 * Never export playground-specific code or UI experiments
 */

// Types (Phase 1)
export * from './types';

// Hooks (Phase 2)
export * from './hooks';

// Context (Phase 3)
export * from './context';

// Core functionality will be exported in later phases:
// export * from './services';  // Phase 2-3
// export * from './components'; // Phase 4

// Module metadata
export const CV_DESIGNER_VERSION = '1.0.0-alpha';
export const CV_DESIGNER_PHASE = 3;