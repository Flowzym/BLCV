import React from 'react';

export default function StatusDot({ active }: { active: boolean }) {
  const color = active ? 'bg-green-500' : 'bg-gray-400';
  return <span className={`w-3 h-3 rounded-full ${color}`}></span>;
}
