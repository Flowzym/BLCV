/*
  # Profil-Vorschläge Tabelle

  1. Neue Tabelle
    - `profile_suggestions`
      - `id` (uuid, primary key)
      - `category` (text) - Kategorie wie 'berufe', 'taetigkeiten', etc.
      - `value` (text) - Der eigentliche Vorschlag
      - `is_default` (boolean) - Ob es sich um einen Standard-Vorschlag handelt
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Sicherheit
    - RLS aktiviert
    - Policies für öffentlichen Lesezugriff und authentifizierten Schreibzugriff
*/

CREATE TABLE IF NOT EXISTS profile_suggestions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('berufe', 'taetigkeiten', 'skills', 'softskills', 'ausbildung')),
  value text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Index für bessere Performance
CREATE INDEX IF NOT EXISTS idx_profile_suggestions_category ON profile_suggestions(category);
CREATE INDEX IF NOT EXISTS idx_profile_suggestions_value ON profile_suggestions(value);

-- RLS aktivieren
ALTER TABLE profile_suggestions ENABLE ROW LEVEL SECURITY;

-- Policy für öffentlichen Lesezugriff (alle können Vorschläge lesen)
CREATE POLICY "Jeder kann Profil-Vorschläge lesen"
  ON profile_suggestions
  FOR SELECT
  TO public
  USING (true);

-- Policy für authentifizierte Benutzer zum Hinzufügen von Vorschlägen
CREATE POLICY "Authentifizierte Benutzer können Vorschläge hinzufügen"
  ON profile_suggestions
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Policy für authentifizierte Benutzer zum Aktualisieren eigener Vorschläge
CREATE POLICY "Authentifizierte Benutzer können Vorschläge aktualisieren"
  ON profile_suggestions
  FOR UPDATE
  TO authenticated
  USING (true);

-- Policy für authentifizierte Benutzer zum Löschen von Vorschlägen
CREATE POLICY "Authentifizierte Benutzer können Vorschläge löschen"
  ON profile_suggestions
  FOR DELETE
  TO authenticated
  USING (true);

-- Standard-Daten einfügen
INSERT INTO profile_suggestions (category, value, is_default) VALUES
-- Berufe
('berufe', 'Softwareentwickler', true),
('berufe', 'Projektmanager', true),
('berufe', 'Marketing Manager', true),
('berufe', 'Vertriebsmitarbeiter', true),
('berufe', 'Buchhalter', true),
('berufe', 'Personalreferent', true),
('berufe', 'Grafik Designer', true),
('berufe', 'Kundenberater', true),
('berufe', 'Teamleiter', true),
('berufe', 'Sachbearbeiter', true),
('berufe', 'Ingenieur', true),
('berufe', 'Techniker', true),
('berufe', 'Analyst', true),
('berufe', 'Berater', true),
('berufe', 'Koordinator', true),
('berufe', 'Produktmanager', true),
('berufe', 'Datenanalyst', true),
('berufe', 'UX/UI Designer', true),
('berufe', 'DevOps Engineer', true),
('berufe', 'Scrum Master', true),
('berufe', 'Business Analyst', true),
('berufe', 'Content Manager', true),
('berufe', 'Social Media Manager', true),
('berufe', 'SEO Spezialist', true),
('berufe', 'Qualitätsmanager', true),

-- Tätigkeiten
('taetigkeiten', 'Programmierung', true),
('taetigkeiten', 'Projektleitung', true),
('taetigkeiten', 'Kundenbetreuung', true),
('taetigkeiten', 'Datenanalyse', true),
('taetigkeiten', 'Qualitätssicherung', true),
('taetigkeiten', 'Teamführung', true),
('taetigkeiten', 'Budgetplanung', true),
('taetigkeiten', 'Prozessoptimierung', true),
('taetigkeiten', 'Schulungen', true),
('taetigkeiten', 'Dokumentation', true),
('taetigkeiten', 'Berichtswesen', true),
('taetigkeiten', 'Konzeptentwicklung', true),
('taetigkeiten', 'Marktanalyse', true),
('taetigkeiten', 'Verhandlungsführung', true),
('taetigkeiten', 'Präsentationen', true),
('taetigkeiten', 'Softwareentwicklung', true),
('taetigkeiten', 'Systemadministration', true),
('taetigkeiten', 'Netzwerkmanagement', true),
('taetigkeiten', 'Datenbankdesign', true),
('taetigkeiten', 'API-Entwicklung', true),
('taetigkeiten', 'Testing', true),
('taetigkeiten', 'Code Review', true),
('taetigkeiten', 'Deployment', true),
('taetigkeiten', 'Monitoring', true),
('taetigkeiten', 'Troubleshooting', true),

