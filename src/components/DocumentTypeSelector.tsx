import type { LucideIcon } from 'lucide-react';
import { FileText, Briefcase, Send, GraduationCap, Coffee, Users } from 'lucide-react';

interface DocumentTypeSelectorProps {
  documentTypes: {
    [key: string]: {
      label: string;
      prompt: string;
    };
  };
  selectedType: string;
  onTypeChange: (type: string) => void;
}

// Map document type keys to their respective Lucide icon
const ICON_MAP: Record<string, LucideIcon> = {
  standard: Briefcase,
  berufsfern: Users,
  initiativ: Send,
  ausbildung: GraduationCap,
  praktikum: Coffee,
  aqua: FileText,
};

export default function DocumentTypeSelector({ documentTypes, selectedType, onTypeChange }: DocumentTypeSelectorProps) {
  const typeEntries = Object.entries(documentTypes);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200 sticky top-0 z-10">
      <div className="flex items-center space-x-3 mb-4">
        <FileText className="h-6 w-6" style={{ color: '#F29400' }} />
        {/* BOLT-UI-ANPASSUNG 2025-01-15: Titel geändert */}
        <h2 className="text-xl font-semibold text-gray-900">Dokument-Typ</h2>
      </div>
      
      <fieldset>
        <legend className="sr-only">Dokumenttyp auswählen</legend>
        <div className="flex flex-wrap gap-2">
          {typeEntries.map(([typeKey, typeData]) => {
            const IconComponent = ICON_MAP[typeKey] || FileText;
            const isSelected = selectedType === typeKey;
            const buttonId = `document-type-${typeKey}`;
            
            return (
              <label key={typeKey} htmlFor={buttonId} className="cursor-pointer">
                <input
                  type="radio"
                  id={buttonId}
                  name="documentType"
                  value={typeKey}
                  checked={isSelected}
                  onChange={() => onTypeChange(typeKey)}
                  className="sr-only"
                />
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border-2 ${
                    isSelected
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                  style={isSelected ? { backgroundColor: '#F29400' } : {}}
                  title={`Klicken Sie hier, um "${typeData.label}" auszuwählen`}
                >
                  <IconComponent className="h-4 w-4 flex-shrink-0" />
                  {typeData.label}
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
