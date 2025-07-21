import React from 'react';

interface SimpleInputProps {
  label: string;
  value: string | number;
  type?: string;
  onChange: (value: string) => void;
}

export default function SimpleInput({ label, value, onChange, type = 'text' }: SimpleInputProps) {
  const inputId = `simple-input-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <label htmlFor={inputId} className="space-y-1 block">
      <span className="text-gray-700">{label}</span>
      <input
        id={inputId}
        name={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2"
        style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
      />
    </label>
  );
}
