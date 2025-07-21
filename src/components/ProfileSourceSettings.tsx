import React, { useState, useEffect, useCallback } from 'react';
import { Database, Plus, Trash2, X, AlertCircle, RefreshCw, TestTube } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { 
  getSupabaseTableNames, 
  ProfileSourceMapping, 
  SupabaseTable, 
  testTableColumnMapping,
  invalidateTableCache,
  getTableColumns
} from '../services/supabaseService';

interface ProfileSourceSettingsProps {
  sourceMappings: ProfileSourceMapping[];
  onSourceMappingsChange: (mappings: ProfileSourceMapping[]) => void;
}

const CATEGORY_LABELS = {
  berufe: 'Berufe',
  taetigkeiten: 'Tätigkeiten',
  skills: 'Fachliche Kompetenzen',
  softskills: 'Persönliche Kompetenzen',
  ausbildung: 'Ausbildung/Qualifikationen',
  companies: 'Firmen',
  positions: 'Positionen',
  aufgabenbereiche: 'Aufgabenbereiche'
};

function ProfileSourceSettings({
  sourceMappings,
  onSourceMappingsChange
}: ProfileSourceSettingsProps) {
  const [availableTables, setAvailableTables] = useState<SupabaseTable[]>([]);
  const [isLoadingTables, setIsLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNewMappingForm, setShowNewMappingForm] = useState(false);
  const [newMapping, setNewMapping] = useState<Partial<ProfileSourceMapping>>({
    category: 'berufe',
    tableName: '',
    columnName: '',
    isActive: true
  });
  // store results of mapping tests keyed by `table.column`
  const [testResults, setTestResults] = useState<Record<string, {
    success: boolean;
    sampleData: string[];
    error?: string;
  }>>({});
  const [isTestingMapping, setIsTestingMapping] = useState<string | null>(null);
  const [isLoadingColumns, setIsLoadingColumns] = useState<string | null>(null);
  const [lastRefreshTime, setLastRefreshTime] = useState<Date | null>(null);

  const useColumnCount = (table: string, column: string) => {
    const [count, setCount] = useState<number | null | undefined>(undefined);

    useEffect(() => {
      let cancelled = false;
      const load = async () => {
        if (!table || !column) {
          setCount(null);
          return;
        }
        try {
          const { count: c, error } = await supabase
            .from(table)
            .select(column, { count: 'exact', head: true });
          if (!cancelled) {
            if (error) {
              console.error('Error loading count for', table, column, error);
              setCount(null);
            } else {
              setCount(c ?? 0);
            }
          }
        } catch (err) {
          if (!cancelled) {
            console.error('Count fetch failed', err);
            setCount(null);
          }
        }
      };
      load();
      return () => {
        cancelled = true;
      };
    }, [table, column]);

    return count;
  };

  const ColumnCount: React.FC<{ table: string; column: string }> = ({ table, column }) => {
    const count = useColumnCount(table, column);
    return (
      <span className="text-slate-600 text-sm ml-2">
        {count === undefined
          ? '?'
          : count === null
          ? 'keine Daten'
          : `${count} Einträge`}
      </span>
    );
  };

  const loadTables = useCallback(async (forceRefresh: boolean = false) => {
    setIsLoadingTables(true);
    setError(null);
    
    if (forceRefresh) {
      invalidateTableCache();
      console.log('Cache invalidated, forcing refresh');
    }
    
    try {
      console.log('Loading tables with forceRefresh:', forceRefresh);
      const tables = await getSupabaseTableNames(forceRefresh);
      console.log('Loaded tables:', tables);
      setAvailableTables(tables);
      setLastRefreshTime(new Date());
      
      if (tables.length === 0) {
        setError('Keine Tabellen gefunden. Überprüfen Sie Ihre Datenbankverbindung oder erstellen Sie neue Tabellen in Supabase.');
      } else {
        setError(null);
      }
    } catch (err) {
      console.error('Error loading tables:', err);
      setError('Fehler beim Laden der Tabellen. Überprüfen Sie Ihre Datenbankverbindung.');
    } finally {
      setIsLoadingTables(false);
    }
  }, []);

  const refreshTableColumns = useCallback(async (tableName: string) => {
    setIsLoadingColumns(tableName);
    try {
      console.log(`Refreshing columns for table: ${tableName}`);
      const columns = await getTableColumns(tableName);
      console.log(`Columns for ${tableName}:`, columns);
      
      setAvailableTables(prev => 
        prev.map(table => 
          table.table_name === tableName 
            ? { ...table, columns }
            : table
        )
      );
    } catch (error) {
      console.error('Error refreshing columns for table:', tableName, error);
    } finally {
      setIsLoadingColumns(null);
    }
  }, []);

  useEffect(() => {
    loadTables();
  }, [loadTables]);

  const addMapping = useCallback(() => {
    if (!newMapping.category || !newMapping.tableName || !newMapping.columnName) {
      return;
    }

    const mapping: ProfileSourceMapping = {
      category: newMapping.category as ProfileSourceMapping['category'],
      tableName: newMapping.tableName,
      columnName: newMapping.columnName,
      isActive: newMapping.isActive || true
    };

    onSourceMappingsChange([...sourceMappings, mapping]);
    setNewMapping({
      category: 'berufe',
      tableName: '',
      columnName: '',
      isActive: true
    });
    setShowNewMappingForm(false);
  }, [newMapping, sourceMappings, onSourceMappingsChange]);

  const removeMapping = useCallback((index: number) => {
    const newMappings = sourceMappings.filter((_, i) => i !== index);
    onSourceMappingsChange(newMappings);
  }, [sourceMappings, onSourceMappingsChange]);

  const toggleMappingActive = useCallback((index: number) => {
    const newMappings = sourceMappings.map((mapping, i) => 
      i === index ? { ...mapping, isActive: !mapping.isActive } : mapping
    );
    onSourceMappingsChange(newMappings);
  }, [sourceMappings, onSourceMappingsChange]);

  const testMapping = useCallback(async (mapping: ProfileSourceMapping) => {
    const testKey = `${mapping.tableName}.${mapping.columnName}`;
    setIsTestingMapping(testKey);
    
    try {
      console.log(`Testing mapping: ${testKey}`);
      const result = await testTableColumnMapping(mapping.tableName, mapping.columnName);
      console.log(`Test result for ${testKey}:`, result);
      
      setTestResults(prev => ({
        ...prev,
        [testKey]: result
      }));
    } catch (error) {
      console.error(`Test error for ${testKey}:`, error);
      setTestResults(prev => ({
        ...prev,
        [testKey]: {
          success: false,
          sampleData: [],
          error: 'Unerwarteter Fehler beim Testen'
        }
      }));
    } finally {
      setIsTestingMapping(null);
    }
  }, []);

  const getSelectedTable = useCallback(() => {
    return availableTables.find(table => table.table_name === newMapping.tableName);
  }, [availableTables, newMapping.tableName]);

  const handleTableChange = useCallback(async (tableName: string) => {
    setNewMapping({ ...newMapping, tableName, columnName: '' });
    
    // Aktualisiere Spalten für die ausgewählte Tabelle
    if (tableName) {
      await refreshTableColumns(tableName);
    }
  }, [newMapping, refreshTableColumns]);


  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Datenquellen-Zuordnungen</h3>
          {lastRefreshTime && (
            <p className="text-xs text-gray-500 mt-1">
              Letzte Aktualisierung: {lastRefreshTime.toLocaleTimeString('de-DE')}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => loadTables(true)}
            disabled={isLoadingTables}
            className="flex items-center space-x-2 px-3 py-1 text-sm h-8 text-white hover:opacity-90 rounded-lg transition-colors duration-200 disabled:opacity-50"
            style={{ backgroundColor: '#F29400' }}
            title="Lädt alle Tabellen neu und invalidiert den Cache"
          >
            <RefreshCw className={`h-4 w-4 ${isLoadingTables ? 'animate-spin' : ''}`} />
            <span>Tabellen neu laden</span>
          </button>
          <button
            onClick={() => setShowNewMappingForm(true)}
            className="flex items-center space-x-2 px-3 py-1 text-sm h-8 text-white rounded-lg transition-colors duration-200"
            style={{ backgroundColor: '#F29400' }}
          >
            <Plus className="h-4 w-4" />
            <span>Neue Zuordnung</span>
          </button>
        </div>
      </div>

      {/* Loading Indicator */}
      {isLoadingTables && (
        <div className="border rounded-lg p-4" style={{ backgroundColor: '#FEF7EE', borderColor: '#F29400' }}>
          <div className="flex items-center space-x-2" style={{ color: '#F29400' }}>
            <RefreshCw className="h-5 w-5 animate-spin" />
            <p className="font-medium">Tabellen werden geladen...</p>
          </div>
          <p className="text-sm mt-1" style={{ color: '#F29400' }}>
            Dies kann einen Moment dauern, da alle verfügbaren Tabellen erkannt werden.
          </p>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700">
            <AlertCircle className="h-5 w-5 flex-shrink-0" style={{ color: '#F29400' }} />
            <p className="font-medium">Fehler:</p>
          </div>
          <p className="text-red-600 mt-1">{error}</p>
          <div className="mt-3">
            <button
              onClick={() => loadTables(true)}
              className="text-sm bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded transition-colors duration-200"
            >
              Erneut versuchen
            </button>
          </div>
        </div>
      )}


      {/* New Mapping Form */}
      {showNewMappingForm && (
        <div className="border rounded-lg p-4" style={{ backgroundColor: '#FEF7EE', borderColor: '#F29400' }}>
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-medium" style={{ color: '#F29400' }}>Neue Datenquellen-Zuordnung</h4>
            <button
              onClick={() => setShowNewMappingForm(false)}
              className="text-gray-600 hover:text-gray-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Profilkategorie</label>
                <select
                  value={newMapping.category || 'berufe'}
                  onChange={(e) => setNewMapping({ ...newMapping, category: e.target.value as ProfileSourceMapping['category'] })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
                >
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tabelle</label>
                <select
                  value={newMapping.tableName || ''}
                  onChange={(e) => handleTableChange(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
                  style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
                >
                  <option value="">Tabelle auswählen...</option>
                  {availableTables.map(table => (
                    <option key={table.table_name} value={table.table_name}>
                      {table.table_name} ({table.columns.length} Spalten)
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-gray-700">Spalte</label>
                  {newMapping.tableName && (
                    <button
                      onClick={() => refreshTableColumns(newMapping.tableName!)}
                      disabled={isLoadingColumns === newMapping.tableName}
                      className="text-xs hover:opacity-80 flex items-center space-x-1"
                      style={{ color: '#F29400' }}
                      title="Spalten neu laden"
                    >
                      <RefreshCw className={`h-3 w-3 ${isLoadingColumns === newMapping.tableName ? 'animate-spin' : ''}`} />
                      <span>Aktualisieren</span>
                    </button>
                  )}
                </div>
                <select
                  value={newMapping.columnName || ''}
                  onChange={(e) => setNewMapping({ ...newMapping, columnName: e.target.value })}
                  disabled={!newMapping.tableName || isLoadingColumns === newMapping.tableName}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 disabled:opacity-50"
                  style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
                >
                  <option value="">
                    {isLoadingColumns === newMapping.tableName ? 'Spalten werden geladen...' : 'Spalte auswählen...'}
                  </option>
                  {getSelectedTable()?.columns.map(column => (
                    <option key={column} value={column}>
                      {column}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="newMappingActive"
                checked={newMapping.isActive || false}
                onChange={(e) => setNewMapping({ ...newMapping, isActive: e.target.checked })}
                className="focus:ring-2"
                style={{ accentColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
              />
              <label htmlFor="newMappingActive" className="text-sm text-gray-700">
                Zuordnung sofort aktivieren
              </label>
            </div>
            
            <button
              onClick={addMapping}
              disabled={!newMapping.category || !newMapping.tableName || !newMapping.columnName}
              className="px-4 py-2 text-white disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors duration-200"
              style={{ backgroundColor: '#F29400' }}
            >
              Zuordnung hinzufügen
            </button>
          </div>
        </div>
      )}

      {/* Existing Mappings */}
      <div className="space-y-4">
        <h4 className="font-medium text-gray-900">Konfigurierte Zuordnungen ({sourceMappings.length})</h4>
        
        {sourceMappings.length === 0 ? (
          <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <Database className="h-12 w-12 mx-auto mb-3" style={{ color: '#F29400' }} />
            <p className="text-gray-600">Noch keine Datenquellen-Zuordnungen konfiguriert</p>
            <p className="text-sm text-gray-500 mt-1">
              Fügen Sie Zuordnungen hinzu, um Daten aus verschiedenen Tabellen zu laden.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {sourceMappings.map((mapping, index) => {
              const testKey = `${mapping.tableName}.${mapping.columnName}`;
              const testResult = testResults[testKey];
              
              return (
                <div key={index} className={`border rounded-lg p-4 ${
                  mapping.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          mapping.isActive 
                            ? 'text-white' 
                            : 'bg-gray-100 text-gray-600'
                        }`}
                        style={mapping.isActive ? { backgroundColor: '#F29400' } : {}}
                        >
                          {CATEGORY_LABELS[mapping.category]}
                        </span>
                        <span className="font-medium text-gray-900">
                          {mapping.tableName}.{mapping.columnName}
                        </span>
                        <ColumnCount table={mapping.tableName} column={mapping.columnName} />
                        {mapping.isActive && (
                          <span className="px-2 py-1 text-white text-xs rounded-full" style={{ backgroundColor: '#F29400' }}>
                            Aktiv
                          </span>
                        )}
                      </div>
                      
                      {/* Test Results */}
                      {testResult && (
                        <div className={`mt-2 p-2 rounded text-xs ${
                          testResult.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {testResult.success ? (
                            <div>
                              <div className="font-medium">✓ Test erfolgreich</div>
                              {testResult.sampleData.length > 0 && (
                                <div className="mt-1">
                                  <strong>Beispieldaten ({testResult.sampleData.length}):</strong> {testResult.sampleData.slice(0, 3).join(', ')}
                                  {testResult.sampleData.length > 3 && '...'}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div>
                              <div className="font-medium">✗ Test fehlgeschlagen</div>
                              <div className="mt-1">{testResult.error}</div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => testMapping(mapping)}
                        disabled={isTestingMapping === testKey}
                        className="px-3 py-1 bg-purple-100 text-purple-800 hover:bg-purple-200 rounded-md text-xs transition-colors duration-200 disabled:opacity-50"
                        title="Zuordnung testen"
                      >
                        {isTestingMapping === testKey ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <TestTube className="h-3 w-3" />
                        )}
                      </button>
                      <button
                        onClick={() => toggleMappingActive(index)}
                        className={`px-3 py-1 text-xs rounded-md transition-colors duration-200 ${
                          mapping.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {mapping.isActive ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                      <button
                        onClick={() => removeMapping(index)}
                        className="p-1 hover:opacity-80"
                        style={{ color: '#F29400' }}
                        title="Zuordnung löschen"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );}
export default React.memo(ProfileSourceSettings);
