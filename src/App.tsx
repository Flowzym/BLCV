import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { Settings } from 'lucide-react';
import { LebenslaufProvider } from './components/LebenslaufContext';
import CoverLetterAiAssistant from './components/CoverLetterAiAssistant';
import SettingsPage from './components/SettingsPage';
import StyleTest from './pages/StyleTest';
import DesignerPage from './pages/DesignerPage';
import CVPlayground from './pages/CVPlayground';
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

const DEFAULT_DOCUMENT_TYPES = {
  standard: {
    label: 'Normales Bewerbungsschreiben',
    prompt: `Du bist ein Experte für Bewerbungsschreiben. Erstelle ein professionelles, individuelles Bewerbungsschreiben basierend auf folgenden Informationen:

Erstelle ein überzeugendes Bewerbungsschreiben, das:
- Die relevanten Erfahrungen und Fähigkeiten aus dem Lebenslauf hervorhebt
- Konkret auf die Anforderungen der Stellenanzeige eingeht
- Professionell und authentisch klingt
- Eine klare Struktur mit Einleitung, Hauptteil und Schluss hat
- Motivation und Interesse für die Position zum Ausdruck bringt

Das Bewerbungsschreiben soll in deutscher Sprache verfasst werden und professionellen Standards entsprechen.`
  },
  berufsfern: {
    label: 'Bewerbung für berufsferne Stellen',
    prompt: `Du bist ein Experte für Bewerbungsschreiben. Erstelle ein professionelles Bewerbungsschreiben für eine berufsferne Stelle basierend auf folgenden Informationen:

Erstelle ein überzeugendes Bewerbungsschreiben, das:
- Transferable Skills und übertragbare Kompetenzen aus dem bisherigen Werdegang hervorhebt
- Motivation für den Berufswechsel authentisch begründet
- Lernbereitschaft und Anpassungsfähigkeit betont
- Soft Skills und persönliche Eigenschaften in den Vordergrund stellt
- Zeigt, wie bisherige Erfahrungen in neuen Kontext übertragen werden können
- Interesse an der neuen Branche/dem neuen Bereich glaubhaft vermittelt

Das Bewerbungsschreiben soll trotz berufsferner Ausrichtung professionell und überzeugend wirken.`
  },
  initiativ: {
    label: 'Initiativbewerbung',
    prompt: `Du bist ein Experte für Bewerbungsschreiben. Erstelle ein professionelles Initiativbewerbungsschreiben basierend auf folgenden Informationen:

Erstelle ein überzeugendes Initiativbewerbungsschreiben, das:
- Eigeninitiative und proaktives Handeln demonstriert
- Interesse am Unternehmen und dessen Werten/Zielen zeigt
- Mehrwert für das Unternehmen klar kommuniziert
- Flexibilität bezüglich verschiedener Einsatzbereiche ausdrückt
- Motivation für die Kontaktaufnahme überzeugend begründet
- Bereitschaft für ein Kennenlerngespräch signalisiert
- Auch ohne konkrete Stellenausschreibung professionell wirkt

Das Initiativbewerbungsschreiben soll neugierig machen und zum Gespräch einladen.`
  },
  ausbildung: {
    label: 'Motivationsschreiben für Ausbildung',
    prompt: `Du bist ein Experte für Bewerbungsschreiben. Erstelle ein professionelles Motivationsschreiben für eine Ausbildung basierend auf folgenden Informationen:

Erstelle ein überzeugendes Motivationsschreiben, das:
- Motivation für die gewählte Ausbildung authentisch begründet
- Interesse am Berufsbild und der Branche zeigt
- Lernbereitschaft und Engagement hervorhebt
- Relevante Vorerfahrungen (Praktika, Schule, Hobbys) einbezieht
- Persönliche Stärken und Eigenschaften für die Ausbildung betont
- Ziele und Vorstellungen für die berufliche Zukunft ausdrückt
- Begeisterung für praktisches Lernen und Arbeiten vermittelt

Das Motivationsschreiben soll jugendlich-authentisch, aber dennoch professionell wirken.`
  },
  praktikum: {
    label: 'Bewerbung für Praktikum',
    prompt: `Du bist ein Experte für Bewerbungsschreiben. Erstelle ein professionelles Praktikumsbewerbungsschreiben basierend auf folgenden Informationen:

Erstelle ein überzeugendes Praktikumsbewerbungsschreiben, das:
- Lernziele und Interesse am Praktikumsbereich klar definiert
- Motivation für das spezifische Unternehmen/die Organisation zeigt
- Bisherige relevante Erfahrungen (auch aus Schule/Studium) einbezieht
- Bereitschaft zu lernen und sich einzubringen betont
- Praktische Anwendung von theoretischem Wissen anstrebt
- Flexibilität und Anpassungsfähigkeit ausdrückt
- Dankbarkeit für die Lernmöglichkeit vermittelt

Das Praktikumsbewerbungsschreiben soll motiviert und lernbegierig wirken.`
  },
  aqua: {
    label: 'Arbeitsplatznahe Qualifizierung (AQUA)',
    prompt: `Du bist ein Experte für Bewerbungsschreiben. Erstelle ein professionelles Bewerbungsschreiben für eine arbeitsplatznahe Qualifizierung (AQUA) basierend auf folgenden Informationen:

Erstelle ein überzeugendes Bewerbungsschreiben, das:
- Motivation für berufliche Weiterentwicklung und Qualifizierung zeigt
- Bereitschaft zur Veränderung und zum Lernen betont
- Bisherige Berufserfahrung als Grundlage für Weiterentwicklung nutzt
- Interesse an praktischer, arbeitsplatznaher Qualifizierung ausdrückt
- Ziele für die berufliche Neuorientierung klar formuliert
- Engagement und Durchhaltevermögen vermittelt
- Dankbarkeit für die Förderungsmöglichkeit zeigt

Das Bewerbungsschreiben soll Entwicklungspotential und Motivation für berufliche Neuausrichtung vermitteln.`
  }
};

