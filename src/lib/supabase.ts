import { createClient } from '@supabase/supabase-js';

// Supabase-Konfiguration mit Validierung
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validierung der Umgebungsvariablen
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase-Konfiguration:', {
    hasUrl: !!supabaseUrl,
    hasKey: !!supabaseAnonKey,
    urlValue: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'undefined',
    keyValue: supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : 'undefined'
  });
  
  throw new Error(
    'Supabase-Konfiguration fehlt!\n\n' +
    'Bitte erstellen Sie eine .env-Datei im Projekt-Root mit:\n' +
    'VITE_SUPABASE_URL=https://ihr-projekt.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=ihr-anon-key\n\n' +
    'Oder setzen Sie die Variablen in den Bolt Environment Variables.\n\n' +
    `Aktueller Status: URL=${!!supabaseUrl}, KEY=${!!supabaseAnonKey}`
  );
}

// Zusätzliche Validierung der URL-Format
if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
  throw new Error(
    `Ungültige Supabase URL: "${supabaseUrl}"\n` +
    'Erwartetes Format: https://ihr-projekt-id.supabase.co'
  );
}

// Zusätzliche Validierung des API-Keys
if (supabaseAnonKey.length < 100) {
  console.warn('Supabase Anon Key scheint zu kurz zu sein. Bitte überprüfen Sie den Key.');
}

// Supabase-Client erstellen
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: {
      'X-Client-Info': 'bewerbungsschreiben-generator@1.0.0'
    }
  }
});

// Verbindungstest beim Import (nur in Development)
if (import.meta.env.DEV) {
  supabase.from('ki_settings').select('id').limit(1)
    .then(({ error }) => {
      if (error) {
        console.warn('Supabase-Verbindungstest fehlgeschlagen:', error.message);
        console.warn('Die App funktioniert weiterhin, aber Supabase-Features sind nicht verfügbar.');
      } else {
        console.log('✅ Supabase-Verbindung erfolgreich getestet');
      }
    })
    .catch((err) => {
      console.warn('Supabase-Verbindungstest-Fehler:', err);
    });
}
