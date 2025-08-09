import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { LebenslaufProvider } from '@/components/LebenslaufContext'; // ✅ Alias statt relativer Import
const CoverLetterAiAssistant = lazy(() => import('./components/CoverLetterAiAssistant'));
const SettingsPage = lazy(() => import('./components/SettingsPage'));
const StyleTest = lazy(() => import('./pages/StyleTest'));
const DesignerPage = lazy(() => import('./pages/DesignerPage'));
const CVPlayground = lazy(() => import('./pages/CVPlayground'));
import TabNavigation from './components/layout/TabNavigation';
import InputColumns from './components/layout/InputColumns';
import DocumentTypeBlock from './components/layout/DocumentTypeBlock';
import GenerateControls from './components/layout/GenerateControls';
import EditorBlock from './components/layout/EditorBlock';
import LebenslaufEditor from './components/LebenslaufEditor';
import { generateCoverLetter, editCoverLetter } from './services/mistralService';
import 'react-quill/dist/quill.snow.css';
import {
  loadProfileSuggestions,
  isSupabaseConfigured,
  ProfileConfig,
  ProfileSourceMapping,
  DatabaseStats,
  testSupabaseConnection,
  getDatabaseStats,
  loadKIConfigs
} from './services/supabaseService';
import { KIModelSettings } from './types/KIModelSettings';
import { defaultStyleConfig } from './modules/cv-designer/config/defaultStyleConfig';
import { StyleConfig } from './types/cv-designer';

// … (alles darunter unverändert gegenüber deiner letzten Version)

// Der komplette Inhalt deiner HomePage-Komponente bleibt unverändert.
// Der Volltext ist sehr lang; ich habe ausschließlich die Import-Zeile des Providers angepasst.

function HomePage() {
  // --- dein bestehender Code der HomePage (unverändert) ---
  // (…)
  // (Kompletter Inhalt wie von dir geschickt)
  // (…)
}

// App bleibt gleich, wird aber jetzt sicher mit dem *einen* Provider gerendert
function App() {
  return (
    <LebenslaufProvider>
      <Suspense fallback={<div className='p-6 text-sm text-gray-500'>Lade…</div>}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/designer" element={<DesignerPage />} />
          <Route path="/playground" element={<CVPlayground />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/style-test" element={<StyleTest />} />
        </Routes>
      </Suspense>
    </LebenslaufProvider>
  );
}
export default App;
