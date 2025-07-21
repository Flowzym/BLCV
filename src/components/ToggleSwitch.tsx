import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  className?: string;
}

export default function ToggleSwitch({ checked, onChange, label, className = "" }: ToggleSwitchProps) {
  const handleToggle = () => {
    const newValue = !checked;
    console.log(`ToggleSwitch: ${label} changing from ${checked} to ${newValue}`);
    onChange(newValue);
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          checked={checked}
          onChange={handleToggle}
          className="sr-only"
        />
        <div className={`w-8 h-4 rounded-full transition-colors duration-200 ${
          checked ? 'bg-[#F29400]' : 'bg-gray-300'
        }`}>
          <div className={`w-3 h-3 bg-white rounded-full shadow-md transform transition-transform duration-200 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          } mt-0.5`}></div>
        </div>
      </label>
    </div>
  );
}