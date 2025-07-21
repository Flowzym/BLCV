import React, { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  value: string;
  onChange: (value: string) => void;
}

export default function EditableText({ value, onChange }: EditableTextProps) {
  const [editing, setEditing] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  return editing ? (
    <input
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onBlur={() => setEditing(false)}
      className="px-2 py-1 border rounded-md focus:outline-none focus:ring-2"
      style={{ borderColor: '#F29400', '--tw-ring-color': '#F29400' } as React.CSSProperties}
    />
  ) : (
    <span onClick={() => setEditing(true)} className="cursor-pointer">
      {value}
    </span>
  );
}
