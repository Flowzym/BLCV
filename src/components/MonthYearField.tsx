import { useState, useRef } from 'react';

function formatDisplay(month: string, year: string) {
  if (month) return month + (year ? `/${year}` : '/');
  return year;
}

function isValidMonth(value: string) {
  const num = Number(value);
  return value.length === 2 && num >= 1 && num <= 12;
}

export default function MonthYearField() {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);

    if (digits.length >= 2 && isValidMonth(digits.slice(0, 2))) {
      setMonth(digits.slice(0, 2));
      setYear(digits.slice(2));
    } else {
      setMonth('');
      setYear(digits.slice(0, 4));
    }
  };

  const selectSection = () => {
    const input = inputRef.current;
    if (!input) return;
    const pos = input.selectionStart ?? 0;
    if (month && pos <= 2) {
      setTimeout(() => input.setSelectionRange(0, 2), 0);
    } else if (month) {
      setTimeout(() => input.setSelectionRange(3, 7), 0);
    }
  };

  const value = formatDisplay(month, year);

  return (
    <input
      ref={inputRef}
      type="text"
      placeholder="MM/YYYY"
      value={value}
      onChange={handleChange}
      onClick={selectSection}
      onFocus={selectSection}
      inputMode="numeric"
      className="border px-2 py-1 rounded w-28"
      pattern="\d{2}/\d{4}"
      maxLength={7}
    />
  );
}

