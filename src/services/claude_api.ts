/**
 * Claude API Integration für Layout-Generierung
 * 
 * Diese Datei enthält die API-Kommunikation mit Claude (oder anderen KI-Services)
 * für die automatische Generierung von Lebenslauf-Layout-Vorschlägen.
 */

// API-Konfiguration
const API_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production' 
    ? 'https://your-api-domain.com' 
    : 'http://localhost:3000',
  endpoint: '/api/claude',
  timeout: 30000, // 30 Sekunden Timeout
  retries: 2
} as const;

// API Response Interface
interface ApiResponse {
  success: boolean;
  data?: string;
  error?: string;
  requestId?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

// Fehler-Klassen für bessere Fehlerbehandlung
export class ClaudeApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public requestId?: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ClaudeApiError';
  }
}

export class ClaudeTimeoutError extends ClaudeApiError {
  constructor(timeout: number) {
    super(`API-Anfrage nach ${timeout}ms abgebrochen`);
    this.name = 'ClaudeTimeoutError';
  }
}

export class ClaudeRateLimitError extends ClaudeApiError {
  constructor(retryAfter?: number) {
    super(`Rate Limit erreicht${retryAfter ? `. Retry nach ${retryAfter} Sekunden` : ''}`);
    this.name = 'ClaudeRateLimitError';
    this.statusCode = 429;
  }
}

/**
 * Hauptfunktion für Claude API-Aufrufe
 * 
 * @param prompt - Der zu sendende Prompt
 * @returns Promise<string> - Die Antwort von Claude als Plain String
 * @throws ClaudeApiError - Bei API-Fehlern
 */
