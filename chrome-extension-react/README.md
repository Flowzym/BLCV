# Chrome Extension mit React - Build & Test Anleitung

## 1. Dependencies installieren
```bash
cd chrome-extension-react
npm install
```

## 2. Extension bauen
```bash
npm run build
```

## 3. Extension in Chrome laden
1. Öffnen Sie `chrome://extensions`
2. Aktivieren Sie "Entwicklermodus" (oben rechts)
3. Klicken Sie "Entpackte Erweiterung laden"
4. Wählen Sie den Ordner `chrome-extension-react/dist`

## 4. Testen
- Klicken Sie auf das Extension-Icon
- Klicken Sie den "Ping Background" Button
- Die Antwort sollte erscheinen: `{"pong":true,"time":"..."}`

## Wichtige Punkte:
- ✅ Keine React-Endlosschleifen (useState korrekt verwendet)
- ✅ Robuste Messaging (sendResponse immer aufgerufen)
- ✅ chrome.runtime.lastError korrekt behandelt
- ✅ Getrennt von der Haupt-Web-App
- ✅ TypeScript mit korrekten Chrome-Types

## Entwicklung:
```bash
npm run dev  # Watch-Modus für Entwicklung
```

Nach Änderungen: Extension in Chrome neu laden (Reload-Button bei der Extension).