/**
 * Erweiterte AI-Integration Hook
 * Zentrale Schnittstelle für alle AI-Features im CV-Designer
 */

import { useState, useCallback } from 'react';
import { CVData, DesignTemplate, LayoutElement } from '@/types/cv-designer';
import { callClaudeAPI, mockClaudeAPI } from '@/services/claude_api';

export interface AIAnalysisResult {
  atsScore: number;
  clarityScore: number;
  toneScore: number;
  keywordDensity: Record<string, number>;
  suggestions: string[];
  improvements: Array<{
    type: 'content' | 'structure' | 'keywords' | 'tone';
    priority: 'high' | 'medium' | 'low';
    suggestion: string;
    example?: string;
  }>;
}

export interface TemplateMatchResult {
  templateId: string;
  confidence: number;
  reasoning: string;
  alternatives: Array<{
    templateId: string;
    confidence: number;
    reason: string;
  }>;
}

export interface ContentSuggestion {
  sectionType: string;
  suggestions: Array<{
    type: 'improvement' | 'alternative' | 'addition';
    text: string;
    reasoning: string;
  }>;
}

export interface SmartLayoutResult {
  layout: LayoutElement[];
  reasoning: string;
  improvements: string[];
  atsOptimized: boolean;
}

export interface UseAIReturn {
  // Template Matching
  analyzeForTemplate: (cvData: CVData) => Promise<TemplateMatchResult>;
  templateAnalysis: TemplateMatchResult | null;
  
  // Design Assistant
  suggestDesignImprovements: (currentConfig: any, cvData: CVData) => Promise<any>;
  designSuggestions: any;
  
  // Content Suggestions
  generateContentSuggestions: (sectionContent: string, sectionType: string, cvData: CVData) => Promise<ContentSuggestion>;
  contentSuggestions: ContentSuggestion | null;
  
  // ATS Optimization
  analyzeATS: (cvData: CVData, targetJob?: string) => Promise<AIAnalysisResult>;
  atsAnalysis: AIAnalysisResult | null;
  
  // Smart Layouts
  generateSmartLayout: (cvData: CVData, preferences?: any) => Promise<SmartLayoutResult>;
  smartLayout: SmartLayoutResult | null;
  
  // General AI
  askAI: (prompt: string, context?: any) => Promise<{ content: string }>;
  
  // State
  isLoading: boolean;
  error: string | null;
  
  // Actions
  clearResults: () => void;
  setError: (error: string | null) => void;
}

