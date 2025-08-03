import React from "react";
import CVPreview from "@/modules/cv-designer/components/CVPreview";
import { defaultStyleConfig } from "@/modules/cv-designer/config/defaultStyleConfig";

const CVPlayground: React.FC = () => {
  return (
    <div className="flex w-full h-full">
      <div className="w-1/4 border-r p-4">
        <h3 className="font-bold mb-2">Playground Steuerung</h3>
        <p className="text-sm text-gray-600">
          Hier können später Settings, Templates, StyleEditor etc. ergänzt werden.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        <CVPreview styleConfig={defaultStyleConfig} />
      </div>
    </div>
  );
};

export default CVPlayground;
