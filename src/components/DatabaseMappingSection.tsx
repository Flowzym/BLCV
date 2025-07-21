import React, { useState, useEffect, useCallback } from 'react';
import { Database as DatabaseIcon, Plus, Trash2 } from 'lucide-react';
import { getFieldMappings } from '../services/supabaseService';
import { supabase } from '../lib/supabase';

interface MappingRow {
  dbField: string;
  appField: string;
}

const STORAGE_KEY = 'databaseMapping';

// Helper function moved outside component to prevent re-creation
const loadInitial = () => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      return {
        tableName: parsed.tableName || '',
        isActive: parsed.isActive ?? true,
        mappings: Array.isArray(parsed.mappings) ? parsed.mappings : []
      };
    }
  } catch {
    // ignore
  }
  return { tableName: '', isActive: true, mappings: [] as MappingRow[] };
};

function DatabaseMappingSection() {
  // Use lazy initial state to prevent re-execution
  const [state, setState] = useState(loadInitial);
  const { tableName, isActive, mappings } = state;
  
  const [availableTables, setAvailableTables] = useState<string[]>([]);
  const [availableColumns, setAvailableColumns] = useState<string[]>([]);
  const [tableColumns, setTableColumns] = useState<Record<string, string[]>>({});
  const [error, setError] = useState<string>('');
  const [counts, setCounts] = useState<Record<number, number | null>>({});

  useEffect(() => {
    const loadMappings = async () => {
      try {
        const mappings = await getFieldMappings();
        const grouped: Record<string, string[]> = {};
        mappings.forEach((m: Record<string, unknown>) => {
          const table = m.table_name || m.table;
          const field = m.field_name || m.column_name;
          if (!table || !field) return;
          if (!grouped[table]) grouped[table] = [];
          if (!grouped[table].includes(field)) grouped[table].push(field);
        });
        setTableColumns(grouped);
        setAvailableTables(Object.keys(grouped));
      } catch (error) {
        console.error('Error loading field mappings:', error);
        setError('Fehler beim Laden der Feld-Zuordnungen');
      }
    };

    loadMappings();
  }, []);

  useEffect(() => {
    if (!tableName) {
      setAvailableColumns([]);
      return;
    }
    setAvailableColumns(tableColumns[tableName] || []);
  }, [tableName, tableColumns]);

  useEffect(() => {
    const loadCounts = async () => {
      if (!tableName) {
        setCounts({});
        return;
      }
      const newCounts: Record<number, number | null> = {};
      await Promise.all(
        mappings.map(async (row, idx) => {
          if (!row.dbField) {
            newCounts[idx] = null;
            return;
          }
          try {
            const { count, error } = await supabase
              .from(tableName)
              .select(row.dbField, { count: 'exact', head: true });
            if (error) {
              console.error('Error loading count for', row.dbField, error);
              newCounts[idx] = null;
            } else {
              newCounts[idx] = count ?? 0;
            }
          } catch (err) {
            console.error('Count fetch failed', err);
            newCounts[idx] = null;
          }
        })
      );
      setCounts(newCounts);
    };

    loadCounts();
  }, [tableName, mappings]);

  const updateRow = useCallback((index: number, field: keyof MappingRow, value: string) => {
    setState(prev => ({
      ...prev,
      mappings: prev.mappings.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    }));
  }, []);

  const addRow = useCallback(() => {
    setState(prev => ({
      ...prev,
      mappings: [...prev.mappings, { dbField: '', appField: '' }]
    }));
  }, []);

  const removeRow = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      mappings: prev.mappings.filter((_, i) => i !== index)
    }));
  }, []);

  const handleSave = useCallback(() => {
    if (tableName && availableColumns.length > 0) {
      const invalid = mappings.some(
        row => row.dbField && !availableColumns.includes(row.dbField)
      );
      if (invalid) {
        setError('Einige Datenbankfelder existieren nicht');
        return;
      }
    }

    setError('');
    const data = { tableName, isActive, mappings };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (err) {
      console.error('Failed to save mapping', err);
    }
  }, [tableName, isActive, mappings, availableColumns]);

  const setTableName = useCallback((newTableName: string) => {
    setState(prev => ({ ...prev, tableName: newTableName }));
  }, []);

  const setIsActive = useCallback((newIsActive: boolean) => {
    setState(prev => ({ ...prev, isActive: newIsActive }));
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 space-y-4">
      <div className="flex items-center space-x-3">
        <DatabaseIcon className="h-6 w-6" style={{ color: '#F29400' }} />
        <h3 className="text-lg font-medium text-gray-900">Datenbank-Zuordnung</h3>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Tabellenname</label>
        <select
          value={tableName}
          onChange={e => setTableName(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
          style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
        >
          <option value="">Tabelle wählen</option>
          {availableTables.map(name => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={isActive}
          onChange={e => setIsActive(e.target.checked)}
          className="rounded border-gray-300"
          style={{ accentColor: '#F29400' }}
        />
        <span className="text-sm">Mapping aktiv</span>
      </label>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2 text-sm font-medium text-gray-700">
          <span>Datenbankfeld</span>
          <span>App-Feld</span>
          <span className="text-right">Einträge</span>
        </div>
        {mappings.map((row, index) => (
          <div key={index} className="grid grid-cols-3 gap-2 items-center">
            <div>
              <select
                value={row.dbField}
                onChange={e => updateRow(index, 'dbField', e.target.value)}
                className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
              >
                <option value="">Feld wählen</option>
                {availableColumns.map(col => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={row.appField}
                onChange={e => updateRow(index, 'appField', e.target.value)}
                className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2"
                style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
              />
              <button
                onClick={() => removeRow(index)}
                className="p-1 text-red-600 hover:text-red-800"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <div className="text-right text-sm">
              {counts[index] === null || counts[index] === undefined
                ? '?'
                : `${counts[index]} Einträge`}
            </div>
          </div>
        ))}
        <button
          onClick={addRow}
          className="flex items-center space-x-1 text-sm text-white px-3 py-1 rounded-md"
          style={{ backgroundColor: '#F29400' }}
        >
          <Plus className="h-4 w-4" />
          <span>Zeile hinzufügen</span>
        </button>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="text-right">
        <button
          onClick={handleSave}
          className="px-4 py-2 text-white rounded-md"
          style={{ backgroundColor: '#F29400' }}
        >
          Speichern
        </button>
      </div>
    </div>
  );}
export default React.memo(DatabaseMappingSection);
