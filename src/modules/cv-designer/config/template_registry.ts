// PATCH: Added function registerSavedTemplates to merge localStorage templates at runtime.

import { SavedTemplate } from "../hooks/useTemplateStorage";

export const registerSavedTemplates = (saved: SavedTemplate[]) => {
  saved.forEach((tpl) => {
    if (!templateRegistry.find((t) => t.id === tpl.id)) {
      templateRegistry.push({ id: tpl.id, name: tpl.name, layout: tpl.layout, style: tpl.style });
    }
  });
};
