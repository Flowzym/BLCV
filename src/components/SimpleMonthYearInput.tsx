import { useState, useRef } from 'react';

export default function SimpleMonthYearInput() {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatInput = (input: string) => {
    const digits = input.replace(/\D/g, '').slice(0, 6);
    const month = digits.slice(0, 2);
    const year = digits.slice(2, 6);
    let formatted = month;
    if (digits.length > 2) {
      formatted += '/' + year;
    } else if (digits.length === 2) {
      formatted += '/';
    }
    return formatted;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInput(e.target.value);
    setValue(formatted);
  };

  const handleClick = () => {
    const input = inputRef.current;
    if (!input) return;
    const pos = input.selectionStart ?? 0;
    if (pos <= 2) {
      setTimeout(() => input.setSelectionRange(0, 2), 0);
    } else {
      setTimeout(() => input.setSelectionRange(3, 7), 0);
    }
  };

  return (
    <input
      type="text"
      placeholder="MM/YYYY"
      value={value}
      onChange={handleChange}
      onClick={handleClick}
      ref={inputRef}
      inputMode="numeric"
      pattern="\d{2}/\d{4}"
      maxLength={7}
      className="border px-2 py-1 rounded w-28"
    />
  );
}