const DEFAULT_EDIT_PROMPTS = {
  shorter: { 
    label: 'Kürzer', 
    prompt: 'Mache den folgenden Text kürzer und prägnanter, ohne wichtige Informationen zu verlieren:' 
  },
  longer: { 
    label: 'Länger', 
    prompt: 'Erweitere den folgenden Text mit mehr Details und Ausführungen:' 
  },
  simpler: { 
    label: 'Einfacher', 
    prompt: 'Vereinfache die Sprache des folgenden Textes und verwende einfachere Wörter:' 
  },
  complex: { 
    label: 'Komplexer', 
    prompt: 'Verwende eine gehobenere und komplexere Sprache für den folgenden Text:' 
  },
  b1: { 
    label: 'B1-Niveau', 
    prompt: 'Schreibe den folgenden Text auf B1-Sprachniveau um (mittleres Deutsch):' 
  },
};

const DEFAULT_STYLE_PROMPTS = {
  sachlich: { 
    label: 'Sachlich/Klassisch', 
    prompt: 'sachlichen und klassischen Stil mit formeller, professioneller Sprache' 
  },
  motiviert: { 
    label: 'Motiviert', 
    prompt: 'motivierten und enthusiastischen Stil mit positiver, energiegeladener Sprache' 
  },
  unkonventionell: { 
    label: 'Unkonventionell', 
    prompt: 'unkonventionellen und kreativen Stil mit originellen Formulierungen' 
  },
  foerderkontext: { 
    label: 'Förderkontext', 
    prompt: 'für Fördermaßnahmen geeigneten Stil mit Betonung auf Entwicklungspotential und Lernbereitschaft' 
  },
  ausbildung: { 
    label: 'Ausbildung', 
    prompt: 'für Ausbildungsplätze passenden Stil mit Fokus auf Motivation und Lernwillen' 
  },
  aqua: { 
    label: 'AQUA', 
    prompt: 'für AQUA-Maßnahmen angemessenen Stil mit Betonung auf berufliche Neuorientierung' 
  },
  lehrstelle: { 
    label: 'Lehrstelle', 
    prompt: 'für Lehrstellen optimierten Stil mit Fokus auf praktisches Lernen und Engagement' 
  },
};

