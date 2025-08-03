// 📄 src/modules/cv-designer/hooks/useTemplateStorage.ts
import { useCallback } from "react";
import { StyleConfig } from "../../../types/cv-designer";
import { LayoutElement } from "../types/section";

export interface SavedTemplate {
  id: string;
  name: string;
  layout: LayoutElement[];
  style: StyleConfig;
}

const STORAGE_KEY = "bl_templates_v1";

export const useTemplateStorage = () => {
  const loadTemplates = useCallback((): SavedTemplate[] => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch {
      return [];
    }
  }, []);

  const saveTemplate = useCallback((tpl: SavedTemplate) => {
    const templates = loadTemplates();
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...templates, tpl]));
  }, [loadTemplates]);

  return { loadTemplates, saveTemplate };
};
