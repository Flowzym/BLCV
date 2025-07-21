
# CONTRIBUTING.md

## Branching & Commit-Konventionen

- **Branches**
    - Neue Features: `feature/<kurze-beschreibung>`
    - Bugfixes: `fix/<kurze-beschreibung>`
    - Refactoring/Technik: `chore/<kurze-beschreibung>`
- **Commits**
    - Klare, prägnante Nachrichten, im Imperativ (z. B. „Füge Wordcounter hinzu“)
    - Ein Commit = eine Änderungseinheit

## Pull Requests

- Jeder Task (egal wie klein) wird **in einem eigenen Branch** umgesetzt und als Pull Request (PR) gegen `main` gemerged.
- **PR-Beschreibung:**  
    - Was wurde geändert?  
    - Warum?  
    - Ggf. offene Punkte/Tests/Review-Notizen
- **Vor dem Merge:**  
    - `npm run lint` muss ohne Fehler durchlaufen  
    - Änderungen müssen getestet sein (händisch oder automatisiert)
- Bei Solo-Entwicklung: Selbst-Review & Nachvollziehbarkeit (mind. ein Check nach dem PR-Prinzip).

## Coding-Guidelines

- **Linting:**  
    - Projekt nutzt ESLint (Regeln in `.eslintrc`)
    - Keine ungenutzten Variablen oder Imports
- **Formatting:**  
    - Code mit Prettier formatieren (Regeln in `.prettierrc`)
    - Einheitliche Einrückung & Klammerung
- **Typisierung:**  
    - TypeScript verwenden, `any` vermeiden
- **Struktur:**  
    - Komponentenstruktur beibehalten (`src/components`, `src/pages`, etc.)
    - Utility-Funktionen in `src/utils`
- **Testen:**  
    - Wo sinnvoll, Tests für neue Features/Fixes ergänzen
    - Test-Skripte: `npm test`, ggf. E2E- oder Integrationstests

## Tool-Integration (Codex/GPT)

- Pull-Requests und Branches, die (teilweise) per Codex/GPT generiert wurden, sind zu kennzeichnen (im PR-Text: `#codex`, `#gpt`)
- Jede KI-generierte Änderung **selbst reviewen** und bei Unsicherheiten gezielt Rückfragen/Tests ergänzen.

## Code of Conduct _(optional)_

- Respektvoller, sachlicher Umgang in allen Projektdiskussionen (Issues, PRs, Kommentare)
- Keine Diskriminierung, Spam oder Trolling
- Technische Kritik = willkommen, persönliche Angriffe = no-go

---

_Für Fragen, Feedback oder Verbesserungen: Issue auf GitHub eröffnen oder direkt an [Flor](hypophobia@gmail.com) wenden._