-- Skills
('skills', 'Microsoft Office', true),
('skills', 'Excel', true),
('skills', 'PowerPoint', true),
('skills', 'SAP', true),
('skills', 'CRM-Systeme', true),
('skills', 'SQL', true),
('skills', 'Python', true),
('skills', 'Java', true),
('skills', 'HTML/CSS', true),
('skills', 'Adobe Creative Suite', true),
('skills', 'AutoCAD', true),
('skills', 'Projektmanagement-Tools', true),
('skills', 'ERP-Systeme', true),
('skills', 'Datenbanken', true),
('skills', 'Webentwicklung', true),
('skills', 'Social Media Marketing', true),
('skills', 'SEO/SEM', true),
('skills', 'Buchhaltungssoftware', true),
('skills', 'JavaScript', true),
('skills', 'React', true),
('skills', 'Node.js', true),
('skills', 'Git', true),
('skills', 'Docker', true),
('skills', 'Kubernetes', true),
('skills', 'AWS', true),
('skills', 'Azure', true),
('skills', 'Google Cloud', true),
('skills', 'Photoshop', true),
('skills', 'Illustrator', true),
('skills', 'InDesign', true),
('skills', 'Figma', true),
('skills', 'Sketch', true),
('skills', 'Tableau', true),
('skills', 'Power BI', true),
('skills', 'R', true),
('skills', 'MATLAB', true),
('skills', 'Salesforce', true),
('skills', 'HubSpot', true),
('skills', 'WordPress', true),
('skills', 'Shopify', true),

-- Soft Skills
('softskills', 'Teamfähigkeit', true),
('softskills', 'Kommunikationsstärke', true),
('softskills', 'Problemlösungskompetenz', true),
('softskills', 'Organisationstalent', true),
('softskills', 'Flexibilität', true),
('softskills', 'Belastbarkeit', true),
('softskills', 'Eigeninitiative', true),
('softskills', 'Zuverlässigkeit', true),
('softskills', 'Kreativität', true),
('softskills', 'Analytisches Denken', true),
('softskills', 'Empathie', true),
('softskills', 'Führungsqualitäten', true),
('softskills', 'Zeitmanagement', true),
('softskills', 'Lernbereitschaft', true),
('softskills', 'Kundenorientierung', true),
('softskills', 'Konfliktfähigkeit', true),
('softskills', 'Präsentationsfähigkeiten', true),
('softskills', 'Verhandlungsgeschick', true),
('softskills', 'Stressresistenz', true),
('softskills', 'Multitasking', true),
('softskills', 'Kritikfähigkeit', true),
('softskills', 'Durchsetzungsvermögen', true),
('softskills', 'Networking', true),
('softskills', 'Interkulturelle Kompetenz', true),
('softskills', 'Digitale Kompetenz', true),

-- Ausbildung
('ausbildung', 'Bachelor Informatik', true),
('ausbildung', 'Master BWL', true),
('ausbildung', 'Ausbildung Kaufmann/-frau für Büromanagement', true),
('ausbildung', 'Fachhochschulreife', true),
('ausbildung', 'Abitur', true),
('ausbildung', 'Realschulabschluss', true),
('ausbildung', 'Hauptschulabschluss', true),
('ausbildung', 'Promotion', true),
('ausbildung', 'MBA', true),
('ausbildung', 'Techniker', true),
('ausbildung', 'Meister', true),
('ausbildung', 'IHK-Zertifikat', true),
('ausbildung', 'Sprachzertifikat', true),
('ausbildung', 'IT-Zertifizierung', true),
('ausbildung', 'Weiterbildung', true),
('ausbildung', 'Umschulung', true),
('ausbildung', 'Praktikum', true),
('ausbildung', 'Volontariat', true),
('ausbildung', 'Trainee-Programm', true),
('ausbildung', 'Duales Studium', true),
('ausbildung', 'Bachelor Wirtschaftsinformatik', true),
('ausbildung', 'Master Informatik', true),
('ausbildung', 'Bachelor Maschinenbau', true),
('ausbildung', 'Master Marketing', true),
('ausbildung', 'Ausbildung Fachinformatiker', true),
('ausbildung', 'Ausbildung Industriekaufmann/-frau', true),
('ausbildung', 'Ausbildung Mediengestalter', true),
('ausbildung', 'Zertifizierter Projektmanager (PMP)', true),
('ausbildung', 'Scrum Master Zertifizierung', true),
('ausbildung', 'AWS Certified Solutions Architect', true),
('ausbildung', 'Google Analytics Zertifizierung', true),
('ausbildung', 'Adobe Certified Expert', true),
('ausbildung', 'Microsoft Office Specialist', true),
('ausbildung', 'ITIL Foundation', true),
('ausbildung', 'Six Sigma Green Belt', true);

-- Trigger für updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profile_suggestions_updated_at
    BEFORE UPDATE ON profile_suggestions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();