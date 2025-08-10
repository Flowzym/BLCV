import { supabase } from '../lib/supabase';
import { KIModelSettings } from '../types/KIModelSettings';

// --- Types --------------------------------------------------------------
export interface ProfileConfig {
  berufe: string[];
  taetigkeiten: string[];
  skills: string[];
  softskills: string[];
  ausbildung: string[];
}

export interface ProfileSourceMapping {
  category:
    | 'berufe'
    | 'taetigkeiten'
    | 'skills'
    | 'softskills'
    | 'ausbildung'
    | 'companies'
    | 'positions'
    | 'aufgabenbereiche';
  tableName: string;
  columnName: string;
  isActive: boolean;
}

export interface DatabaseStats {
  totalFromMappings: number;
  berufe: number;
  taetigkeiten: number;
  skills: number;
  softskills: number;
  ausbildung: number;
}

export interface SupabaseTable {
  table_name: string;
  columns: string[];
}

export interface CVSuggestionConfig {
  companies: string[];
  positions: string[];
  aufgabenbereiche: string[];
}

// -----------------------------------------------------------------------
// Data helpers
async function getFieldMappings(): Promise<unknown[]> {
  const { data, error } = await supabase.from('field_mappings').select('*');
  if (error) {
    console.error('Fehler beim Laden der Field-Mappings:', error.message);
    return [];
  }
  return data ?? [];
}

async function getPromptTemplates(): Promise<unknown[]> {
  const { data, error } = await supabase.from('prompts').select('*');
  if (error) {
    console.error('Fehler beim Laden der Prompt-Vorlagen:', error.message);
    return [];
  }
  return data ?? [];
}

// --- Cache helpers -----------------------------------------------------
const TABLE_CACHE_DURATION = 30000; // 30s
let tableCache: { timestamp: number; tables: SupabaseTable[] } | null = null;
const columnCache: Record<string, { timestamp: number; columns: string[] }> = {};

async function loadKIConfigs(): Promise<KIModelSettings[]> {
  // Check if Supabase is configured before attempting to fetch
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty KI configs');
    return [];
  }

  try {
    // Test connection before attempting to load configs
    const isConnected = await testSupabaseConnection();
    if (!isConnected) {
      console.warn('Supabase connection failed, returning empty KI configs');
      return [];
    }
  } catch (error) {
    console.warn('Supabase connection test failed:', error);
    return [];
  }

  const { data, error } = await supabase.from("ki_settings").select("*");
  if (error) {
    console.error("Fehler beim Laden der KI-Konfigurationen:", error.message);
    return [];
  }
  return data ?? [];
}

async function saveKIConfigs(models: KIModelSettings[]) {
  const modelsToSave = models.map((model) => {
    const { name, ...rest } = model;
    void name;
    return rest;
  });
  const { error } = await supabase.from("ki_settings").upsert(modelsToSave, {
    onConflict: "id",
  });
  if (error) {
    console.error("Fehler beim Speichern der KI-Konfigurationen:", error.message);
  }
}

// -----------------------------------------------------------------------
// Supabase table & column helpers
async function getTableColumns(tableName: string): Promise<string[]> {
  const cached = columnCache[tableName];
  if (cached && Date.now() - cached.timestamp < TABLE_CACHE_DURATION) {
    return cached.columns;
  }

  const columns = await fetchTableColumns(tableName);
  columnCache[tableName] = { timestamp: Date.now(), columns };
  return columns;
}

async function getSupabaseTableNames(forceRefresh = false): Promise<SupabaseTable[]> {
  if (!forceRefresh && tableCache && Date.now() - tableCache.timestamp < TABLE_CACHE_DURATION) {
    return tableCache.tables;
  }

  const { data, error } = await supabase
    .from('available_tables')
    .select('table_name');

  if (error) {
    console.error('Error fetching tables:', error.message);
    return [];
  }

  const tables: SupabaseTable[] = [];
  for (const row of data as { table_name: string }[]) {
    const columns = await getTableColumns(row.table_name);
    tables.push({ table_name: row.table_name, columns });
  }

  tableCache = { timestamp: Date.now(), tables };
  return tables;
}

function invalidateTableCache() {
  tableCache = null;
}

async function testTableColumnMapping(table: string, column: string) {
  const { data, error } = await supabase.from(table).select(column).limit(5);
  if (error) {
    console.error('Mapping test failed:', error.message);
    return { success: false, sampleData: [], error: error.message };
  }
  const samples = (data as Record<string, unknown>[]).map((r) => String(r[column] ?? ''));
  return { success: true, sampleData: samples };
}


