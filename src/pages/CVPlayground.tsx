import React from "react";

const CVPlayground: React.FC = () => {
  return (
    <div className="flex w-full h-full">
      <div className="w-1/4 border-r p-4">
        <h3 className="font-bold mb-2">Playground Steuerung</h3>
        <p className="text-sm text-gray-600">
          Die frühere Vorschau-Komponente (CVPreview) wurde entfernt.
          Der Playground zeigt vorübergehend keinen Preview.
        </p>
      </div>

      <div className="flex-1 p-6 overflow-auto bg-gray-50">
        <div className="text-sm text-gray-700">
          Placeholder: Hier kommt später die Canvas/Preview oder Test-Komponenten hin.
        </div>
      </div>
    </div>
  );
};

export default CVPlayground;
