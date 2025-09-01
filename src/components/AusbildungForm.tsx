import React from 'react';
import ZeitraumPicker from './ZeitraumPicker';
import InstitutionTagInput from './InstitutionTagInput';
import TagSelectorWithFavorites from './TagSelectorWithFavorites';
import TextInput from './TextInput';
import { Eraser } from 'lucide-react';
import { useLebenslauf } from './LebenslaufContext';
import { CVSuggestionConfig } from '../services/supabaseService';

interface AusbildungFormProps {
  educationId: string;
  cvSuggestions: CVSuggestionConfig;
}

export default function AusbildungForm({
  educationId,
  cvSuggestions,
}: AusbildungFormProps) {
  const { ausbildung, updateEducationField, updateEducationZeitraum } = useLebenslauf();
  
  // Get current form data
  const form = ausbildung.find(edu => edu.id === educationId);
  
  // If no valid education found, show error state
  if (!form) {
    return (
      <div className="text-center py-8 bg-red-50 rounded-lg border border-red-200">
        <p className="text-red-600 mb-2">Fehler: Ausbildung nicht gefunden</p>
        <p className="text-sm text-red-500">
          Der ausgewählte Eintrag existiert nicht mehr. Bitte wählen Sie einen anderen Eintrag aus.
        </p>
      </div>
    );
  }
  
  // Default form structure for safety
  const safeForm = {
    institution: [],
    ausbildungsart: [],
    abschluss: [],
    startMonth: null,
    startYear: "",
    endMonth: null,
    endYear: null,
    isCurrent: false,
    zusatzangaben: "",
    ...form
  };

  // Ensure all fields are properly typed and safe
  const finalForm = {
    ...safeForm,
    institution: Array.isArray(safeForm.institution) ? safeForm.institution : [],
    ausbildungsart: Array.isArray(safeForm.ausbildungsart) ? safeForm.ausbildungsart : [],
    abschluss: Array.isArray(safeForm.abschluss) ? safeForm.abschluss : [],
    zusatzangaben: String(safeForm.zusatzangaben || "")
  };

  const hasZeitraumData =
    finalForm.startMonth !== null ||
    String(finalForm.startYear).trim() !== '' ||
    finalForm.endMonth !== null ||
    finalForm.endYear !== null ||
    finalForm.isCurrent === true;
  const hasInstitutionData = finalForm.institution.length > 0;
  const hasAusbildungsartData = finalForm.ausbildungsart.length > 0;
  const hasAbschlussData = finalForm.abschluss.length > 0;
  const hasZusatzangabenData = finalForm.zusatzangaben.trim().length > 0;

  return (
    <div className="space-y-4">
      {/* Zeitraum */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Zeitraum</h3>
          {hasZeitraumData && (
            <button
              type="button"
              onClick={() => {
                updateEducationZeitraum(educationId, {
                  startMonth: null,
                  startYear: '',
                  endMonth: null,
                  endYear: null,
                  isCurrent: false
                });
              }}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Zeitraum zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <ZeitraumPicker
          value={{
            startMonth: finalForm.startMonth ?? undefined,
            startYear: finalForm.startYear ?? undefined,
            endMonth: finalForm.endMonth ?? undefined,
            endYear: finalForm.endYear ?? undefined,
            isCurrent: finalForm.isCurrent,
          }}
          onChange={(data) => {
            updateEducationZeitraum(educationId, {
              startMonth: data.startMonth !== undefined && data.startMonth !== null
                ? String(data.startMonth).padStart(2, '0')
                : null,
              startYear: data.startYear !== undefined && data.startYear !== null ? String(data.startYear) : '',
              endMonth: data.endMonth !== undefined && data.endMonth !== null
                ? String(data.endMonth).padStart(2, '0')
                : null,
              endYear: data.endYear !== undefined && data.endYear !== null ? String(data.endYear) : null,
              isCurrent: data.isCurrent ?? false
            });
          }}
        />
      </div>

      {/* Institution & Ort */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Institution & Ort</h3>
          {hasInstitutionData && (
            <button
              type="button"
              onClick={() => updateEducationField(educationId, 'institution', [])}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Institution & Ort zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <InstitutionTagInput
          value={finalForm.institution}
          onChange={(val) => {
            updateEducationField(educationId, 'institution', val);
          }}
          suggestions={cvSuggestions.companies}
        />
      </div>

      {/* Ausbildungsart */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Ausbildungsart</h3>
          {hasAusbildungsartData && (
            <button
              type="button"
              onClick={() => updateEducationField(educationId, 'ausbildungsart', [])}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Ausbildungsart zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TagSelectorWithFavorites
          label=""
          value={finalForm.ausbildungsart}
          onChange={(val) => {
            updateEducationField(educationId, 'ausbildungsart', val);
          }}
          allowCustom={true}
          suggestions={[
            'Studium',
            'Lehre',
            'Weiterbildung',
            'Kurs',
            'Zertifizierung',
            'Seminar',
            'Workshop',
            'Fernstudium',
            'Abendschule',
            'Berufsschule',
            'Fachhochschule',
            'Universität',
            'Akademie',
            'Institut'
          ]}
        />
      </div>

      {/* Abschluss */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Abschluss</h3>
          {hasAbschlussData && (
            <button
              type="button"
              onClick={() => updateEducationField(educationId, 'abschluss', [])}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Abschluss zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TagSelectorWithFavorites
          label=""
          value={finalForm.abschluss}
          onChange={(val) => {
            updateEducationField(educationId, 'abschluss', val);
          }}
          allowCustom={true}
          suggestions={[
            'Bachelor',
            'Master',
            'Diplom',
            'Lehrabschluss',
            'Zertifikat',
            'Matura',
            'Abitur',
            'Doktor',
            'PhD',
            'MBA',
            'MSc',
            'BSc',
            'Mag.',
            'DI',
            'Dr.',
            'Prof.',
            'Facharbeiter',
            'Geselle',
            'Meister'
          ]}
        />
      </div>

      {/* Zusatzangaben */}
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-bold text-gray-700">Zusatzangaben</h3>
          {hasZusatzangabenData && (
            <button
              type="button"
              onClick={() => updateEducationField(educationId, 'zusatzangaben', '')}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Zusatzangaben zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TextInput
          value={finalForm.zusatzangaben}
          onChange={(val) => {
            updateEducationField(educationId, 'zusatzangaben', val);
          }}
          label=""
          placeholder="Zusätzliche Informationen zur Ausbildung..."
          rows={4}
          id="education-additional-info"
          name="education-additional-info"
        />
      </div>
    </div>
  );
}