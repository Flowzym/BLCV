// 📄 src/pages/DesignerPage.tsx
import React, { useEffect } from "react";
import { DesignerShell } from "@/modules/cv-designer";
import { useDocumentStore } from "@/store/DocumentStore";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";
import "@/modules/cv-designer/store/augmentDesignerStore";

/**
 * This page simply bridges the global DocumentStore with the local DesignerStore
 * and renders the DesignerShell (FabricCanvas + Sidebar).
 * No business‑logic from the Wizard / CoverLetter is touched.
 */
const DesignerPage: React.FC = () => {
  const cvSections = useDocumentStore((s) => s.cvSections);
  const styleConfig = useDocumentStore((s) => s.styleConfig);

  const setCvSections = useDesignerStore((s) => s.setInitialElementsFromSections);
  const setTokens = useDesignerStore((s) => s.setTokens);

  // On mount → push CV data & styles into designer store
  useEffect(() => {
    if (cvSections.length) setCvSections(cvSections);
  }, [cvSections, setCvSections]);

  useEffect(() => {
    if (styleConfig) {
      setTokens({
        fontFamily: styleConfig.fontFamily,
        fontSize: styleConfig.fontSize,
        colorPrimary: styleConfig.colorPrimary,
        spacing: styleConfig.spacing,
      });
    }
  }, [styleConfig, setTokens]);

  return (
    <div className="flex flex-col h-screen w-full">
      <DesignerShell />
    </div>
  );
};

export default DesignerPage;
