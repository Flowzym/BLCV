/**
 * CV Preview Component
 * Renders a preview of the CV using MappedSections and StyleConfig
 */

import React from 'react';
import { MappedSection, StyleConfig } from '../types';
import { defaultStyleConfig } from '../config/defaultStyleConfig';

interface CVPreviewProps {
  sections: MappedSection[];
  styleConfig: StyleConfig;
  className?: string;
  cvData?: any; // Optional, kept for metadata purposes
  layout?: any;
  size?: string;
  showControls?: boolean;
  readonly?: boolean;
}

export const CVPreview: React.FC<CVPreviewProps> = ({
  sections = [],
  styleConfig,
  className = '',
  cvData, // Optional metadata
  layout = 'default',
  size = 'medium'
}) => {
  // Ensure styleConfig is always a valid object with fallback to defaults
  const safeStyleConfig = styleConfig || defaultStyleConfig;

  // Convert fontSize enum to actual CSS values
  const getFontSizeValue = (size: string) => {
    switch (size) {
      case 'small': return '14px';
      case 'large': return '18px';
      default: return '16px'; // medium
    }
  };

  // Main container styles
  const containerStyle = {
    fontFamily: safeStyleConfig.fontFamily || 'Arial',
    fontSize: getFontSizeValue(safeStyleConfig.fontSize || 'medium'),
    lineHeight: safeStyleConfig.lineHeight || 1.5,
    padding: safeStyleConfig.padding || '16px',
    borderRadius: safeStyleConfig.borderRadius,
    border: safeStyleConfig.border,
    boxShadow: safeStyleConfig.boxShadow
  };

  // CV page styles
  const pageStyle = {
    backgroundColor: safeStyleConfig.backgroundColor || '#ffffff',
    color: safeStyleConfig.textColor || '#333333',
    fontFamily: safeStyleConfig.fontFamily || 'Arial',
    fontSize: getFontSizeValue(safeStyleConfig.fontSize || 'medium'),
    lineHeight: safeStyleConfig.lineHeight || 1.5,
    width: safeStyleConfig.widthPercent ? `${safeStyleConfig.widthPercent}%` : '210mm',
    minHeight: '297mm', // A4 height
    padding: safeStyleConfig.margin === 'narrow' ? '1rem' :
            safeStyleConfig.margin === 'wide' ? '3rem' : '2rem',
    margin: '0 auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  // Render individual section
  const renderSection = (section: MappedSection) => {
    const sectionStyle = {
      marginBottom: `${safeStyleConfig.sectionSpacing || 24}px`,
      padding: safeStyleConfig.padding || '16px',
      borderRadius: safeStyleConfig.borderRadius || '8px',
      fontFamily: safeStyleConfig.fontFamily || 'Arial',
      fontSize: getFontSizeValue(safeStyleConfig.fontSize || 'medium'),
      lineHeight: safeStyleConfig.lineHeight || 1.5,
      color: safeStyleConfig.textColor || '#333333',
      border: safeStyleConfig.border,
      boxShadow: safeStyleConfig.boxShadow
    };

    const titleStyle = {
      color: safeStyleConfig.primaryColor || '#1e40af',
      fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 1.3)`,
      fontWeight: 'bold',
      fontFamily: safeStyleConfig.fontFamily || 'Arial',
      lineHeight: safeStyleConfig.lineHeight || 1.5,
      marginBottom: '16px',
      borderBottom: `2px solid ${safeStyleConfig.accentColor || '#3b82f6'}`,
      paddingBottom: '8px'
    };

    const contentStyle = {
      fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.95)`,
      color: safeStyleConfig.textColor || '#333333',
      fontFamily: safeStyleConfig.fontFamily || 'Arial',
      lineHeight: (safeStyleConfig.lineHeight || 1.5) * 1.1,
      whiteSpace: 'pre-line' as const,
      marginBottom: '12px'
    };

    return (
      <div key={section.id} style={sectionStyle}>
        <h3 style={titleStyle}>{section.title}</h3>
        
        {section.content && (
          <div style={contentStyle}>
            {section.content}
          </div>
        )}
        
        {section.data && renderSectionData(section, cvData)}
        
        {process.env.NODE_ENV === 'development' && section.props?.isFallback && (
          <div style={{ 
            fontSize: '12px', 
            color: '#ef4444', 
            fontStyle: 'italic',
            marginTop: '8px'
          }}>
            ⚠️ Fallback section - unmapped data
          </div>
        )}
      </div>
    );
  };

  // Render section-specific data
  const renderSectionData = (section: MappedSection, cvData?: any) => {
    if (!section.data) return null;

    switch (section.type) {
      case 'experience':
        return renderExperienceData(section.data);
      case 'education':
        return renderEducationData(section.data);
      case 'skills':
        return renderSkillsData(section.data);
      case 'personal':
        return renderSummaryData(section.data, cvData?.personalData);
      default:
        return null;
    }
  };

  // Render experience data
  const renderExperienceData = (data: any) => {
    if (!data) return null;

    const technologies = Array.isArray(data.technologies) ? data.technologies : [];

    return (
      <div style={{ 
        fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.9)`,
        color: safeStyleConfig.textColor || '#333333',
        fontFamily: safeStyleConfig.fontFamily || 'Arial',
        lineHeight: safeStyleConfig.lineHeight || 1.5
      }}>
        {data.position && data.company && (
          <div style={{ 
            fontWeight: 'bold',
            color: safeStyleConfig.accentColor || '#3b82f6',
            fontFamily: safeStyleConfig.fontFamily || 'Arial',
            marginBottom: '4px',
            fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 1.1)`
          }}>
            {data.position} at {data.company}
          </div>
        )}
        
        {data.dateRange && (
          <div style={{ 
            color: safeStyleConfig.textColor || '#333333',
            fontFamily: safeStyleConfig.fontFamily || 'Arial',
            fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.85)`,
            marginBottom: '4px'
          }}>
            {data.dateRange}
          </div>
        )}
        
        {data.location && (
          <div style={{ 
            color: safeStyleConfig.textColor || '#333333',
            fontFamily: safeStyleConfig.fontFamily || 'Arial',
            fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.85)`,
            marginBottom: '8px'
          }}>
            {data.location}
          </div>
        )}
        
        {technologies.length > 0 && (
          <div style={{ 
            marginTop: '8px',
            color: safeStyleConfig.textColor || '#333333',
            fontFamily: safeStyleConfig.fontFamily || 'Arial',
            fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.85)`
          }}>
            <strong style={{ color: safeStyleConfig.accentColor || '#3b82f6' }}>
              Technologies:
            </strong> {technologies.join(', ')}
          </div>
        )}
      </div>
    );
  };

  // Render education data
  const renderEducationData = (data: any) => {
    if (!data) return null;

    return (
      <div style={{ 
        fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.9)`,
        color: safeStyleConfig.textColor || '#333333',
        fontFamily: safeStyleConfig.fontFamily || 'Arial',
        lineHeight: safeStyleConfig.lineHeight || 1.5
      }}>
        {data.degree && (
          <div style={{ 
            fontWeight: 'bold',
            color: safeStyleConfig.accentColor || '#3b82f6',
            fontFamily: safeStyleConfig.fontFamily || 'Arial',
            marginBottom: '4px',
            fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 1.1)`
          }}>
            {data.degree}
          </div>
        )}
        
        {data.institution && (
          <div style={{ 
            color: safeStyleConfig.textColor || '#333333',
            fontFamily: safeStyleConfig.fontFamily || 'Arial',
            fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.95)`,
            marginBottom: '4px'
          }}>
            {data.institution}
          </div>
        )}
        
        {data.dateRange && (
          <div style={{ 
            color: safeStyleConfig.textColor || '#333333',
            fontFamily: safeStyleConfig.fontFamily || 'Arial',
            fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.85)`,
            marginBottom: '4px'
          }}>
            {data.dateRange}
          </div>
        )}
        
        {data.grade && (
          <div style={{ 
            color: safeStyleConfig.textColor || '#333333',
            fontFamily: safeStyleConfig.fontFamily || 'Arial',
            fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.85)`
          }}>
            Grade: {data.grade}
          </div>
        )}
      </div>
    );
  };

  // Render skills data
  const renderSkillsData = (data: any) => {
    if (!data) return null;

    const skillsToRender = Array.isArray(data.skills) ? data.skills : [];

    return (
      <div>
        {data.showCategories && data.skillsByCategory ? (
          Object.entries(data.skillsByCategory || {}).map(([category, skills]: [string, any[]]) => {
            const skillsArray = Array.isArray(skills) ? skills : [];
            
            return (
              <div key={category} style={{ marginBottom: '12px' }}>
                <div style={{ 
                  fontWeight: 'bold', 
                  color: safeStyleConfig.accentColor || '#3b82f6',
                  fontFamily: safeStyleConfig.fontFamily || 'Arial',
                  fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.95)`,
                  marginBottom: '8px'
                }}>
                  {category}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {skillsArray.map((skill: any) => {
                    if (!skill || !skill.name) return null;
                    return (
                      <span
                        key={skill.id || skill.name}
                        style={{
                          backgroundColor: safeStyleConfig.accentColor || '#3b82f6',
                          color: 'white',
                          padding: '6px 12px',
                          borderRadius: '20px',
                          fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.8)`,
                          fontFamily: safeStyleConfig.fontFamily || 'Arial',
                          fontWeight: '500'
                        }}
                      >
                        {skill.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {skillsToRender.map((skill: any) => {
              if (!skill || !skill.name) return null;
              return (
                <span
                  key={skill.id || skill.name}
                  style={{
                    backgroundColor: safeStyleConfig.accentColor || '#3b82f6',
                    color: 'white',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.8)`,
                    fontFamily: safeStyleConfig.fontFamily || 'Arial',
                    fontWeight: '500'
                  }}
                >
                  {skill.name}
                </span>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  // Render summary data (for profile images and other personal data)
  const renderSummaryData = (data: any, personalData?: any) => {
    if (!data && !personalData) return null;

    return (
      <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        {/* Profile Image from cvData if available */}
        {personalData?.profileImage && (
          <div style={{ marginBottom: '16px' }}>
            <img
              src={personalData.profileImage}
              alt="Profile"
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: `4px solid ${safeStyleConfig.accentColor || '#e5e7eb'}`,
                boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                margin: '0 auto',
                display: 'block'
              }}
            />
          </div>
        )}
        
        {/* Name from personalData if available */}
        {personalData && (
          <>
            <h1 
              style={{
                fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 1.8)`,
                fontWeight: 'bold',
                color: safeStyleConfig.primaryColor || '#1e40af',
                fontFamily: safeStyleConfig.fontFamily || 'Arial',
                lineHeight: safeStyleConfig.lineHeight || 1.5,
                marginBottom: '8px'
              }}
            >
              {personalData.firstName} {personalData.lastName}
            </h1>
            
            {personalData.profession && (
              <h2 
                style={{
                  fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 1.3)`,
                  fontWeight: '600',
                  color: safeStyleConfig.accentColor || '#3b82f6',
                  fontFamily: safeStyleConfig.fontFamily || 'Arial',
                  lineHeight: safeStyleConfig.lineHeight || 1.5,
                  marginBottom: '12px'
                }}
              >
                {personalData.profession}
              </h2>
            )}
            
            {/* Contact Info */}
            <div style={{ marginBottom: '16px', fontSize: `calc(${getFontSizeValue(safeStyleConfig.fontSize || 'medium')} * 0.9)` }}>
              {personalData.email && (
                <div style={{ marginBottom: '4px', color: safeStyleConfig.textColor || '#374151' }}>
                  {personalData.email}
                </div>
              )}
              {personalData.phone && (
                <div style={{ marginBottom: '4px', color: safeStyleConfig.textColor || '#374151' }}>
                  {personalData.phone}
                </div>
              )}
              {personalData.address && (
                <div style={{ color: safeStyleConfig.textColor || '#374151' }}>
                  {personalData.address}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  // Ensure sections is always an array
  const safeSections = Array.isArray(sections) ? sections : [];

  return (
    <div className={`cv-preview ${className}`} style={containerStyle}>
      <div className="cv-preview-page" style={pageStyle}>
        {safeSections.length === 0 ? (
          <div style={{ 
            textAlign: 'center', 
            color: '#6b7280', 
            padding: '40px',
            fontSize: getFontSizeValue(safeStyleConfig.fontSize || 'medium'),
            fontFamily: safeStyleConfig.fontFamily || 'Arial'
          }}>
            No sections to display
          </div>
        ) : (
          safeSections
            .sort((a, b) => (a.props?.priority || 99) - (b.props?.priority || 99))
            .map(renderSection)
        )}
      </div>
    </div>
  );
};

export default CVPreview;