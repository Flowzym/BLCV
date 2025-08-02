/**
 * CV-Designer Module - Main Export
 * Phases 1–3: Entry point for headless integration into Better_Letter
 *
 * IMPORTANT: Only export headless-compatible core functionality
 * Never export playground-specific code or UI experiments
 */

// Types (Phases 1–3)
export * from './types';

// Hooks (Phase 2)
export * from './hooks';

// Context (Phase 3)
export * from './context';

// Utils (Phase 5)
export * from './utils/fileHelpers';

// Services (Phase 4)
export * from './services';

// Core functionality will be exported in later phases:
// export * from './components'; // Phase 4

// Module metadata
export const CV_DESIGNER_VERSION = '1.0.0-alpha';
export const CV_DESIGNER_PHASE = 4;