export function useAI(): UseAIReturn {
  // State Management
  const [templateAnalysis, setTemplateAnalysis] = useState<TemplateMatchResult | null>(null);
  const [designSuggestions, setDesignSuggestions] = useState<any>(null);
  const [contentSuggestions, setContentSuggestions] = useState<ContentSuggestion | null>(null);
  const [atsAnalysis, setATSAnalysis] = useState<AIAnalysisResult | null>(null);
  const [smartLayout, setSmartLayout] = useState<SmartLayoutResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Template Matching AI
  const analyzeForTemplate = useCallback(async (cvData: CVData): Promise<TemplateMatchResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = `
Analysiere diesen Lebenslauf und empfehle das beste Design-Template:

PERSON: ${cvData.personalData.firstName} ${cvData.personalData.lastName}
BERUF: ${cvData.personalData.profession || 'Nicht angegeben'}
ERFAHRUNG: ${cvData.workExperience.length} Positionen
AUSBILDUNG: ${cvData.education.length} Abschlüsse
SKILLS: ${cvData.skills.length} Fähigkeiten

VERFÜGBARE TEMPLATES:
- modern-business: Zeitgemäß, professionell für Business/Tech
- kreativ-fokus: Lebendige Farben für Designer/Kreative
- klassisch-elegant: Traditionell für konservative Branchen
- tech-minimal: Reduziert für IT/Software
- executive-elegant: Hochwertig für Führungskräfte
- healthcare-caring: Vertrauensvoll für Gesundheit/Soziales

Antwortformat JSON:
{
  "templateId": "...",
  "confidence": 0.85,
  "reasoning": "Begründung der Wahl...",
  "alternatives": [
    {"templateId": "...", "confidence": 0.72, "reason": "..."}
  ]
}
`;

      const response = await (import.meta.env.MODE === 'development' ? mockClaudeAPI : callClaudeAPI)(prompt);
      const result = JSON.parse(response);
      setTemplateAnalysis(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Template-Analyse fehlgeschlagen';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Design Assistant AI
  const suggestDesignImprovements = useCallback(async (currentConfig: any, cvData: CVData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = `
Analysiere diese Design-Konfiguration und schlage Verbesserungen vor:

AKTUELLE KONFIGURATION:
- Primärfarbe: ${currentConfig.primaryColor}
- Akzentfarbe: ${currentConfig.accentColor}
- Schriftart: ${currentConfig.fontFamily}
- Schriftgröße: ${currentConfig.fontSize}
- Zeilenabstand: ${currentConfig.lineHeight}
- Ränder: ${currentConfig.margin}

KONTEXT:
- Beruf: ${cvData.personalData.profession}
- Branche: ${cvData.workExperience[0]?.company || 'Unbekannt'}
- Erfahrungslevel: ${cvData.workExperience.length >= 3 ? 'Senior' : 'Junior'}

Bewerte:
1. Farbharmonie und Professionalität
2. Typografie-Lesbarkeit
3. Branchenpassung
4. ATS-Kompatibilität

Antwortformat JSON:
{
  "overallScore": 0.78,
  "improvements": [
    {
      "type": "color",
      "priority": "high",
      "current": "#1e40af",
      "suggested": "#059669",
      "reasoning": "Grün wirkt vertrauensvoller für Healthcare"
    }
  ],
  "alternativeConfigs": [...]
}
`;

      const response = await (import.meta.env.MODE === 'development' ? mockClaudeAPI : callClaudeAPI)(prompt);
      const result = JSON.parse(response);
      setDesignSuggestions(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Design-Analyse fehlgeschlagen';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Content Suggestions AI
  const generateContentSuggestions = useCallback(async (
    sectionContent: string, 
    sectionType: string, 
    cvData: CVData
  ): Promise<ContentSuggestion> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = `
Verbessere diesen Lebenslauf-Abschnitt:

SEKTION: ${sectionType}
AKTUELLER INHALT: "${sectionContent}"

KONTEXT:
- Person: ${cvData.personalData.firstName} ${cvData.personalData.lastName}
- Beruf: ${cvData.personalData.profession}
- Erfahrung: ${cvData.workExperience.length} Positionen

Analysiere und verbessere:
1. Klarheit und Prägnanz
2. Action-Verbs und Achievements
3. Keyword-Optimierung
4. ATS-Kompatibilität
5. Branchenspezifische Terminologie

Antwortformat JSON:
{
  "sectionType": "${sectionType}",
  "suggestions": [
    {
      "type": "improvement",
      "text": "Verbesserte Version des Textes...",
      "reasoning": "Warum diese Verbesserung..."
    },
    {
      "type": "alternative", 
      "text": "Alternative Formulierung...",
      "reasoning": "Andere Perspektive..."
    }
  ]
}
`;

      const response = await (import.meta.env.MODE === 'development' ? mockClaudeAPI : callClaudeAPI)(prompt);
      const result = JSON.parse(response);
      setContentSuggestions(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Content-Analyse fehlgeschlagen';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // ATS Optimization AI
  const analyzeATS = useCallback(async (cvData: CVData, targetJob?: string): Promise<AIAnalysisResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const fullContent = [
        cvData.personalData.summary || '',
        ...cvData.workExperience.map(job => `${job.position} ${job.company} ${job.description} ${job.responsibilities?.join(' ') || ''}`),
        ...cvData.education.map(edu => `${edu.degree} ${edu.institution} ${edu.description || ''}`),
        ...cvData.skills.map(skill => skill.name)
      ].join(' ');

      const prompt = `
Führe eine umfassende ATS-Analyse durch:

LEBENSLAUF-INHALT:
${fullContent}

ZIELPOSITION: ${targetJob || cvData.personalData.profession || 'Allgemein'}

ANALYSIERE:
1. ATS-Kompatibilität (0-100)
2. Keyword-Dichte und -Relevanz
3. Struktur und Lesbarkeit
4. Tonalität und Professionalität
5. Branchenspezifische Begriffe

IDENTIFIZIERE:
- Fehlende wichtige Keywords
- Zu komplexe Formulierungen
- Verbesserungspotentiale
- Strukturelle Probleme

Antwortformat JSON:
{
  "atsScore": 78,
  "clarityScore": 85,
  "toneScore": 72,
  "keywordDensity": {"javascript": 5, "react": 3},
  "suggestions": [
    "Mehr branchenspezifische Keywords verwenden",
    "Achievements quantifizieren"
  ],
  "improvements": [
    {
      "type": "keywords",
      "priority": "high", 
      "suggestion": "Füge 'TypeScript' und 'Node.js' hinzu",
      "example": "Entwicklung mit React, TypeScript und Node.js"
    }
  ]
}
`;

      const response = await (import.meta.env.MODE === 'development' ? mockClaudeAPI : callClaudeAPI)(prompt);
      const result = JSON.parse(response);
      setATSAnalysis(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'ATS-Analyse fehlgeschlagen';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Smart Layout Generation AI
  const generateSmartLayout = useCallback(async (cvData: CVData, preferences: any = {}): Promise<SmartLayoutResult> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const prompt = `
Generiere ein optimales Layout für diesen Lebenslauf:

DATEN-ANALYSE:
- Berufserfahrung: ${cvData.workExperience.length} Positionen
- Ausbildung: ${cvData.education.length} Abschlüsse  
- Skills: ${cvData.skills.length} Fähigkeiten
- Sprachen: ${cvData.languages?.length || 0}
- Projekte: ${cvData.projects?.length || 0}

PRÄFERENZEN:
- Layout-Stil: ${preferences.layoutStyle || 'modern'}
- Priorität: ${preferences.priority || 'balance'}
- Seitenzahl: ${preferences.pageCount || '1'}

ERSTELLE:
1. Optimale Element-Positionierung (x, y, width, height)
2. Hierarchische Anordnung nach Wichtigkeit
3. ATS-optimierte Struktur
4. Visuelle Balance und Lesbarkeit

Antwortformat JSON:
{
  "layout": [
    {
      "id": "header",
      "type": "profil", 
      "x": 0,
      "y": 0,
      "width": 600,
      "height": 120,
      "title": "Profil",
      "content": "..."
    }
  ],
  "reasoning": "Header oben für maximale Sichtbarkeit...",
  "improvements": ["Berufserfahrung prominent platziert"],
  "atsOptimized": true
}
`;

      const response = await (import.meta.env.MODE === 'development' ? mockClaudeAPI : callClaudeAPI)(prompt);
      const result = JSON.parse(response);
      setSmartLayout(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Smart-Layout-Generierung fehlgeschlagen';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // General AI Assistant
  const askAI = useCallback(async (prompt: string, context: any = {}): Promise<{ content: string }> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const enhancedPrompt = `
${context.systemRole || 'Du bist ein professioneller CV-Berater und Design-Experte.'}

KONTEXT:
${context.cvData ? `
- Person: ${context.cvData.personalData.firstName} ${context.cvData.personalData.lastName}
- Beruf: ${context.cvData.personalData.profession}
- Erfahrung: ${context.cvData.workExperience?.length || 0} Positionen
` : ''}

ANFRAGE:
${prompt}

Antworte präzise, professionell und umsetzbar.
`;

      const response = await (import.meta.env.MODE === 'development' ? mockClaudeAPI : callClaudeAPI)(enhancedPrompt);
      return { content: response };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'AI-Anfrage fehlgeschlagen';
      setError(errorMsg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Clear all results
  const clearResults = useCallback(() => {
    setTemplateAnalysis(null);
    setDesignSuggestions(null);
    setContentSuggestions(null);
    setATSAnalysis(null);
    setSmartLayout(null);
    setError(null);
  }, []);

  return {
    // Template Matching
    analyzeForTemplate,
    templateAnalysis,
    
    // Design Assistant  
    suggestDesignImprovements,
    designSuggestions,
    
    // Content Suggestions
    generateContentSuggestions,
    contentSuggestions,
    
    // ATS Optimization
    analyzeATS,
    atsAnalysis,
    
    // Smart Layouts
    generateSmartLayout,
    smartLayout,
    
    // General AI
    askAI,
    
    // State
    isLoading,
    error,
    
    // Actions
    clearResults,
    setError
  };
}