import { Palette } from 'lucide-react';

interface StyleSelectorProps {
  selectedStyles: string[];
  onStylesChange: (styles: string[]) => void;
  stylePrompts: {
    [key: string]: {
      label: string;
      prompt: string;
    };
  };
}

export default function StyleSelector({ selectedStyles, onStylesChange, stylePrompts }: StyleSelectorProps) {
  const toggleStyle = (styleId: string) => {
    if (selectedStyles.includes(styleId)) {
      onStylesChange(selectedStyles.filter(id => id !== styleId));
    } else {
      onStylesChange([...selectedStyles, styleId]);
    }
  };

  const styleEntries = Object.entries(stylePrompts) as [string, { label: string; prompt: string }][]; // typed entries

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-8 border border-gray-200">
      <div className="flex items-center space-x-3 mb-4">
        <Palette className="h-6 w-6" style={{ color: '#F29400' }} />
        <h2 className="text-xl font-semibold text-gray-900">Stil auswählen</h2>
      </div>
      
      <fieldset>
        <legend className="sr-only">Schreibstil auswählen (mehrere möglich)</legend>
        <div className="flex flex-wrap gap-3">
          {styleEntries.map(([styleId, styleData]) => {
            const isSelected = selectedStyles.includes(styleId);
            const checkboxId = `style-${styleId}`;
            
            return (
              <label key={styleId} htmlFor={checkboxId} className="cursor-pointer">
                <input
                  type="checkbox"
                  id={checkboxId}
                  name="styles"
                  value={styleId}
                  checked={isSelected}
                  onChange={() => toggleStyle(styleId)}
                  className="sr-only"
                />
                <div
                  className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 border-2 ${
                    isSelected
                      ? 'text-white border-transparent shadow-md'
                      : 'bg-white border-gray-300 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
                  }`}
                  style={isSelected ? { backgroundColor: '#F29400' } : {}}
                  title={styleData.prompt}
                >
                  {styleData.label}
                </div>
              </label>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
