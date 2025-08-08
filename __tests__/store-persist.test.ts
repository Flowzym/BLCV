// src/__tests__/store-persist.test.ts
import { describe, it, expect } from 'vitest';
import { useDesignerStore } from '@/modules/cv-designer/store/designerStore';

describe('designerStore persist slice', () => {
  it('exposes zoom and setters', () => {
    const st:any = (useDesignerStore as any).getState();
    expect(typeof st.zoom === 'number').toBe(true);
    expect(typeof st.setZoom === 'function' || typeof st.zoomIn === 'function').toBe(true);
  });
});
