import React from 'react';

interface TabNavigationProps {
  tabs: { id: string; label: string }[];
  active: string;
  onChange: (id: string) => void;
}

export default function TabNavigation({ tabs, active, onChange }: TabNavigationProps) {
  return (
    <nav className="border-b border-gray-200 mb-4">
      <ul className="flex space-x-4">
        {tabs.map(tab => (
          <li key={tab.id}>
            <button role="tab" aria-selected={tab.id === activeId}
              onClick={() => onChange(tab.id)}
              className={`px-4 py-2 -mb-px border-b-2 transition-colors duration-200 ${
                active === tab.id
                  ? 'border-orange-500 text-orange-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
