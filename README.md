Better_Letter

# Bewerbungsschreiben Generator

**KI-gestützte Webanwendung zur individuellen Erstellung und Bearbeitung professioneller Bewerbungsschreiben**

Mit dieser Anwendung kannst du Lebenslauf- und Stellenanzeigendaten flexibel importieren, verschiedene KI-Modelle (online & lokal) für die Textgenerierung auswählen und den generierten Text mit einem hochgradig konfigurierbaren Editor gestalten. Dynamische Profilvorschläge, eine erweiterbare Prompt-Bibliothek, ausgefeilte Vorlagenverwaltung und umfassende Exportfunktionen machen den Workflow effizient und individuell. Datenschutz, Backup und flexible Speicherung stehen im Mittelpunkt.

---

## Inhaltsverzeichnis

1. [Hauptfunktionen](#hauptfunktionen)
2. [Feature-Matrix (Überblick)](#feature-matrix-überblick)
3. [Technologien](#technologien)
4. [Installation & Einrichtung](#installation--einrichtung)
5. [Nutzung](#nutzung)
6. [Einstellungen & Personalisierung](#einstellungen--personalisierung)
7. [Datenschutz & Sicherheit](#datenschutz--sicherheit)
8. [Lizenz](#lizenz)
9. [Entwickler:in & Kontakt](#entwicklerin--kontakt)

---

## Hauptfunktionen

- **Flexible KI-Modellverwaltung:**  
  Auswahl, Hinzufügen und Konfiguration unterschiedlicher KI-Modelle (z. B. Mistral AI, GPT, lokale LLMs). Modellparameter (Tokens, Temperatur usw.) anpassbar.
- **Editierbare Prompt-Bibliothek & Custom Prompts:**  
  Alle Prompts (für Dokument-Typen, Schreibstile, KI-Anpassungen) sind über die Settings-Page editierbar und beliebig erweiterbar. Eigene Prompts können direkt eingegeben, gespeichert oder der Buttonleiste hinzugefügt werden.
- **Anpassbare & erweiterbare Dokumenttypen & Schreibstile:**  
  Auswahl und individuelle Anpassung von Typ (Standard, Berufsfern, Initiativ, etc.) und Stil (z. B. Sachlich, Unkonventionell, Förderkontext). Listen sind beliebig erweiterbar.
- **Hochgradig konfigurierbarer Rich-Text-Editor:**  
  Ein-/Ausblenden von Werkzeugleisten-Elementen, Drag & Drop-Anordnung, Platzhalter-Konfiguration, Seitenformat (A4/Letter), Ränder, Einzüge, Schriftarten (inkl. Upload eigener Fonts), Separatoren, Live-Zähler, Rechtschreibprüfung (KI oder Browser), mehrseitige Vorschau, Themes, uvm.
- **Datei- und Datenimport:**  
  Lebensläufe und Profile als TXT, DOCX, PDF (später auch Bild/Scan). Import per Copy & Paste, Datei-Upload oder URL (für Stellenanzeigen).
- **Flexible Datenquellen für Vorschläge:**
  Eigene Datenbanken, Cloudspeicher oder lokale Dateien als Quelle für Berufs-, Ausbildungs- und Skills-Vorschläge einbinden/konfigurieren.
- **Berufserfahrung mit mehreren Firmen:**
  Ein Eintrag kann nun mehrere Firmen als Tags enthalten.
- **Profilverwaltung:**
  Profile speichern, laden und bearbeiten – lokal im Browser, als Download oder in externer Datenbank (mit Datenschutzoptionen).
- **Backup-, Import- & Restore-Funktion:**  
  Vollständige oder selektive Sicherung/Wiederherstellung aller App-Daten & Einstellungen (inkl. Editor-Konfiguration, Profile, Vorlagen, etc.).
- **Ausgefeilte Vorlagenverwaltung:**  
  Thumbnail-Grid oder Listen-Vorschau, Vorlagen anlegen/bearbeiten/favorisieren, Upload externer Vorlagen (CSS, JSON, DOCX, ODT), schnelle Vorschau und Anwendung.
- **Export- & Druckfunktion:**  
  Export als DOCX, TXT, PDF; direkter Druck aus Editor mit Print-Preview, Ränder/Kopf-/Fußzeile/Wasserzeichen/Seitenzahlen, Nur-Inhalt-Druck.
- **Supabase-Integration:**  
  Dynamische Vorschläge, Datenquellen-Mapping und Statistiken in den Einstellungen.
- **Responsive UI:**  
  Optimiert für alle Bildschirmgrößen; Editor simuliert realistische Dokumentformate.

---

## Feature-Matrix (Überblick)

| Kategorie                                   | Feature                              | Beschreibung                                                               | Status  |
| ------------------------------------------- | ------------------------------------ | -------------------------------------------------------------------------- | ------- |
| **Dokumentenbearbeitung & Export**          | Druckfunktion                        | Print Preview, Layoutanpassung, „Nur Inhalt drucken“, PDF/Hardcopy         | Geplant |
|                                             | Export DOCX/TXT/PDF                  | Bewerbungsschreiben im Wunschformat exportieren                            | Fertig  |
|                                             | Serienbrieffunktion                  | Mehrere Empfänger/Positionen in einer Session generieren                   | Geplant |
| **Editor & Personalisierung**               | Eigene Schriftarten                  | Upload und Nutzung eigener Fonts                                           | Geplant |
|                                             | Live Word-/Zeichenzähler             | Zählt Wörter/Zeichen in Echtzeit                                           | Fertig  |
|                                             | Rechtschreib-/Grammatikprüfung       | Fehlerprüfung per KI/Browswer-API                                          | Geplant |
|                                             | Separator in Toolbar                 | Mehrfach platzierbare Trennsymbole in Editor-Werkzeugleiste                | Fertig  |
|                                             | Anpassbare Toolbar/Editor            | Reihenfolge, Sichtbarkeit, Platzhalter u. v. m. individuell konfigurierbar | Fertig  |
| **Profile & Datenmanagement**               | Mehrfachprofile/Multi-Account        | Verwaltung mehrerer Profile (z. B. Beratungsteam)                          | Geplant |
|                                             | Eigene Profil-Felder                 | Nutzer:innen können Felder (z. B. Skills) anlegen                          | Geplant |
|                                             | Filter & Timeline                    | Bewerbungen nach Erstellungs-/Absendedatum sortieren/filtern               | Geplant |
|                                             | Duplikaterkennung                    | Doppelte Profile/Dokumente werden erkannt                                  | Geplant |
| **KI & Prompt-Handling**                    | Test-Modus für Prompts               | Prompts mit Beispieldaten testen                                           | Geplant |
|                                             | Prompt-Bibliothek/Community-Sharing  | Prompts/Vorlagen teilen, bewerten, importieren                             | Geplant |
|                                             | KI-Routing/Multi-Modell              | Kombinierte Nutzung mehrerer KI-Modelle je nach Anwendungsfall             | Geplant |
| **Nutzerfreundlichkeit & Barrierefreiheit** | Barrierefreier Modus                 | Kontrast, Screenreader, große Schriften, Tastatursteuerung                 | Geplant |
|                                             | Mehrsprachigkeit (UI & KI)           | Interface/Textausgabe mehrsprachig, automatische Übersetzung               | Geplant |
|                                             | Onboarding-Assistent                 | Geführter Einstieg beim ersten Start                                       | Geplant |
|                                             | Tour/Tooltip-System                  | Tooltips/Hilfen zu neuen/komplexen Features                                | Geplant |
|                                             | Einstellbare Status-/Fehlermeldungen | Steuerung, wie Systemnachrichten angezeigt werden                          | Geplant |
| **Sicherheit & Organisation**               | Passwort-/PIN-Schutz                 | Absicherung für lokale Profile oder App-Zugang                             | Geplant |
| **Workflows & Automatisierung**             | Automatischer Lebenslauf-Parser      | KI-Validierung/Strukturierung importierter Lebensläufe                     | Geplant |
|                                             | Jobbörsen-Integration                | Direktes Einlesen von Stellenanzeigen (AMS, karriere.at, Indeed)           | Geplant |
| **Optische Anpassungen**                    | Benutzerdefinierte Themes            | Eigene Farbschemata/UI-Themes                                              | Geplant |
|                                             | Eigenes Logo/Firmenbranding          | Export-Dokumente mit individuellem Branding                                | Geplant |

---

## Technologien

**Frontend:**

- React, Vite, TypeScript, Tailwind CSS
- Quill.js (Rich Text Editor, konfigurierbar), lucide-react (Icons), mammoth.js (DOCX-Parsing)

**KI/Backend:**

- Mistral AI, GPT, lokale LLMs (Textgenerierung & -bearbeitung)
- Modellauswahl/API-Handling über Settings

**Datenbank & Integration:**

- Supabase (PostgreSQL, Authentifizierung)
- Flexible Schnittstellen für externe Datenquellen

### Datumsauswahlfeld (MonthYearPicker)

Ein Eingabefeld für Daten im Format `MM/YYYY`. Beim Klick erscheint ein Popup mit Monaten
und einer scrollbaren Jahresliste. Manuelle Eingabe und Auswahl im Popup sind
synchronisiert und es werden nur Jahreszahlen von 1900 bis 2099 zugelassen.

```tsx
import MonthYearPicker from "./src/components/MonthYearPicker";

function Example() {
  const [wert, setWert] = useState("");
  return <MonthYearPicker value={wert} onChange={setWert} />;
}
```

---

## Installation & Einrichtung

### Webanwendung

1. **Repository klonen:**
   ```bash
   git clone https://github.com/flowzym/bewerbungsschreiben-generator.git
   cd bewerbungsschreiben-generator
   ```
2. **Abhängigkeiten installieren:**
   ```bash
   npm install
   ```
3. **Konfiguration:**
   - `.env`-Datei für Supabase und KI-APIs anlegen:
     ```
     VITE_SUPABASE_URL="Ihre_Supabase_URL"
     VITE_SUPABASE_ANON_KEY="Ihr_Supabase_Anon_Key"
     VITE_KI_API_URL="Ihre_LLM_Endpoint"
     VITE_KI_API_KEY="Ihr_API_Key"
     ```
   - Weitere lokale KI-Modelle können in den Einstellungen hinzugefügt werden.
   - Supabase-Datenbank nach mitgelieferten Migrationsskripten einrichten.
   - Prompt-/Editor-Konfiguration über Settings importieren/anpassen.
4. **Entwicklung starten:**
   ```bash
   npm run dev
   ```

   - Anwendung läuft auf [http://localhost:5173](http://localhost:5173)
5. **Produktions-Build:**
   ```bash
   npm run build
   ```

   - Build im `dist/`-Verzeichnis.

---

## Nutzung

1. **Daten importieren:**  
   Lebenslauf, Profil und/oder Stellenanzeige per Text, Datei oder URL laden.
2. **Dokumenttyp, Schreibstil, KI-Modell wählen:**  
   Im Generator oder in den Settings auswählen/konfigurieren.
3. **Prompts & Vorlagen:**  
   Eigene Prompts/Vorlagen verwalten, bearbeiten, anwenden, teilen.
4. **Text generieren & bearbeiten:**  
   Bewerbungsschreiben erzeugen, mit Editor weiterverarbeiten und Layout anpassen.
5. **Profile, Backups, Exporte:**  
   Profile flexibel speichern (Browser, lokal, DB), Backups anlegen, Vorlagen managen, Export/Druck nutzen.

---

## Einstellungen & Personalisierung

- **KI-Modelle:** Verwaltung, API-Keys und Parameter in Settings.
- **Prompts & Vorlagen:** Verwaltung, Erweiterung, Import/Export, Community-Sharing.
- **Platzhalter:**  
   Anpassung aller Platzhaltertexte und Mappings für Berufs-/Ausbildungsvorschläge.
- **Editor-Settings:**  
   Toolbar-Einstellungen (Icons, Separatoren, Reihenfolge), Seitenlayout, Zeichenbegrenzung, Themes, etc.
- **Daten & Backup:**  
   Export/Import aller oder ausgewählter App-Komponenten, inkl. Profile, Vorlagen, Einstellungen.
- **Profile:**  
   Multi-Profil-Handling, individuelle Felder, Filter-/Sortierfunktionen.

---

## Datenschutz & Sicherheit

- **Modelle/API-Keys:** Niemals öffentlich speichern, nur in Umgebungsvariablen.
- **Speicheroptionen:** Nutzer entscheidet, wo Daten (Profile, Einstellungen, Vorlagen) gespeichert werden.
- **Datenbanken/Cloud:** RLS-Policies und Datenschutzbestimmungen externer Datenbanken beachten.
- **Lokale KI-Modelle:** Für maximale Datensouveränität (Verarbeitung nur lokal).
- **Backup/Restore:** Optional verschlüsselte Export-/Import-Funktion.
- **PIN-/Passwortschutz:** Optional für lokale Profile und App-Zugang.
- **Chrome-Extension:** (Geplant) – Datenschutzrichtlinien werden zum Release separat dokumentiert.

---

## Lizenz

MIT  
(n/a)

---

## Entwickler:in & Kontakt

Flor  
Kontakt: hypophobia@gmail.com

---