export async function callClaudeAPI(prompt: string): Promise<string> {
  // Eingabe-Validierung
  if (!prompt || typeof prompt !== 'string') {
    throw new ClaudeApiError('Ungültiger Prompt: String erwartet');
  }

  if (prompt.trim().length === 0) {
    throw new ClaudeApiError('Leerer Prompt bereitgestellt');
  }

  if (prompt.length > 100000) { // ~100k Zeichen Limit
    throw new ClaudeApiError('Prompt zu lang: Maximum 100.000 Zeichen');
  }

  console.log('[ClaudeAPI] Starte API-Anfrage, Prompt-Länge:', prompt.length);

  let lastError: Error | null = null;
  
  // Retry-Logic
  for (let attempt = 1; attempt <= API_CONFIG.retries + 1; attempt++) {
    try {
      console.log(`[ClaudeAPI] Versuch ${attempt}/${API_CONFIG.retries + 1}`);
      
      const response = await makeApiRequest(prompt, attempt);
      
      console.log('[ClaudeAPI] Erfolgreiche Antwort erhalten');
      return response;
      
    } catch (error) {
      lastError = error as Error;
      
      console.error(`[ClaudeAPI] Fehler bei Versuch ${attempt}:`, {
        error: error instanceof Error ? error.message : 'Unbekannter Fehler',
        type: error instanceof Error ? error.constructor.name : 'Unknown'
      });

      // Bei Rate Limits oder Server-Fehlern: Retry
      if (error instanceof ClaudeRateLimitError || 
          (error instanceof ClaudeApiError && error.statusCode && error.statusCode >= 500)) {
        
        if (attempt <= API_CONFIG.retries) {
          const backoffDelay = Math.min(1000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff, max 10s
          console.log(`[ClaudeAPI] Warte ${backoffDelay}ms vor nächstem Versuch...`);
          await sleep(backoffDelay);
          continue;
        }
      }
      
      // Bei Client-Fehlern oder letztem Versuch: Direkt werfen
      if (attempt === API_CONFIG.retries + 1 || 
          (error instanceof ClaudeApiError && error.statusCode && error.statusCode < 500)) {
        throw error;
      }
    }
  }

  // Fallback: Letzten Fehler werfen
  throw lastError || new ClaudeApiError('Unbekannter Fehler bei API-Anfrage');
}

/**
 * Führt die eigentliche HTTP-Anfrage aus
 * 
 * @param prompt - Der Prompt
 * @param attempt - Aktueller Versuch (für Logging)
 * @returns Promise<string> - API-Antwort
 */
async function makeApiRequest(prompt: string, attempt: number): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeout);
  
  try {
    // Request-Payload vorbereiten
    const requestBody = {
      prompt: prompt.trim(),
      maxTokens: 4000,
      temperature: 0.3, // Niedrige Temperatur für konsistente Ergebnisse
      model: 'claude-3-sonnet-20240229', // oder aktuellstes verfügbares Modell
      metadata: {
        source: 'lebenslauf-designer',
        version: '1.0.0',
        attempt: attempt
      }
    };

    console.log('[ClaudeAPI] Sende Request:', {
      url: `${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`,
      promptLength: prompt.length,
      maxTokens: requestBody.maxTokens,
      model: requestBody.model
    });

    // HTTP-Request ausführen
    const response = await fetch(`${API_CONFIG.baseUrl}${API_CONFIG.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'LebenslaufDesigner/1.0.0',
        // Weitere Header können hier hinzugefügt werden (API-Keys, etc.)
        ...(process.env.CLAUDE_API_KEY && {
          'Authorization': `Bearer ${process.env.CLAUDE_API_KEY}`
        })
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    // Response-Status prüfen
    if (!response.ok) {
      await handleApiError(response);
    }

    // Response-Body parsen
    const apiResponse: ApiResponse = await response.json();
    
    console.log('[ClaudeAPI] Response erhalten:', {
      success: apiResponse.success,
      requestId: apiResponse.requestId,
      dataLength: apiResponse.data?.length || 0,
      usage: apiResponse.usage
    });

    // API-Response validieren
    if (!apiResponse.success) {
      throw new ClaudeApiError(
        apiResponse.error || 'API-Fehler ohne Details',
        response.status,
        apiResponse.requestId
      );
    }

    if (!apiResponse.data) {
      throw new ClaudeApiError(
        'Keine Daten in API-Response',
        response.status,
        apiResponse.requestId
      );
    }

    // Erfolgreiche Antwort zurückgeben
    return apiResponse.data;

  } catch (error) {
    clearTimeout(timeoutId);
    
    // AbortError (Timeout) behandeln
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ClaudeTimeoutError(API_CONFIG.timeout);
    }
    
    // Network-Fehler
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ClaudeApiError(
        'Netzwerk-Fehler: API nicht erreichbar',
        0,
        undefined,
        error
      );
    }
    
    // JSON-Parse-Fehler
    if (error instanceof SyntaxError) {
      throw new ClaudeApiError(
        'Ungültiges JSON in API-Response',
        0,
        undefined,
        error
      );
    }
    
    // Bereits behandelte Fehler weiterwerfen
    if (error instanceof ClaudeApiError) {
      throw error;
    }
    
    // Unbekannte Fehler
    throw new ClaudeApiError(
      'Unbekannter Fehler bei API-Anfrage',
      0,
      undefined,
      error instanceof Error ? error : new Error(String(error))
    );
  }
}

/**
 * Behandelt HTTP-Fehler-Responses
 * 
 * @param response - Fetch Response Objekt
 */
async function handleApiError(response: Response): Promise<never> {
  const statusCode = response.status;
  let errorMessage = `HTTP ${statusCode}: ${response.statusText}`;
  let requestId: string | undefined;

  try {
    const errorBody = await response.json();
    errorMessage = errorBody.error || errorMessage;
    requestId = errorBody.requestId;
  } catch {
    // JSON-Parse fehlgeschlagen, verwende Standard-Fehlermeldung
    try {
      const textBody = await response.text();
      if (textBody && textBody.length < 200) {
        errorMessage = textBody;
      }
    } catch {
      // Auch Text-Parse fehlgeschlagen, behalte Standard-Message
    }
  }

  // Spezifische Fehler-Behandlung
  switch (statusCode) {
    case 400:
      throw new ClaudeApiError(`Ungültige Anfrage: ${errorMessage}`, statusCode, requestId);
    
    case 401:
      throw new ClaudeApiError(`Authentifizierung fehlgeschlagen: ${errorMessage}`, statusCode, requestId);
    
    case 403:
      throw new ClaudeApiError(`Zugriff verweigert: ${errorMessage}`, statusCode, requestId);
    
    case 404:
      throw new ClaudeApiError(`API-Endpoint nicht gefunden: ${errorMessage}`, statusCode, requestId);
    
    case 429:
      // Rate Limit - versuche Retry-After-Header zu extrahieren
      const retryAfter = response.headers.get('Retry-After');
      const retrySeconds = retryAfter ? parseInt(retryAfter) : undefined;
      throw new ClaudeRateLimitError(retrySeconds);
    
    case 500:
    case 502:
    case 503:
    case 504:
      throw new ClaudeApiError(`Server-Fehler: ${errorMessage}`, statusCode, requestId);
    
    default:
      throw new ClaudeApiError(`API-Fehler: ${errorMessage}`, statusCode, requestId);
  }
}

/**
 * Hilfsfunktion für Delays
 * 
 * @param ms - Millisekunden zu warten
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Test-/Mock-Funktion für lokale Entwicklung
 * Gibt eine simulierte Claude-Antwort zurück
 * 
 * @param prompt - Input-Prompt (wird für Simulation analysiert)
 * @returns Promise<string> - Simulierte JSON-Antwort
 */
export async function mockClaudeAPI(prompt: string): Promise<string> {
  console.log('[ClaudeAPI] Mock-Modus: Simuliere API-Anfrage');
  
  // Simuliere Verarbeitungszeit
  await sleep(1500 + Math.random() * 1000);
  
  // Einfache Prompt-Analyse für realistische Mock-Antworten
  const promptLower = prompt.toLowerCase();
  
  let mockTemplate;
  
  if (promptLower.includes('developer') || promptLower.includes('software') || promptLower.includes('programming')) {
    // Tech-Template
    mockTemplate = {
      id: 'tech-professional-mock',
      title: 'Tech Professional',
      description: 'Modernes, technisch orientiertes Design für Software-Entwickler und IT-Professionals.',
      config: {
        primaryColor: '#2563eb',
        accentColor: '#06b6d4',
        fontFamily: 'Inter',
        fontSize: 'medium',
        lineHeight: 1.5,
        margin: 'normal'
      },
      warum: 'Basierend auf der Analyse des Profils wurde ein modernes, tech-orientiertes Design gewählt. Die blauen Farbtöne vermitteln Vertrauen und Professionalität, während die klare Typografie die technische Kompetenz unterstreicht.'
    };
  } else if (promptLower.includes('design') || promptLower.includes('creative') || promptLower.includes('art')) {
    // Kreativ-Template
    mockTemplate = {
      id: 'creative-professional-mock',
      title: 'Creative Professional',
      description: 'Lebendiges, kreatives Design für Designer, Künstler und kreative Professionals.',
      config: {
        primaryColor: '#7c3aed',
        accentColor: '#f59e0b',
        fontFamily: 'Playfair Display',
        fontSize: 'large',
        lineHeight: 1.7,
        margin: 'wide'
      },
      warum: 'Für kreative Berufe wurde ein ausdrucksstarkes Design mit lebendigen Farben gewählt. Die Serif-Schrift und großzügigen Abstände schaffen Raum für die Präsentation kreativer Arbeiten.'
    };
  } else if (promptLower.includes('manager') || promptLower.includes('director') || promptLower.includes('executive')) {
    // Executive-Template
    mockTemplate = {
      id: 'executive-professional-mock',
      title: 'Executive Professional',
      description: 'Elegantes, hochwertiges Design für Führungskräfte und C-Level Positionen.',
      config: {
        primaryColor: '#1e293b',
        accentColor: '#64748b',
        fontFamily: 'Merriweather',
        fontSize: 'medium',
        lineHeight: 1.6,
        margin: 'wide'
      },
      warum: 'Für Führungspositionen wurde ein elegantes, zurückhaltend-luxuriöses Design gewählt. Die dunklen Farbtöne und Serif-Schrift vermitteln Autorität und Erfahrung.'
    };
  } else {
    // Standard-Template
    mockTemplate = {
      id: 'modern-professional-mock',
      title: 'Modern Professional',
      description: 'Vielseitiges, professionelles Design für verschiedene Branchen und Karrierestufen.',
      config: {
        primaryColor: '#1e40af',
        accentColor: '#3b82f6',
        fontFamily: 'Inter',
        fontSize: 'medium',
        lineHeight: 1.6,
        margin: 'normal'
      },
      warum: 'Ein ausgewogenes, modernes Design wurde gewählt, das professionelle Kompetenz vermittelt und in verschiedenen Branchen gut ankommt.'
    };
  }
  
  console.log('[ClaudeAPI] Mock-Template generiert:', mockTemplate.title);
  
  return JSON.stringify(mockTemplate, null, 2);
}

/**
 * Hilfsfunktion zur API-Gesundheitsprüfung
 * 
 * @returns Promise<boolean> - true wenn API erreichbar
 */
export async function checkApiHealth(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s Timeout für Health Check
    
    const response = await fetch(`${API_CONFIG.baseUrl}/api/health`, {
      method: 'GET',
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    return response.ok;
    
  } catch (error) {
    console.error('[ClaudeAPI] Health Check fehlgeschlagen:', error);
    return false;
  }
}

/**
 * Hilfsfunktion zum Abrufen der API-Konfiguration
 * (nützlich für Debugging und Monitoring)
 */
export function getApiConfig() {
  return {
    ...API_CONFIG,
    // Sensible Daten ausblenden
    hasApiKey: !!process.env.CLAUDE_API_KEY,
    environment: process.env.NODE_ENV
  };
}

export default callClaudeAPI;