import { v4 as uuid } from "uuid";
import type { SavedTemplate } from "@/types/template";

export interface TemplateRecord extends SavedTemplate {
  version: number;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "better_letter_templates_v2";
const CURRENT_VERSION = 2;

type Migration = (tpl: TemplateRecord) => TemplateRecord;
const migrations: Record<number, Migration> = {
  // v1 -> v2 example migration
  1: (tpl) => {
    const next = { ...tpl };
    next.version = 2;
    if (!next.tags) next.tags = [];
    return next;
  },
};

function runMigrations(tpl: TemplateRecord): TemplateRecord {
  let current = tpl;
  while (current.version < CURRENT_VERSION) {
    const mig = migrations[current.version];
    if (!mig) break;
    current = mig(current);
  }
  return current;
}

function loadAll(): TemplateRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list: TemplateRecord[] = JSON.parse(raw);
    return list.map((t) => runMigrations(t));
  } catch {
    return [];
  }
}

function saveAll(list: TemplateRecord[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function listTemplates(): TemplateRecord[] {
  return loadAll();
}

export function saveTemplate(input: Omit<SavedTemplate, "id"> & Partial<Pick<TemplateRecord, "id">>): TemplateRecord {
  const now = new Date().toISOString();
  const all = loadAll();
  const id = input.id || uuid();
  const rec: TemplateRecord = {
    id,
    name: input.name,
    category: input.category || "general",
    tags: input.tags || [],
    data: input.data,
    createdAt: now,
    updatedAt: now,
    version: CURRENT_VERSION,
  };
  const idx = all.findIndex((t) => t.id === id);
  if (idx >= 0) all[idx] = rec; else all.push(rec);
  saveAll(all);
  return rec;
}

export function updateTemplate(id: string, patch: Partial<SavedTemplate>): TemplateRecord | null {
  const all = loadAll();
  const idx = all.findIndex((t) => t.id === id);
  if (idx < 0) return null;
  const now = new Date().toISOString();
  const next = { ...all[idx], ...patch, updatedAt: now };
  all[idx] = next;
  saveAll(all);
  return next;
}

export function deleteTemplate(id: string): boolean {
  const all = loadAll();
  const next = all.filter((t) => t.id !== id);
  saveAll(next);
  return next.length !== all.length;
}

// Import/Export
export function exportTemplates(): Blob {
  const all = loadAll();
  return new Blob([JSON.stringify(all, null, 2)], { type: "application/json" });
}

export async function importTemplates(file: File): Promise<number> {
  const text = await file.text();
  const list: TemplateRecord[] = JSON.parse(text);
  const migrated = list.map((t) => runMigrations(t));
  saveAll(migrated);
  return migrated.length;
}
