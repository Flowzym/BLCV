import React from 'react';

interface InputProps {
  id?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  className?: string;
  type?: string;
  disabled?: boolean;
  min?: string;
}

interface LabelProps {
  htmlFor?: string;
  children: React.ReactNode;
  className?: string;
}

export const Input: React.FC<InputProps> = ({ 
  id,
  value, 
  onChange, 
  placeholder, 
  className = '',
  type = 'text',
  disabled = false,
  min
}) => {
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      min={min}
      className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${className}`}
    />
  );
};

export const Label: React.FC<LabelProps> = ({ htmlFor, children, className = '' }) => {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 mb-1 ${className}`}
    >
      {children}
    </label>
  );
};