/**
 * Mock Data Selector Component
 * Provides UI for selecting and filtering mock CV data
 */

import React, { useState } from 'react';
import { useMockData } from '../hooks/useMockData';
import { MockDataFilters, Industry, ExperienceLevel, LanguageCode } from '../types';

interface MockDataSelectorProps {
  onCVSelect: (cvId: string) => void;
  selectedCVId?: string;
  className?: string;
}

export const MockDataSelector: React.FC<MockDataSelectorProps> = ({
  onCVSelect,
  selectedCVId,
  className = ''
}) => {
  const { cvs, filterCVs, getCVsByIndustry, getCVsByLanguage } = useMockData();
  const [filters, setFilters] = useState<MockDataFilters>({});

  const filteredCVs = filterCVs(filters);

  const handleFilterChange = (key: keyof MockDataFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === '' ? undefined : value
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  return (
    <div className={`mock-data-selector ${className}`}>
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-4">Mock CV Data Selector</h3>
        
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Industry</label>
            <select
              value={filters.industry || ''}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Industries</option>
              <option value="tech">Technology</option>
              <option value="creative">Creative</option>
              <option value="healthcare">Healthcare</option>
              <option value="finance">Finance</option>
              <option value="admin">Administration</option>
              <option value="retail">Retail</option>
              <option value="academic">Academic</option>
              <option value="executive">Executive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Experience Level</label>
            <select
              value={filters.experienceLevel || ''}
              onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Levels</option>
              <option value="junior">Junior</option>
              <option value="mid">Mid-Level</option>
              <option value="senior">Senior</option>
              <option value="leadership">Leadership</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <select
              value={filters.language || ''}
              onChange={(e) => handleFilterChange('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Languages</option>
              <option value="de">German</option>
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
            </select>
          </div>
        </div>

        {/* Additional Filters */}
        <div className="flex flex-wrap gap-4 mb-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasProjects || false}
              onChange={(e) => handleFilterChange('hasProjects', e.target.checked || undefined)}
              className="mr-2"
            />
            Has Projects
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.hasCertifications || false}
              onChange={(e) => handleFilterChange('hasCertifications', e.target.checked || undefined)}
              className="mr-2"
            />
            Has Certifications
          </label>
          
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={filters.isEdgeCase || false}
              onChange={(e) => handleFilterChange('isEdgeCase', e.target.checked || undefined)}
              className="mr-2"
            />
            Edge Cases Only
          </label>
        </div>

        <button
          onClick={clearFilters}
          className="px-4 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          Clear Filters
        </button>
      </div>

      {/* CV List */}
      <div className="space-y-3">
        <div className="text-sm text-gray-600 mb-3">
          Showing {filteredCVs.length} of {cvs.length} CVs
        </div>
        
        {filteredCVs.map(cv => (
          <div
            key={cv.id}
            className={`p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedCVId === cv.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            }`}
            onClick={() => onCVSelect(cv.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-medium text-gray-900">{cv.name}</h4>
              <div className="flex gap-2">
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                  {cv.metadata.industry}
                </span>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                  {cv.metadata.experienceLevel}
                </span>
                <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                  {cv.metadata.language.toUpperCase()}
                </span>
              </div>
            </div>
            
            <p className="text-sm text-gray-600 mb-2">{cv.description}</p>
            
            {cv.metadata.keywords && (
              <div className="flex flex-wrap gap-1">
                {cv.metadata.keywords.slice(0, 5).map(keyword => (
                  <span
                    key={keyword}
                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded"
                  >
                    {keyword}
                  </span>
                ))}
                {cv.metadata.keywords.length > 5 && (
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                    +{cv.metadata.keywords.length - 5} more
                  </span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default MockDataSelector;