// src/bootstrap/exportRegistry.ts
// Einmalige Registrierung der Designer-Exportstrategien (PDF/DOCX).
// Diese Datei nur importieren – sie registriert beim Import alles Nötige.

import { registerDesignerExport } from "@/modules/cv-designer/services/registerDesignerExport";

// idempotent: mehrfacher Aufruf überschreibt nur die Registry-Einträge
registerDesignerExport();