// Deprecated: fallback suggestions kept for offline mode
const DEFAULT_PROFILE_CONFIG: ProfileConfig = {
  berufe: [
    'Softwareentwickler', 'Projektmanager', 'Marketing Manager', 'Vertriebsmitarbeiter', 'Buchhalter',
    'Personalreferent', 'Grafik Designer', 'Kundenberater', 'Teamleiter', 'Sachbearbeiter',
    'Ingenieur', 'Techniker', 'Analyst', 'Berater', 'Koordinator', 'Verkäufer', 'Friseur',
    'Koch', 'Krankenpfleger', 'Lehrer', 'Mechaniker', 'Elektriker', 'Bauarbeiter', 'Reinigungskraft'
  ],
  taetigkeiten: [
    'Programmierung', 'Projektleitung', 'Kundenbetreuung', 'Datenanalyse', 'Qualitätssicherung',
    'Teamführung', 'Budgetplanung', 'Prozessoptimierung', 'Schulungen', 'Dokumentation',
    'Berichtswesen', 'Konzeptentwicklung', 'Marktanalyse', 'Verhandlungsführung', 'Präsentationen',
    'Verkauf', 'Beratung', 'Administration', 'Wartung', 'Installation'
  ],
  skills: [
    'Microsoft Office', 'Excel', 'PowerPoint', 'SAP', 'CRM-Systeme', 'SQL', 'Python', 'Java',
    'HTML/CSS', 'Adobe Creative Suite', 'AutoCAD', 'Projektmanagement-Tools', 'ERP-Systeme',
    'Datenbanken', 'Webentwicklung', 'Social Media Marketing', 'SEO/SEM', 'Buchhaltungssoftware',
    'Photoshop', 'Word', 'Outlook', 'PowerBI', 'Tableau'
  ],
  softskills: [
    'Teamfähigkeit', 'Kommunikationsstärke', 'Problemlösungskompetenz', 'Organisationstalent',
    'Flexibilität', 'Belastbarkeit', 'Eigeninitiative', 'Zuverlässigkeit', 'Kreativität',
    'Analytisches Denken', 'Empathie', 'Führungsqualitäten', 'Zeitmanagement', 'Lernbereitschaft',
    'Kundenorientierung', 'Konfliktfähigkeit', 'Präsentationsfähigkeiten', 'Verhandlungsgeschick',
    'Stressresistenz', 'Durchsetzungsvermögen'
  ],
  ausbildung: [
    'Bachelor Informatik', 'Master BWL', 'Ausbildung Kaufmann/-frau für Büromanagement', 'Fachhochschulreife',
    'Abitur', 'Realschulabschluss', 'Hauptschulabschluss', 'Promotion', 'MBA', 'Techniker',
    'Meister', 'IHK-Zertifikat', 'Sprachzertifikat', 'IT-Zertifizierung', 'Weiterbildung',
    'Umschulung', 'Praktikum', 'Volontariat', 'Trainee-Programm', 'Duales Studium',
    'Bachelor BWL', 'Master Informatik', 'Fachinformatiker', 'Industriekaufmann'
  ]
};

