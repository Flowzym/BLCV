import { Eraser } from 'lucide-react';
import ZeitraumPicker from './ZeitraumPicker';
import TextInput from './TextInput';
import InstitutionTagInput from './InstitutionTagInput';
import TagSelectorWithFavorites from './TagSelectorWithFavorites';
import { AusbildungEntryForm, useLebenslauf } from './LebenslaufContext';
import { CVSuggestionConfig } from '../services/supabaseService';

interface AusbildungFormProps {
  form: AusbildungEntryForm;
  onUpdateField: <K extends keyof AusbildungEntryForm>(field: K, value: AusbildungEntryForm[K]) => void;
  cvSuggestions: CVSuggestionConfig;
}

export default function AusbildungForm({
  form,
  onUpdateField,
  cvSuggestions,
}: AusbildungFormProps) {
  const { favoriteAusbildungsarten, favoriteAbschluesse } = useLebenslauf();

  const hasZeitraumData =
    form.startMonth !== null ||
    form.startYear.trim() !== '' ||
    form.endMonth !== null ||
    form.endYear !== null ||
    form.isCurrent === true;
  const hasInstitutionData = form.institution.length > 0;
  const hasAusbildungsartData = form.ausbildungsart.length > 0;
  const hasAbschlussData = form.abschluss.length > 0;
  const hasZusatzangabenData = form.zusatzangaben.trim().length > 0;

  return (
    <div className="space-y-4">
      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Zeitraum</h3>
          {hasZeitraumData && (
            <button
              type="button"
              onClick={() => {
                onUpdateField('startMonth', null);
                onUpdateField('startYear', '');
                onUpdateField('endMonth', null);
                onUpdateField('endYear', null);
                onUpdateField('isCurrent', false);
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
            startMonth: form.startMonth ?? undefined,
            startYear: form.startYear ?? undefined,
            endMonth: form.endMonth ?? undefined,
            endYear: form.endYear ?? undefined,
            isCurrent: form.isCurrent,
          }}
          onChange={(data) => {
            onUpdateField(
              'startMonth',
              data.startMonth !== undefined && data.startMonth !== null
                ? String(data.startMonth).padStart(2, '0')
                : null,
            );
            onUpdateField(
              'startYear',
              data.startYear !== undefined && data.startYear !== null ? String(data.startYear) : '',
            );
            onUpdateField(
              'endMonth',
              data.endMonth !== undefined && data.endMonth !== null
                ? String(data.endMonth).padStart(2, '0')
                : null,
            );
            onUpdateField(
              'endYear',
              data.endYear !== undefined && data.endYear !== null ? String(data.endYear) : null,
            );
            onUpdateField('isCurrent', data.isCurrent ?? false);
          }}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Institution & Ort</h3>
          {hasInstitutionData && (
            <button
              type="button"
              onClick={() => onUpdateField('institution', [])}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Institution & Ort zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <InstitutionTagInput
          value={form.institution}
          onChange={(val) => onUpdateField('institution', val)}
          suggestions={cvSuggestions.companies}
        />
      </div>

      <div className="bg-white border border-gray-200 rounded shadow-sm p-4">
        <div className="flex justify-between mb-2">
          <h3 className="text-sm font-medium text-gray-700">Ausbildungsart</h3>
          {hasAusbildungsartData && (
            <button
              type="button"
              onClick={() => onUpdateField('ausbildungsart', [])}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Ausbildungsart zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TagSelectorWithFavorites
          label=""
          value={form.ausbildungsart}
          onChange={(val) => onUpdateField('ausbildungsart', val)}
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
              onClick={() => onUpdateField('abschluss', [])}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Abschluss zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TagSelectorWithFavorites
          label=""
          value={form.abschluss}
          onChange={(val) => onUpdateField('abschluss', val)}
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
              onClick={() => onUpdateField('zusatzangaben', '')}
              className="p-1 text-gray-600 hover:text-gray-900"
              title="Zusatzangaben zurücksetzen"
            >
              <Eraser className="h-4 w-4" />
            </button>
          )}
        </div>
        <TextInput
          value={form.zusatzangaben}
          onChange={(val) => onUpdateField('zusatzangaben', val)}
          label="" 
          placeholder="Zusätzliche Informationen zur Ausbildung..."
          rows={4}
        />
      </div>
    </div>
  );
}