/**
 * Mapping Hook
 * Converts CV data to sections for preview rendering
 */

import { useCallback } from 'react';
import { CVData } from '@/types/cv-designer';

export interface MappingOptions {
  locale: string;
  layoutType: string;
}

export interface MappingResult {
  sections: any[];
  metadata: {
    totalSections: number;
    mappedFields: number;
    locale: string;
    layoutType: string;
  };
}

export interface UseMappingReturn {
  mapCVData: (cvData: CVData, options: MappingOptions) => MappingResult;
  lastMappingResult: MappingResult | null;
}

export function useMapping(): UseMappingReturn {
  const mapCVData = useCallback((cvData: CVData, options: MappingOptions): MappingResult => {
    const sections: any[] = [];

    // Personal Data Section
    if (cvData.personalData) {
      sections.push({
        id: 'personal-data',
        type: 'personal',
        title: 'Persönliche Daten',
        content: cvData.personalData.summary || '',
        data: {
          name: `${cvData.personalData.firstName} ${cvData.personalData.lastName}`,
          profession: cvData.personalData.profession,
          email: cvData.personalData.email,
          phone: cvData.personalData.phone,
          address: cvData.personalData.address,
          summary: cvData.personalData.summary,
          profileImage: cvData.personalData.profileImage
        }
      });
    }

    // Work Experience Section
    if (cvData.workExperience && cvData.workExperience.length > 0) {
      sections.push({
        id: 'work-experience',
        type: 'experience',
        title: 'Berufserfahrung',
        content: cvData.workExperience.map(exp => ({
          position: exp.position,
          company: exp.company,
          startDate: exp.startDate,
          endDate: exp.endDate,
          description: exp.description,
          tasks: exp.tasks || []
        }))
      });
    }

    // Education Section
    if (cvData.education && cvData.education.length > 0) {
      sections.push({
        id: 'education',
        type: 'education',
        title: 'Ausbildung',
        content: cvData.education.map(edu => ({
          degree: edu.degree,
          institution: edu.institution,
          startDate: edu.startDate,
          endDate: edu.endDate,
          description: edu.description
        }))
      });
    }

    // Skills Section
    if (cvData.skills && cvData.skills.length > 0) {
      sections.push({
        id: 'skills',
        type: 'skills',
        title: 'Fähigkeiten',
        content: cvData.skills.map(skill => ({
          name: skill.name,
          level: skill.level,
          category: skill.category
        }))
      });
    }

    // Languages Section
    if (cvData.languages && cvData.languages.length > 0) {
      sections.push({
        id: 'languages',
        type: 'languages',
        title: 'Sprachen',
        content: cvData.languages.map(lang => ({
          name: lang.name,
          level: lang.level
        }))
      });
    }

    const result: MappingResult = {
      sections,
      metadata: {
        totalSections: sections.length,
        mappedFields: sections.reduce((acc, section) => {
          if (Array.isArray(section.content)) {
            return acc + section.content.length;
          }
          return acc + Object.keys(section.content).length;
        }, 0),
        locale: options.locale,
        layoutType: options.layoutType
      }
    };

    return result;
  }, []);

  return {
    mapCVData,
    lastMappingResult: null
  };
}