// Helper function to merge profile config with defaults
const loadProfileConfigFromStorage = () => {
  try {
    const saved = localStorage.getItem('profileConfig');
    if (!saved) {
      return DEFAULT_PROFILE_CONFIG;
    }
    
    const savedConfig = JSON.parse(saved);
    
    // Merge with defaults to ensure all required arrays exist
    const mergedConfig = {
      berufe: Array.isArray(savedConfig.berufe) ? savedConfig.berufe : DEFAULT_PROFILE_CONFIG.berufe,
      taetigkeiten: Array.isArray(savedConfig.taetigkeiten) ? savedConfig.taetigkeiten : DEFAULT_PROFILE_CONFIG.taetigkeiten,
      skills: Array.isArray(savedConfig.skills) ? savedConfig.skills : DEFAULT_PROFILE_CONFIG.skills,
      softskills: Array.isArray(savedConfig.softskills) ? savedConfig.softskills : DEFAULT_PROFILE_CONFIG.softskills,
      ausbildung: Array.isArray(savedConfig.ausbildung) ? savedConfig.ausbildung : DEFAULT_PROFILE_CONFIG.ausbildung,
    };
    
    return mergedConfig;
  } catch (error) {
    console.error('Error loading profileConfig from localStorage:', error);
    return DEFAULT_PROFILE_CONFIG;
  }
};

// Helper function to load profile source mappings from localStorage
const loadProfileSourceMappingsFromStorage = (): ProfileSourceMapping[] => {
  try {
    const saved = localStorage.getItem('profileSourceMappings');
    if (!saved) {
      return [];
    }
    
    const savedMappings = JSON.parse(saved);
    return Array.isArray(savedMappings) ? savedMappings : [];
  } catch (error) {
    console.error('Error loading profileSourceMappings from localStorage:', error);
    return [];
  }
};

