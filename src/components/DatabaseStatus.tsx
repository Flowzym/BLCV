import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import {
  isSupabaseConfigured,
  testSupabaseConnection
} from '../services/supabaseService';

function DatabaseStatus() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [connStatus, setConnStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const checkStatus = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Supabase is configured
      const configured = isSupabaseConfigured();
      setIsConfigured(configured);
      
      if (configured) {
        const connected = await testSupabaseConnection();
        setIsConnected(connected);
      }
    } catch (err) {
      console.error('Database status check failed:', err);
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleTestSupabase = useCallback(async () => {
    setConnStatus('loading');
    try {
      const ok = await testSupabaseConnection();
      setConnStatus(ok ? 'success' : 'error');
    } catch (err) {
      console.error('Supabase test error:', err);
      setConnStatus('error');
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 mb-8">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-semibold">Datenbankstatus</h2>
        <div className="flex gap-2">
          <button
            onClick={handleTestSupabase}
            disabled={connStatus === 'loading'}
            className={`px-3 py-1 text-sm h-8 rounded-md text-white ${
              connStatus === 'success'
                ? 'bg-green-600'
                : connStatus === 'error'
                ? 'bg-red-600'
                : 'bg-blue-600'
            }`}
          >
            {connStatus === 'success'
              ? 'Verbindung erfolgreich'
              : connStatus === 'error'
              ? 'Verbindung fehlgeschlagen'
              : 'Supabase testen'}
          </button>
          <button
            onClick={checkStatus}
            disabled={isLoading}
            className="px-3 py-1 text-sm h-8 bg-blue-600 text-white hover:bg-blue-700 rounded-md transition-colors duration-200 disabled:opacity-50"
          >
            Aktualisieren
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {/* Configuration Status */}
        <div className="flex items-center space-x-3">
          {isConfigured ? (
            <CheckCircle className="h-5 w-5" style={{ color: '#F29400' }} />
          ) : (
            <XCircle className="h-5 w-5" style={{ color: '#F29400' }} />
          )}
          <span className="font-medium">
            Supabase-Konfiguration: {isConfigured ? 'Konfiguriert' : 'Nicht konfiguriert'}
          </span>
        </div>

        {/* Connection Status */}
        {isConfigured && (
          <div className="flex items-center space-x-3">
            {isConnected ? (
              <CheckCircle className="h-5 w-5" style={{ color: '#F29400' }} />
            ) : (
              <XCircle className="h-5 w-5" style={{ color: '#F29400' }} />
            )}
            <span className="font-medium">
              Datenbankverbindung: {isConnected ? 'Verbunden' : 'Nicht verbunden'}
            </span>
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
          </div>
        )}

      </div>
    </div>
  );}
export default React.memo(DatabaseStatus);
