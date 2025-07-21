import React from 'react';

interface CardProps {
  title: string;
  children: React.ReactNode;
}

export default function Card({ title, children }: CardProps) {
  return (
    <div className="bg-white border border-gray-200 rounded shadow-sm p-4 space-y-4"> 
      <h3 className="text-lg font-medium text-gray-700">{title}</h3>
      {children}
    </div>
  );
}
