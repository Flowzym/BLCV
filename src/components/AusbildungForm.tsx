import { Eraser } from 'lucide-react';
import ZeitraumPicker from './ZeitraumPicker';
import TextInput from './TextInput';
import InstitutionTagInput from './InstitutionTagInput';
import TagSelectorWithFavorites from './TagSelectorWithFavorites';
import { AusbildungEntryForm, useLebenslauf } from './LebenslaufContext';
import { CVSuggestionConfig } from '../services/supabaseService';

interface AusbildungFormProps {
  educationId: string;
  cvSuggestions: CVSuggestionConfig;
}

export default function AusbildungForm({
  educationId,
  cvSuggestions,
}: AusbildungFormProps) {
  const { favoriteAusbildungsarten, favoriteAbschluesse, ausbildung, updateEducationField } = useLebenslauf();
  
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

  const hasZeitraumData =
    safeForm.startMonth !== null ||
    safeForm.startYear.trim() !== '' ||
    safeForm.endMonth !== null ||
    safeForm.endYear !== null ||
    safeForm.isCurrent === true;
  const hasInstitutionData = safeForm.institution.length > 0;
  const hasAusbildungsartData = safeForm.ausbildungsart.length > 0;
  const hasAbschlussData = safeForm.abschluss.length > 0;
  const hasZusatzangabenData = safeForm.zusatzangaben.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Zeitraum</h3>
          {hasZeitraumData && (
            <button
              type="button"
              onClick={() => {
                updateEducationField(educationId, 'startMonth', null);
                updateEducationField(educationId, 'startYear', '');
                updateEducationField(educationId, 'endMonth', null);
                updateEducationField(educationId, 'endYear', null);
                updateEducationField(educationId, 'isCurrent', false);
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
            startMonth: safeForm.startMonth ?? undefined,
            startYear: safeForm.startYear ?? undefined,
            endMonth: safeForm.endMonth ?? undefined,
            endYear: safeForm.endYear ?? undefined,
            isCurrent: safeForm.isCurrent,
          }}
          onChange={(data) => {
            updateEducationField(educationId, 'startMonth',
              data.startMonth !== undefined && data.startMonth !== null
                ? String(data.startMonth).padStart(2, '0')
                : null
            );
            updateEducationField(educationId, 'startYear',
              data.startYear !== undefined && data.startYear !== null ? String(data.startYear) : ''
            );
            updateEducationField(educationId, 'endMonth',
              data.endMonth !== undefined && data.endMonth !== null
                ? String(data.endMonth).padStart(2, '0')
                : null
            );
            updateEducationField(educationId, 'endYear',
              data.endYear !== undefined && data.endYear !== null ? String(data.endYear) : null
            );
            updateEducationField(educationId, 'isCurrent', data.isCurrent ?? false);
          }}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Institution & Ort</h3>
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
          value={safeForm.institution}
          onChange={(val) => {
            updateEducationField(educationId, 'institution', val);
          }}
          suggestions={cvSuggestions.companies}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Ausbildungsart</h3>
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
          value={safeForm.ausbildungsart}
          onChange={(val) => {
            updateEducationField(educationId, 'ausbildungsart', val);
          }}
          allowCustom={true}
          suggestions={['Studium', 'Lehre', 'Weiterbildung', 'Kurs', 'Zertifizierung']}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Abschluss</h3>
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
          value={safeForm.abschluss}
          onChange={(val) => {
            updateEducationField(educationId, 'abschluss', val);
          }}
          allowCustom={true}
          suggestions={['Bachelor', 'Master', 'Diplom', 'Lehrabschluss', 'Zertifikat', 'Matura']}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Zusatzangaben</h3>
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
          value={safeForm.zusatzangaben}
          onChange={(val) => {
            updateEducationField(educationId, 'zusatzangaben', val);
          }}
          label="" 
          placeholder="Zusätzliche Informationen zur Ausbildung..."
          rows={4}
        />
      </div>
    </div>
  );
}