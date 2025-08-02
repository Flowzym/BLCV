/**
 * CV Preview Component
 * Renders a live preview of the CV based on sections and style configuration
 */

import React from 'react';

interface CVPreviewProps {
  sections: any[];
  styleConfig: any;
  cvData: any;
}

export const CVPreview: React.FC<CVPreviewProps> = ({
  sections,
  styleConfig,
  cvData
}) => {
  return (
    <div 
      className="cv-preview p-6 bg-white"
      style={{
        fontFamily: styleConfig?.fontFamily || 'Inter',
        fontSize: styleConfig?.fontSize || '14px',
        color: styleConfig?.textColor || '#000000'
      }}
    >
      {/* Header with personal data */}
      {cvData?.personalData && (
        <div className="cv-header mb-6">
          <div className="flex items-start space-x-4">
            {cvData.personalData.profileImage && (
              <div className="flex-shrink-0">
                <img
                  src={cvData.personalData.profileImage}
                  alt="Profile"
                  className="w-20 h-20 rounded-full object-cover border-2"
                  style={{ borderColor: styleConfig?.primaryColor || '#3b82f6' }}
                />
              </div>
            )}
            <div className="flex-1">
              <h1 
                className="text-2xl font-bold mb-2"
                style={{ color: styleConfig?.primaryColor || '#1e40af' }}
              >
                {cvData.personalData.firstName} {cvData.personalData.lastName}
              </h1>
              {cvData.personalData.profession && (
                <h2 className="text-lg text-gray-600 mb-2">
                  {cvData.personalData.profession}
                </h2>
              )}
              <div className="text-sm text-gray-600 space-y-1">
                {cvData.personalData.email && (
                  <div>{cvData.personalData.email}</div>
                )}
                {cvData.personalData.phone && (
                  <div>{cvData.personalData.phone}</div>
                )}
                {cvData.personalData.address && (
                  <div>{cvData.personalData.address}</div>
                )}
              </div>
            </div>
          </div>
          {cvData.personalData.summary && (
            <div className="mt-4">
              <h3 
                className="font-semibold mb-2"
                style={{ color: styleConfig?.primaryColor || '#1e40af' }}
              >
                Profil
              </h3>
              <p className="text-gray-700 leading-relaxed">
                {cvData.personalData.summary}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Work Experience */}
      {cvData?.workExperience && cvData.workExperience.length > 0 && (
        <div className="cv-section mb-6">
          <h3 
            className="text-lg font-semibold mb-3 pb-1 border-b"
            style={{ 
              color: styleConfig?.primaryColor || '#1e40af',
              borderColor: styleConfig?.primaryColor || '#3b82f6'
            }}
          >
            Berufserfahrung
          </h3>
          <div className="space-y-4">
            {cvData.workExperience.map((exp: any, index: number) => (
              <div key={index} className="experience-item">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">{exp.position}</h4>
                  <span className="text-sm text-gray-500">
                    {exp.startDate} - {exp.endDate || 'heute'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {exp.company} {exp.location && `• ${exp.location}`}
                </div>
                {exp.description && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {cvData?.education && cvData.education.length > 0 && (
        <div className="cv-section mb-6">
          <h3 
            className="text-lg font-semibold mb-3 pb-1 border-b"
            style={{ 
              color: styleConfig?.primaryColor || '#1e40af',
              borderColor: styleConfig?.primaryColor || '#3b82f6'
            }}
          >
            Ausbildung
          </h3>
          <div className="space-y-4">
            {cvData.education.map((edu: any, index: number) => (
              <div key={index} className="education-item">
                <div className="flex justify-between items-start mb-1">
                  <h4 className="font-medium">{edu.degree}</h4>
                  <span className="text-sm text-gray-500">
                    {edu.startDate} - {edu.endDate}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  {edu.institution} {edu.location && `• ${edu.location}`}
                </div>
                {edu.grade && (
                  <div className="text-sm text-gray-600 mb-2">
                    Note: {edu.grade}
                  </div>
                )}
                {edu.description && (
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {edu.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {cvData?.skills && cvData.skills.length > 0 && (
        <div className="cv-section mb-6">
          <h3 
            className="text-lg font-semibold mb-3 pb-1 border-b"
            style={{ 
              color: styleConfig?.primaryColor || '#1e40af',
              borderColor: styleConfig?.primaryColor || '#3b82f6'
            }}
          >
            Fähigkeiten
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {cvData.skills.map((skill: any, index: number) => (
              <div key={index} className="skill-item">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-sm text-gray-500">{skill.level}</span>
                </div>
                {skill.category && (
                  <div className="text-xs text-gray-500">{skill.category}</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Sections from mapping */}
      {sections && sections.length > 0 && (
        <div className="mapped-sections">
          {sections.map((section: any, index: number) => (
            <div key={index} className="cv-section mb-4">
              {section.title && (
                <h3 
                  className="text-lg font-semibold mb-3 pb-1 border-b"
                  style={{ 
                    color: styleConfig?.primaryColor || '#1e40af',
                    borderColor: styleConfig?.primaryColor || '#3b82f6'
                  }}
                >
                  {section.title}
                </h3>
              )}
              {section.content && (
                <div className="text-sm text-gray-700 leading-relaxed">
                  {section.content}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CVPreview;