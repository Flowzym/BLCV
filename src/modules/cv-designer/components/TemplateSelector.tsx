import React, { useState } from "react";
import {
  predefinedTemplates,
  getTemplateCategories,
} from "../config/template_registry";
import type { PredefinedTemplate } from "../config/template_registry";
import TemplateThumbnail from "./TemplateThumbnail";

interface TemplateSelectorProps {
  onSelect: (template: PredefinedTemplate) => void;
  selectedTemplateId?: string;
  showCategories?: boolean;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelect,
  selectedTemplateId,
  showCategories = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  const filteredTemplates =
    selectedCategory === "all"
      ? predefinedTemplates
      : predefinedTemplates.filter((tpl) => tpl.category === selectedCategory);

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
            onClick={() => onSelect(tpl)}
          />
        ))}
      </div>
    </div>
  );
};
