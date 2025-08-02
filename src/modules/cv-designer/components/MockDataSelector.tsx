import React from 'react';
import { useMockData } from '../hooks/useMockData';

interface MockDataSelectorProps {
  onCVSelect: (cvId: string) => void;
  selectedCVId?: string;
}

export const MockDataSelector: React.FC<MockDataSelectorProps> = ({
  onCVSelect,
  selectedCVId
}) => {
  const { cvs } = useMockData();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cvs.map(cv => (
          <div
            key={cv.id}
            className={`border rounded-lg p-4 cursor-pointer transition-colors ${
              selectedCVId === cv.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:bg-gray-50'
            }`}
            onClick={() => onCVSelect(cv.id)}
          >
            <h3 className="font-medium text-gray-900 mb-2">
              {cv.cvData.personalData.firstName} {cv.cvData.personalData.lastName}
            </h3>
            <p className="text-sm text-gray-600 mb-2">
              {cv.cvData.personalData.profession || 'Keine Berufsbezeichnung'}
            </p>
            <div className="text-xs text-gray-500">
              {cv.cvData.workExperience.length} Berufserfahrungen • 
              {cv.cvData.skills.length} Fähigkeiten
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};