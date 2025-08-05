import React, { useState } from "react";
import {
  predefinedTemplates,
  getTemplateCategories,
} from "../config/template_registry";
import type { PredefinedTemplate } from "../config/template_registry";
import TemplateThumbnail from "./TemplateThumbnail";
import { useStyleConfig } from "../context/StyleConfigContext";
import { useTypographyContext } from "../context/TypographyContext";

interface TemplateSelectorProps {
  onSelect: (template: PredefinedTemplate) => void;
  selectedTemplateId?: string;
  showCategories?: boolean;
  preserveUserTypography?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  selectedTemplateId,
  showCategories = false,
  preserveUserTypography = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const { updateStyleConfig } = useStyleConfig();
  const { state: typographyState, bulkUpdate: bulkUpdateTypography } = useTypographyContext();

  const filteredTemplates =
    selectedCategory === "all"
      ? predefinedTemplates
      : predefinedTemplates.filter((tpl) => tpl.category === selectedCategory);

  const handleTemplateSelect = (template: PredefinedTemplate) => {
    // Apply template styles (colors, layout, spacing)
    if (template.styleConfig) {
      updateStyleConfig(template.styleConfig);
    }
    
    // Handle typography separately to preserve user changes
    if (template.typography && !preserveUserTypography) {
      // If not preserving user typography, apply template typography completely
      bulkUpdateTypography({ sections: template.typography });
    } else if (template.typography && preserveUserTypography) {
      // Merge template typography with existing user typography
      // Only apply template typography for fields that user hasn't customized
      const mergedTypography = { ...typographyState.sections };
      
      Object.entries(template.typography).forEach(([sectionId, sectionTypography]) => {
        if (!mergedTypography[sectionId]) {
          // Section doesn't exist in user config, apply template completely
          mergedTypography[sectionId] = sectionTypography;
        } else {
          // Section exists, merge field by field
          Object.entries(sectionTypography).forEach(([fieldKey, fieldTypography]) => {
            if (!mergedTypography[sectionId][fieldKey]) {
              // Field doesn't exist in user config, apply template
              mergedTypography[sectionId][fieldKey] = fieldTypography;
            }
            // If field exists in user config, preserve user settings
          });
        }
      });
      
      bulkUpdateTypography({ sections: mergedTypography });
    }
    
    // Call original onSelect
    onSelect(template);
  };

  return (
    <div className="w-full h-full overflow-y-auto p-2">
      {showCategories && (
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full mb-2 px-2 py-1 text-sm border rounded"
        >
          <option value="all">Alle Kategorien</option>
          {getTemplateCategories().map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      )}

      <div className="grid grid-cols-3 gap-4">
        {filteredTemplates.map((tpl) => (
          <TemplateThumbnail
            key={tpl.id}
            name={tpl.name}
            layout={tpl.layout}
            styleConfig={tpl.styleConfig}
            isSelected={selectedTemplateId === tpl.id}
            onClick={() => handleTemplateSelect(tpl)}
          />
        ))}
      </div>
      
      {/* Typography Preservation Toggle */}
      {preserveUserTypography && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2 text-blue-800">
            <span className="text-sm font-medium">💡 Typography-Schutz aktiv</span>
          </div>
          <p className="text-xs text-blue-700 mt-1">
            Ihre benutzerdefinierten Schrifteinstellungen werden beim Template-Wechsel beibehalten.
          </p>
        </div>
      )}
    </div>
  );
};