async function getDatabaseStats(
  mappings: ProfileSourceMapping[] = []
): Promise<DatabaseStats> {
  const counts: Record<keyof ProfileConfig, number> = {
    berufe: 0,
    taetigkeiten: 0,
    skills: 0,
    softskills: 0,
    ausbildung: 0,
  };

  if (mappings.length === 0) {
    console.warn('getDatabaseStats: No mappings provided.');
  }

  const tables = await getSupabaseTableNames();
  const tableSet = new Set(tables.map((t) => t.table_name));

  for (const m of mappings.filter((m) => m.isActive)) {
    if (!m.tableName || !m.columnName) {
      console.warn('Ung\u00fcltiges Mapping \u00fcbersprungen:', m);
      continue;
    }

    if (!tableSet.has(m.tableName)) {
      console.error(`Tabelle '${m.tableName}' existiert nicht in Supabase.`);
      continue;
    }

    try {
      const { count, error } = await supabase
        .from(m.tableName)
        .select('*', { count: 'exact', head: true });
      if (error) {
        console.error(
          `Fehler beim Abrufen der Statistiken f\u00fcr ${m.tableName}:`,
          error.message
        );
        continue;
      }
      const c = count ?? 0;
      if (m.category in counts) {
        counts[m.category as keyof ProfileConfig] += c;
      }
    } catch (err) {
      console.error(
        `Fehler beim Abrufen der Statistiken f\u00fcr ${m.tableName}:`,
        err
      );
    }
  }

  const totalFromMappings = Object.values(counts).reduce(
    (sum, val) => sum + val,
    0
  );

  return { totalFromMappings, ...counts };

}
function isSupabaseConfigured(): boolean {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  
  const isConfigured = Boolean(url && key);
  
  if (!isConfigured) {
    console.debug('Supabase-Konfiguration:', {
      hasUrl: !!url,
      hasKey: !!key,
      urlPreview: url ? `${url.substring(0, 20)}...` : 'nicht gesetzt',
      keyPreview: key ? `${key.substring(0, 20)}...` : 'nicht gesetzt'
    });
  }
  
  return isConfigured;
}

async function loadProfileSuggestions(
  mappings: ProfileSourceMapping[] = []
): Promise<ProfileConfig> {
  const result: ProfileConfig = {
    berufe: [],
    taetigkeiten: [],
    skills: [],
    softskills: [],
    ausbildung: [],
  };

  const validCategories: (keyof ProfileConfig)[] = ['berufe', 'taetigkeiten', 'skills', 'softskills', 'ausbildung'];
  
  for (const m of mappings.filter((m) => m.isActive && validCategories.includes(m.category as keyof ProfileConfig))) {
    try {
      const { data } = await supabase.from(m.tableName).select(m.columnName);
      const values = (data as Record<string, unknown>[]).map((r) =>
        String(r[m.columnName] ?? '')
      );
      result[m.category] = [...result[m.category], ...values];
    } catch (err) {
      console.error('Error loading profile suggestions:', err);
    }
  }

  return result;
}

async function getSuggestionsFor(
  category: ProfileSourceMapping['category'],
  mappings: ProfileSourceMapping[]
): Promise<string[]> {
  // Check if Supabase is properly configured
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured, returning empty suggestions for category:', category);
    return [];
  }

  const suggestions: string[] = [];
  for (const m of mappings.filter(
    (m) => m.isActive && m.category === category
  )) {
    try {
      const { data, error } = await supabase.from(m.tableName).select(m.columnName);
      if (error) {
        console.error('Error loading suggestions for category:', category, error);
        continue;
      }
      const values = (data as Record<string, unknown>[]).map((r) =>
        String(r[m.columnName] ?? '')
      );
      suggestions.push(...values);
    } catch (err) {
      console.error('Error loading suggestions:', err);
    }
  }
  return suggestions;
}

export async function loadCVSuggestions(
  mappings: ProfileSourceMapping[]
): Promise<CVSuggestionConfig> {
  const relevant = mappings.filter((m) =>
    ['companies', 'positions', 'aufgabenbereiche'].includes(m.category)
  );

  const companies = await getSuggestionsFor('companies', relevant);
  const positions = await getSuggestionsFor('positions', relevant);
  const aufgabenbereiche = await getSuggestionsFor('aufgabenbereiche', relevant);

  return { companies, positions, aufgabenbereiche };
}

async function testSupabaseConnection(): Promise<boolean> {
  const { error } = await supabase.from('ki_settings').select('id').limit(1);
  if (error) {
    console.error('Fehler beim Testen der Supabase-Verbindung:', error.message);
    return false;
  }
  return true;
}


async function fetchTableColumns(tableName: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('available_columns')
    .select('column_name')
    .eq('table_name', tableName)
    .order('column_name');

  if (error) {
    console.error('Error fetching table columns:', error.message);
    return [];
  }

  return (data as { column_name: string }[]).map((row) => row.column_name);
}

export {
  loadKIConfigs,
  saveKIConfigs,
  isSupabaseConfigured,
  loadProfileSuggestions,
  testSupabaseConnection,
  fetchTableColumns,
  getSupabaseTableNames,
  invalidateTableCache,
  getTableColumns,
  testTableColumnMapping,
  getDatabaseStats,
  getFieldMappings,
  getPromptTemplates,
};
