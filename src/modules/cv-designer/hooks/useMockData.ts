import { useState, useEffect } from 'react';
import { CVData } from '@/types/cv-designer';

interface MockCV {
  id: string;
  cvData: CVData;
  metadata: {
    styleId: string;
    layoutId: string;
    name: string;
    description: string;
  };
}

interface MockLayout {
  id: string;
  name: string;
  layoutElements: any[];
}

interface MockStyle {
  id: string;
  name: string;
  styleConfig: any;
}

export const useMockData = () => {
  const [selectedCV, setSelectedCV] = useState<MockCV | null>(null);
  const [selectedLayout, setSelectedLayout] = useState<MockLayout | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<MockStyle | null>(null);

  // Mock CV data
  const cvs: MockCV[] = [
    {
      id: 'cv-1',
      cvData: {
        personalData: {
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max.mustermann@email.de',
          phone: '+49 123 456789',
          address: 'Berlin, Deutschland',
          profession: 'Software Engineer',
          summary: 'Erfahrener Software Engineer mit Fokus auf Frontend-Entwicklung und moderne Web-Technologien.'
        },
        workExperience: [
          {
            id: 'exp-1',
            position: 'Senior Frontend Developer',
            company: 'Tech Corp GmbH',
            startDate: '2020-01',
            endDate: 'heute',
            location: 'Berlin',
            description: 'Entwicklung moderner Web-Anwendungen mit React, TypeScript und Node.js.'
          }
        ],
        education: [
          {
            id: 'edu-1',
            degree: 'Bachelor of Science Informatik',
            institution: 'Technische Universität Berlin',
            startDate: '2016-10',
            endDate: '2020-09',
            location: 'Berlin',
            grade: '2,1',
            fieldOfStudy: 'Informatik'
          }
        ],
        skills: [
          { id: 'skill-1', name: 'JavaScript', level: 'expert', category: 'Programmierung' },
          { id: 'skill-2', name: 'React', level: 'expert', category: 'Frontend' },
          { id: 'skill-3', name: 'TypeScript', level: 'advanced', category: 'Programmierung' }
        ]
      },
      metadata: {
        styleId: 'style-1',
        layoutId: 'layout-1',
        name: 'Software Engineer CV',
        description: 'Professioneller CV für Software Engineer'
      }
    },
    {
      id: 'cv-2',
      cvData: {
        personalData: {
          firstName: 'Anna',
          lastName: 'Schmidt',
          email: 'anna.schmidt@email.de',
          phone: '+49 987 654321',
          address: 'München, Deutschland',
          profession: 'Marketing Manager',
          summary: 'Kreative Marketing Managerin mit 5+ Jahren Erfahrung in digitalen Kampagnen und Brand Management.'
        },
        workExperience: [
          {
            id: 'exp-2',
            position: 'Marketing Manager',
            company: 'Digital Agency München',
            startDate: '2019-03',
            endDate: 'heute',
            location: 'München',
            description: 'Leitung von digitalen Marketing-Kampagnen und Brand-Strategien für B2B-Kunden.'
          }
        ],
        education: [
          {
            id: 'edu-2',
            degree: 'Master of Arts Marketing',
            institution: 'Ludwig-Maximilians-Universität München',
            startDate: '2017-10',
            endDate: '2019-02',
            location: 'München',
            grade: '1,8',
            fieldOfStudy: 'Marketing'
          }
        ],
        skills: [
          { id: 'skill-4', name: 'Digital Marketing', level: 'expert', category: 'Marketing' },
          { id: 'skill-5', name: 'Google Analytics', level: 'advanced', category: 'Analytics' },
          { id: 'skill-6', name: 'Adobe Creative Suite', level: 'advanced', category: 'Design' }
        ]
      },
      metadata: {
        styleId: 'style-2',
        layoutId: 'layout-2',
        name: 'Marketing Manager CV',
        description: 'Kreativer CV für Marketing-Positionen'
      }
    }
  ];

  const selectCV = (cvId: string) => {
    const cv = cvs.find(c => c.id === cvId);
    setSelectedCV(cv || null);
  };

  return {
    cvs,
    selectedCV,
    selectCV,
    selectedLayout,
    selectedStyle
  };
};