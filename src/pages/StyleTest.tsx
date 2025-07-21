import { useState } from 'react';
import TagButton from '../components/TagButton';
import MonthYearPicker from '../components/MonthYearPicker';
import MonthYearInput from '../components/MonthYearInput';
import TextInputWithButtons from '../components/TextInputWithButtons';
import TagContext from '../types/TagContext';

export default function StyleTest() {
  const [pickerValue, setPickerValue] = useState('');
  const [inputValue, setInputValue] = useState('');
  const [textValue, setTextValue] = useState('');

  return (
    <div className="p-4 space-y-6">
      <h2 className="font-bold">TagButton Varianten</h2>
      <div className="flex gap-2 flex-wrap">
        <TagButton label="Selected" variant={TagContext.Selected} isFavorite onRemove={() => {}} />
        <TagButton label="Suggestion" variant={TagContext.Suggestion} isFavorite />
        <TagButton label="Favorite" variant={TagContext.Favorite} isFavorite onRemove={() => {}} />
      </div>

      <h2 className="font-bold">MonthYearPicker</h2>
      <MonthYearPicker value={pickerValue} onChange={setPickerValue} />

      <h2 className="font-bold">MonthYearInput</h2>
      <MonthYearInput value={inputValue} onChange={setInputValue} />

      <h2 className="font-bold">TextInputWithButtons</h2>
      <TextInputWithButtons
        value={textValue}
        onChange={setTextValue}
        onAdd={(val) => console.log('add', val)}
        onFavorite={(val) => console.log('favorite', val)}
        placeholder="Hinzufügen..."
      />
    </div>
  );
}
