import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive';
}

export default function StyledButton({ variant = 'default', className = '', ...props }: ButtonProps) {
  const base = 'px-3 py-1 rounded-md text-sm';
  const variantClass =
    variant === 'destructive'
      ? 'bg-red-600 text-white hover:bg-red-700'
      : 'bg-orange-500 text-white hover:bg-orange-600';
  return <button {...props} className={`${base} ${variantClass} ${className}`}>{props.children}</button>;
}
