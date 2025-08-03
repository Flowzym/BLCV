import React from "react";

// Safe imports with fallbacks
let ReverseUpload: React.FC<any> | null = null;
let ReverseUploadAssistant: React.FC<any> | null = null;
let ReverseUploadWithGPT: React.FC<any> | null = null;

try {
  const reverseUploadModule = require("./ReverseUploadBasic");
  ReverseUpload = reverseUploadModule.default || reverseUploadModule.ReverseUpload;
} catch {
  ReverseUpload = null;
}

try {
  const reverseUploadAssistantModule = require("./ReverseUploadAssistant");
  ReverseUploadAssistant = reverseUploadAssistantModule.default || reverseUploadAssistantModule.ReverseUploadAssistant;
} catch {
  ReverseUploadAssistant = null;
}

try {
  const reverseUploadGPTModule = require("./ReverseUploadWithGPT");
  ReverseUploadWithGPT = reverseUploadGPTModule.default || reverseUploadGPTModule.ReverseUploadWithGPT;
} catch {
  ReverseUploadWithGPT = null;
}

const FallbackBox: React.FC = () => (
  <div className="border rounded-lg p-4 bg-gray-50 text-gray-500">
    Noch nicht verfügbar
  </div>
);

interface UploadPanelProps {
  onLayoutImport?: (layout: any[]) => void;
  onCVDataImport?: (cvData: any) => void;
}

const UploadPanel: React.FC<UploadPanelProps> = ({ 
  onLayoutImport = () => {}, 
  onCVDataImport = () => {} 
}) => {
  return (
    <div className="space-y-6">
      {/* Rohdaten Upload */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">📄 Rohdaten hochladen</h3>
        <p className="text-sm text-gray-600 mb-3">
          Importieren Sie einen Rohdaten-Lebenslauf (JSON / internes Format).
        </p>
        {ReverseUpload ? (
          <ReverseUpload onImport={onLayoutImport} />
        ) : (
          <FallbackBox />
        )}
      </div>

      {/* Word/PDF Upload */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">📑 Word / PDF hochladen</h3>
        <p className="text-sm text-gray-600 mb-3">
          Laden Sie ein bestehendes Dokument hoch (DOCX oder PDF) und übernehmen Sie Inhalte.
        </p>
        {ReverseUploadAssistant ? (
          <ReverseUploadAssistant 
            onImport={onLayoutImport}
            onCreateTemplate={(template) => {
              console.log('Template created:', template);
            }}
          />
        ) : (
          <FallbackBox />
        )}
      </div>

      {/* Upload mit KI */}
      <div className="border rounded-lg p-4 bg-white shadow-sm">
        <h3 className="font-semibold text-gray-800 mb-2">🤖 KI-gestützter Upload</h3>
        <p className="text-sm text-gray-600 mb-3">
          Nutzen Sie die KI, um Daten aus strukturierten oder unstrukturierten Dateien automatisch zu extrahieren.
        </p>
        {ReverseUploadWithGPT ? (
          <ReverseUploadWithGPT onImport={onLayoutImport} />
        ) : (
          <FallbackBox />
        )}
      </div>

      {/* Info Box */}
      <div className="border rounded-lg p-4 bg-blue-50 border-blue-200">
        <h4 className="font-medium text-blue-900 mb-2">💡 Upload-Hinweise</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• JSON-Dateien werden direkt als Layout-Elemente importiert</li>
          <li>• DOCX-Dateien werden automatisch in Abschnitte strukturiert</li>
          <li>• KI-Upload analysiert und optimiert die Datenstruktur</li>
          <li>• Alle Uploads können als Template gespeichert werden</li>
        </ul>
      </div>
    </div>
  );
};

export default UploadPanel;