// Helper functions for localStorage
function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const saved = localStorage.getItem(key);
    return saved ? (JSON.parse(saved) as T) : defaultValue;
  } catch (error) {
    console.error(`Error loading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

function HomePage() {
  const navigate = useNavigate();
  const [cvContent, setCvContent] = useState('');
  const [jobContent, setJobContent] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState('');
  const [databaseStats, setDatabaseStats] = useState<DatabaseStats | null>(null);
  
  // Load settings from localStorage with defaults
  const [documentTypes] = useState(() =>
    loadFromStorage('documentTypes', DEFAULT_DOCUMENT_TYPES)
  );
  const [selectedDocumentType, setSelectedDocumentType] = useState(() => 
    loadFromStorage('selectedDocumentType', 'standard')
  );
  const [editPrompts] = useState(() =>
    loadFromStorage('editPrompts', DEFAULT_EDIT_PROMPTS)
  );
  const [stylePrompts] = useState(() =>
    loadFromStorage('stylePrompts', DEFAULT_STYLE_PROMPTS)
  );
  const [profileConfig, setProfileConfig] = useState<ProfileConfig>(() => 
    loadProfileConfigFromStorage()
  );
  const [profileSourceMappings] = useState<ProfileSourceMapping[]>(() =>
    loadProfileSourceMappingsFromStorage()
  );
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [activeKIModel, setActiveKIModel] = useState<KIModelSettings | null>(null);

  // Add styleConfig state for the designer
  const [styleConfig, setStyleConfig] = useState<StyleConfig>(defaultStyleConfig);

  useEffect(() => {
    const fetchModels = async () => {
      try {
        const models = await loadKIConfigs();
        if (models.length > 0) {
          setActiveKIModel(models[0]);
        }
      } catch (err) {
        console.error('Failed to load KI configs:', err);
      }
    };
    fetchModels();
  }, []);


  // Load database statistics if Supabase is configured
  useEffect(() => {
    const loadStats = async () => {
      if (isSupabaseConfigured()) {
        try {
          const isConnected = await testSupabaseConnection();

          if (isConnected) {
            try {
              const stats = await getDatabaseStats(profileSourceMappings);
              setDatabaseStats(stats);
            } catch (error) {
              console.error('Failed to load database stats:', error);
            }
          }
        } catch {
          // Ignore connection errors; stats remain null
        }
      }
    };

    loadStats();
  }, [profileSourceMappings]);

  // Load profile suggestions from Supabase on component mount
  useEffect(() => {
    const loadProfileData = async () => {
        if (isSupabaseConfigured()) {
          try {
            console.log('Loading profile data with mappings:', profileSourceMappings);
            const supabaseConfig = await loadProfileSuggestions(profileSourceMappings);
            console.log('Loaded profile config:', supabaseConfig);
            setProfileConfig(supabaseConfig);
            // Don't save to localStorage when using Supabase
          } catch (error) {
            console.error('Failed to load profile suggestions from Supabase:', error);
            // Keep using localStorage fallback
          }
        }
      };

    loadProfileData();
  }, [profileSourceMappings]);

  // Save settings to localStorage whenever they change (except profileConfig when using Supabase)
  useEffect(() => {
    saveToStorage('documentTypes', documentTypes);
  }, [documentTypes]);

  useEffect(() => {
    saveToStorage('selectedDocumentType', selectedDocumentType);
  }, [selectedDocumentType]);

  useEffect(() => {
    saveToStorage('editPrompts', editPrompts);
  }, [editPrompts]);

  useEffect(() => {
    saveToStorage('stylePrompts', stylePrompts);
  }, [stylePrompts]);

  useEffect(() => {
    // Only save to localStorage if Supabase is not configured
    if (!isSupabaseConfigured()) {
      saveToStorage('profileConfig', profileConfig);
    }
  }, [profileConfig]);

  useEffect(() => {
    saveToStorage('profileSourceMappings', profileSourceMappings);
  }, [profileSourceMappings]);

  // Prevent Quill from auto-focusing on mount or when clicking outside
  useEffect(() => {
    const blurEditor = () => {
      const active = document.activeElement as HTMLElement | null;
      if (active && active.classList.contains('ql-editor')) {
        active.blur();
      }
    };

    blurEditor();

    const handleClick = (e: MouseEvent) => {
      const editor = document.querySelector('.ql-editor');
      if (editor && !editor.contains(e.target as Node)) {
        if (document.activeElement === editor) {
          (editor as HTMLElement).blur();
        }
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // ✅ KORRIGIERT: Memoisiere handleGenerate mit useCallback
  const handleGenerate = useCallback(async () => {
    if (!cvContent.trim() || !jobContent.trim()) {
      setError('Bitte füllen Sie sowohl den Lebenslauf als auch die Stellenanzeige aus.');
      return;
    }

    if (!activeKIModel || !activeKIModel.model) {
      setError('Fehler: Kein aktives Modell konfiguriert oder Modellbezeichnung fehlt.');
      return;
    }

    setIsGenerating(true);
    setError('');
    
    try {
      const basePrompt = documentTypes[selectedDocumentType]?.prompt || documentTypes.standard.prompt;
      
      const result = await generateCoverLetter({
        cvContent: cvContent.trim(),
        jobDescription: jobContent.trim(),
        basePrompt,
        styles: selectedStyles,
        stylePrompts: Object.fromEntries(
          Object.entries(stylePrompts).map(([key, value]) => [key, value.prompt])
        ),
        config: activeKIModel,
      });
      setCoverLetter(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein unerwarteter Fehler ist aufgetreten.');
    } finally {
      setIsGenerating(false);
    }
  }, [cvContent, jobContent, documentTypes, selectedDocumentType, selectedStyles, stylePrompts, activeKIModel]);

  // ✅ KORRIGIERT: Memoisiere handleEdit mit useCallback
  const handleEdit = useCallback(async (instruction: string) => {
    if (!coverLetter.trim()) return;

    if (!activeKIModel) {
      setError('Kein KI-Modell verfügbar.');
      return;
    }

    setIsEditing(true);
    setError('');
    
    try {
      const result = await editCoverLetter(coverLetter, instruction, activeKIModel);
      setCoverLetter(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler beim Bearbeiten ist aufgetreten.');
    } finally {
      setIsEditing(false);
    }
  }, [coverLetter, activeKIModel]);

  // ✅ KORRIGIERT: Memoisiere handleDirectContentChange mit useCallback
  const handleDirectContentChange = useCallback((newContent: string) => {
    setCoverLetter(newContent);
  }, []);



  const [activeTab, setActiveTab] = useState<'bewerbung' | 'lebenslauf' | 'designer'>('bewerbung');
  const tabs = [
    { id: 'bewerbung', label: 'Bewerbung' },
    { id: 'lebenslauf', label: 'Lebenslauf' },
    { id: 'designer', label: 'Designer' },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="relative sticky top-0 z-20 bg-white shadow-md py-4">
        <h1 className="text-2xl font-bold text-center">Bewerbungsschreiben Generator</h1>
        <button
          onClick={() => navigate('/settings')}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800"
          title="Einstellungen öffnen"
        >
          <Settings size={20} />
        </button>
      </header>

      <main className="flex-1 px-4 py-6 space-y-6">
        <TabNavigation tabs={tabs} active={activeTab} onChange={setActiveTab} />

        {activeTab === 'bewerbung' && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_2fr_1fr] gap-6 relative overflow-hidden">
            {/* Linke Spalte: Dokumenttyp, Eingabe und Generierung */}
            <div className="min-w-0 space-y-6">
              <DocumentTypeBlock
                documentTypes={documentTypes}
                selected={selectedDocumentType}
                onChange={setSelectedDocumentType}
              />

              <InputColumns
                onCvChange={setCvContent}
                onJobChange={setJobContent}
                profileConfig={profileConfig}
              />

              <GenerateControls
                selectedStyles={selectedStyles}
                onStylesChange={setSelectedStyles}
                stylePrompts={stylePrompts}
                onGenerate={handleGenerate}
                disabled={isGenerating || !cvContent.trim() || !jobContent.trim()}
                generating={isGenerating}
              />

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 text-red-700">
                    <div className="h-5 w-5 flex-shrink-0">⚠️</div>
                    <p className="font-medium">{error}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Mittlere Spalte: Editor */}
            <div className="min-w-0">
              <EditorBlock
                content={coverLetter}
                isEditing={isEditing}
                onEdit={handleEdit}
                onContentChange={handleDirectContentChange}
                editPrompts={editPrompts}
              />
            </div>

            {/* Rechte Spalte: KI-Assistent */}
            <div className="min-w-0">
              <CoverLetterAiAssistant
                cvContent={cvContent}
                jobContent={jobContent}
                coverLetter={coverLetter}
                activeKIModel={activeKIModel}
                onCoverLetterChange={setCoverLetter}
              />
            </div>
          </div>
        )}

        {activeTab === 'lebenslauf' && (
          <LebenslaufEditor profileSourceMappings={profileSourceMappings} />
        )}

        {activeTab === 'designer' && (
          <DesignerPage styleConfig={styleConfig} setStyleConfig={setStyleConfig} />
        )}

        <div className="text-center text-gray-500 text-sm">
          Powered by Mistral AI • Quill Editor
          {isSupabaseConfigured() && (
            <span className="ml-2">• Profil-Daten von Supabase</span>
          )}
          {profileSourceMappings.length > 0 && (
            <span className="ml-2">• {profileSourceMappings.filter(m => m.isActive).length} aktive Datenquellen</span>
          )}
          {databaseStats && databaseStats.totalFromMappings > 0 && (
            <span className="ml-2">• {databaseStats.totalFromMappings.toLocaleString('de-DE')} Mapping-Einträge</span>
          )}
        </div>
      </main>
    </div>
  );
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/designer" element={<DesignerPage />} />
      <Route path="/playground" element={<CVPlayground />} />
      <Route path="/settings" element={
        <LebenslaufProvider>
          <SettingsPage />
        </LebenslaufProvider>
      } />
      <Route path="/style-test" element={<StyleTest />} />
    </Routes>
  );
}
export default App;
