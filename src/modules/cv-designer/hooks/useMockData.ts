/**
 * Mock Data Hook
 * Provides mock CV data for testing and development
 */

import { useState, useCallback } from 'react';

// Mock CV Data Types
interface MockCVData {
  id: string;
  name: string;
  description: string;
  cvData: {
    personalData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      address: string;
      profession?: string;
      summary?: string;
      profileImage?: string;
    };
    workExperience: Array<{
      id: string;
      position: string;
      company: string;
      location?: string;
      startDate: string;
      endDate: string;
      description: string;
    }>;
    education: Array<{
      id: string;
      degree: string;
      institution: string;
      location?: string;
      startDate: string;
      endDate: string;
      description?: string;
      grade?: string;
      fieldOfStudy?: string;
    }>;
    skills: Array<{
      id: string;
      name: string;
      level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
      category?: string;
    }>;
    languages?: Array<{
      id: string;
      name: string;
      level: string;
    }>;
  };
  metadata: {
    industry: string;
    experienceLevel: string;
    language: string;
    keywords?: string[];
  };
}

interface MockDataFilters {
  industry?: string;
  experienceLevel?: string;
  language?: string;
  hasProjects?: boolean;
  hasCertifications?: boolean;
  isEdgeCase?: boolean;
}

// Mock CV Data
const mockCVs: MockCVData[] = [
  {
    id: 'cv-1',
    name: 'Max Mustermann - Software Engineer',
    description: 'Experienced software engineer with focus on web development',
    cvData: {
      personalData: {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max.mustermann@email.de',
        phone: '+49 123 456789',
        address: 'Berlin, Deutschland',
        profession: 'Software Engineer',
        summary: 'Erfahrener Software Engineer mit Fokus auf moderne Webtechnologien und agile Entwicklungsmethoden.'
      },
      workExperience: [
        {
          id: 'exp-1',
          position: 'Senior Software Engineer',
          company: 'Tech Corp GmbH',
          location: 'Berlin',
          startDate: '2020-01',
          endDate: 'heute',
          description: 'Entwicklung von Webanwendungen mit React und Node.js'
        }
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Bachelor of Science Informatik',
          institution: 'Technische Universität Berlin',
          location: 'Berlin',
          startDate: '2016-10',
          endDate: '2020-09',
          grade: '2,1',
          fieldOfStudy: 'Informatik'
        }
      ],
      skills: [
        { id: 'skill-1', name: 'JavaScript', level: 'expert', category: 'Programming' },
        { id: 'skill-2', name: 'React', level: 'expert', category: 'Frontend' },
        { id: 'skill-3', name: 'Node.js', level: 'advanced', category: 'Backend' }
      ]
    },
    metadata: {
      industry: 'tech',
      experienceLevel: 'senior',
      language: 'de',
      keywords: ['JavaScript', 'React', 'Node.js', 'Agile']
    }
  },
  {
    id: 'cv-2',
    name: 'Anna Schmidt - Marketing Manager',
    description: 'Creative marketing professional with digital focus',
    cvData: {
      personalData: {
        firstName: 'Anna',
        lastName: 'Schmidt',
        email: 'anna.schmidt@email.de',
        phone: '+49 987 654321',
        address: 'München, Deutschland',
        profession: 'Marketing Manager',
        summary: 'Kreative Marketing-Managerin mit Schwerpunkt auf digitalen Kampagnen und Brand Management.'
      },
      workExperience: [
        {
          id: 'exp-1',
          position: 'Marketing Manager',
          company: 'Creative Agency GmbH',
          location: 'München',
          startDate: '2019-03',
          endDate: 'heute',
          description: 'Leitung von digitalen Marketing-Kampagnen und Brand-Strategien'
        }
      ],
      education: [
        {
          id: 'edu-1',
          degree: 'Master of Arts Marketing',
          institution: 'Ludwig-Maximilians-Universität München',
          location: 'München',
          startDate: '2015-10',
          endDate: '2018-09',
          grade: '1,8',
          fieldOfStudy: 'Marketing'
        }
      ],
      skills: [
        { id: 'skill-1', name: 'Digital Marketing', level: 'expert', category: 'Marketing' },
        { id: 'skill-2', name: 'Adobe Creative Suite', level: 'advanced', category: 'Design' },
        { id: 'skill-3', name: 'Google Analytics', level: 'advanced', category: 'Analytics' }
      ]
    },
    metadata: {
      industry: 'creative',
      experienceLevel: 'mid',
      language: 'de',
      keywords: ['Marketing', 'Digital', 'Brand', 'Analytics']
    }
  }
];

export interface UseMockDataReturn {
  cvs: MockCVData[];
  selectedCV: MockCVData | null;
  selectedLayout: any;
  selectedStyle: any;
  selectCV: (id: string) => void;
  filterCVs: (filters: MockDataFilters) => MockCVData[];
  getCVsByIndustry: (industry: string) => MockCVData[];
  getCVsByLanguage: (language: string) => MockCVData[];
}

export function useMockData(): UseMockDataReturn {
  const [selectedCV, setSelectedCV] = useState<MockCVData | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<any>(null);
  const [selectedStyle, setSelectedStyle] = useState<any>(null);

  const selectCV = useCallback((id: string) => {
    const cv = mockCVs.find(cv => cv.id === id);
    setSelectedCV(cv || null);
  }, []);

  const filterCVs = useCallback((filters: MockDataFilters): MockCVData[] => {
    return mockCVs.filter(cv => {
      if (filters.industry && cv.metadata.industry !== filters.industry) return false;
      if (filters.experienceLevel && cv.metadata.experienceLevel !== filters.experienceLevel) return false;
      if (filters.language && cv.metadata.language !== filters.language) return false;
      // Add more filter logic as needed
      return true;
    });
  }, []);

  const getCVsByIndustry = useCallback((industry: string): MockCVData[] => {
    return mockCVs.filter(cv => cv.metadata.industry === industry);
  }, []);

  const getCVsByLanguage = useCallback((language: string): MockCVData[] => {
    return mockCVs.filter(cv => cv.metadata.language === language);
  }, []);

  return {
    cvs: mockCVs,
    selectedCV,
    selectedLayout,
    selectedStyle,
    selectCV,
    filterCVs,
    getCVsByIndustry,
    getCVsByLanguage
  };
}