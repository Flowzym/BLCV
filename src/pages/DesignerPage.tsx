// src/pages/DesignerPage.tsx
import React, { useEffect } from "react";
import DesignerShell from "@/modules/cv-designer/components/DesignerShell";
import { useDocumentStore } from "@/store/DocumentStore";
import { useDesignerStore } from "@/modules/cv-designer/store/designerStore";

export default function DesignerPage() {
  const cvSections = useDocumentStore((s) => s.cvSections);
  const styleConfig = useDocumentStore((s) => s.styleConfig);
  const setInitial = useDesignerStore((s) => s.setInitialElementsFromSections);
  const setTokens = useDesignerStore((s) => s.setTokens);

  useEffect(() => {
    if (cvSections && cvSections.length) setInitial(cvSections);
  }, [cvSections, setInitial]);

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
    <div className="flex h-screen w-full">
      <DesignerShell />
    </div>
  );
}
