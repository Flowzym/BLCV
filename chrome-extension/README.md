# Chrome Extension - Robuste Nachrichtenübermittlung

## Build-/Test-Anleitung

### 1. TypeScript kompilieren

```bash
cd chrome-extension
tsc
```

Dies erstellt die kompilierten JavaScript-Dateien im `dist/` Verzeichnis.

### 2. Extension in Chrome laden

1. Öffnen Sie Chrome und navigieren Sie zu `chrome://extensions`
2. Aktivieren Sie den "Entwicklermodus" (Developer mode) oben rechts
3. Klicken Sie auf "Entpackte Erweiterung laden" (Load unpacked)
4. Wählen Sie das Verzeichnis `chrome-extension/dist` aus

### 3. Testen der Funktionalität

#### Popup-Test:
- Klicken Sie auf das Extension-Icon in der Chrome-Symbolleiste
- Testen Sie die drei Buttons: "Ping Hintergrund", "Daten abrufen", "Text verarbeiten"
- Beobachten Sie die Antworten im Result-Bereich

#### Content-Script-Test:
- Öffnen Sie eine beliebige Webseite
- Öffnen Sie die Entwicklertools (F12)
- Wechseln Sie zur "Konsole"-Registerkarte
- Sie sollten die Content-Script-Logs sehen, die die Nachrichtenübermittlung demonstrieren

#### Background-Script-Test:
- Gehen Sie zu `chrome://extensions`
- Finden Sie Ihre Extension und klicken Sie auf "Dienst-Worker" (Service Worker)
- Beobachten Sie die Background-Script-Logs

### 4. Fehlerbehandlung testen

Die Extension demonstriert robuste Fehlerbehandlung:
- Alle Nachrichten erhalten immer eine Antwort
- `runtime.lastError` wird korrekt abgefangen
- Unbekannte Nachrichtentypen werden sauber behandelt
- Asynchrone und synchrone Antworten funktionieren korrekt

### TODO/Hinweise:

- Die Dummy-Icons sind minimal (1x1 Pixel, transparent)
- Für eine produktive Extension sollten Sie echte Icons verwenden
- TypeScript muss global installiert sein: `npm install -g typescript`
- Bei Änderungen am Code: Neu kompilieren und Extension in Chrome neu laden