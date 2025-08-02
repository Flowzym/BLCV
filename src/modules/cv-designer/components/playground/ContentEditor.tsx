/**
 * Content Editor Phase
 * Focused on editing textual CV content with AI suggestions
 */

import React, { useState } from 'react';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  Brain,
  Plus,
  Trash2,
  FileText,
  Sparkles
} from 'lucide-react';

// Mock CVData interface for playground
interface CVData {
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
}

interface ContentEditorProps {
  cvData: CVData | null;
  setCVData: (data: CVData | null) => void;
}

export const ContentEditor: React.FC<ContentEditorProps> = ({
  cvData,
  setCVData
}) => {
  const [activeSection, setActiveSection] = useState<'personal' | 'experience' | 'education' | 'skills' | 'ai'>('personal');

  // Helper function to update CV data safely
  const updateCVData = (updates: Partial<CVData>) => {
    if (!cvData) return;
    setCVData({ ...cvData, ...updates });
  };

  // Update personal data
  const updatePersonalData = (field: keyof CVData['personalData'], value: string) => {
    if (!cvData) return;
    updateCVData({
      personalData: { ...cvData.personalData, [field]: value }
    });
  };

  // Update work experience (first entry)
  const updateWorkExperience = (field: string, value: string) => {
    if (!cvData) return;
    const experience = cvData.workExperience[0] || {
      id: `exp-${Date.now()}`,
      position: '',
      company: '',
      startDate: '',
      endDate: '',
      description: ''
    };
    
    const updatedExperience = { ...experience, [field]: value };
    const newWorkExperience = cvData.workExperience.length > 0 
      ? [updatedExperience, ...cvData.workExperience.slice(1)]
      : [updatedExperience];
    
    updateCVData({ workExperience: newWorkExperience });
  };

  // Update education (first entry)
  const updateEducation = (field: string, value: string) => {
    if (!cvData) return;
    const education = cvData.education[0] || {
      id: `edu-${Date.now()}`,
      degree: '',
      institution: '',
      startDate: '',
      endDate: ''
    };
    
    const updatedEducation = { ...education, [field]: value };
    const newEducation = cvData.education.length > 0 
      ? [updatedEducation, ...cvData.education.slice(1)]
      : [updatedEducation];
    
    updateCVData({ education: newEducation });
  };

  // Add new skill
  const addSkill = () => {
    if (!cvData) return;
    const newSkill = {
      id: `skill-${Date.now()}`,
      name: '',
      level: 'intermediate',
      category: 'General'
    };
    updateCVData({ skills: [...cvData.skills, newSkill] });
  };

  // Update skill
  const updateSkill = (index: number, field: string, value: string) => {
    if (!cvData) return;
    const newSkills = cvData.skills.map((skill, i) => 
      i === index ? { ...skill, [field]: value } : skill
    );
    updateCVData({ skills: newSkills });
  };

  // Remove skill
  const removeSkill = (index: number) => {
    if (!cvData) return;
    const newSkills = cvData.skills.filter((_, i) => i !== index);
    updateCVData({ skills: newSkills });
  };

  // Handle AI content updates
  const handleContentUpdate = (sectionType: string, newContent: string) => {
    if (!cvData) return;
    
    switch (sectionType) {
      case 'summary':
        updatePersonalData('summary', newContent);
        break;
      case 'experience':
        updateWorkExperience('description', newContent);
        break;
      case 'education':
        updateEducation('description', newContent);
        break;
      default:
        console.log('Unknown section type for AI update:', sectionType);
    }
  };

  const sections = [
    { id: 'personal', label: 'Persönliche Daten', icon: User },
    { id: 'experience', label: 'Berufserfahrung', icon: Briefcase },
    { id: 'education', label: 'Ausbildung', icon: GraduationCap },
    { id: 'skills', label: 'Fähigkeiten', icon: Brain },
    { id: 'ai', label: 'KI-Assistent', icon: Sparkles }
  ];

  if (!cvData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inhalt bearbeiten</h2>
          <p className="text-gray-600">
            Bearbeiten Sie die textuellen Inhalte Ihres Lebenslaufs mit KI-Unterstützung.
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">Kein CV geladen</p>
            <p className="text-sm">
              Gehen Sie zur "Start / CV laden"-Phase, um einen CV zu laden oder zu erstellen.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inhalt bearbeiten</h2>
        <p className="text-gray-600">
          Bearbeiten Sie die textuellen Inhalte Ihres Lebenslaufs mit KI-Unterstützung.
        </p>
      </div>

      {/* Current CV Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-medium text-blue-900">
                Bearbeitung: {cvData.personalData.firstName} {cvData.personalData.lastName}
              </h3>
              <p className="text-sm text-blue-700">
                {cvData.personalData.profession || 'Keine Berufsbezeichnung'} • 
                {cvData.workExperience.length} Berufserfahrungen • 
                {cvData.skills.length} Fähigkeiten
              </p>
            </div>
          </div>
      </div>

      {/* Section Navigation */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-0">
          {sections.map(section => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id as any)}
                className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'text-blue-600 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700 border-transparent'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Section Content */}
      <div className="min-h-96">
        {activeSection === 'personal' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Persönliche Daten</span>
              </h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">Vorname</label>
                  <input
                    id="firstName"
                    type="text"
                    value={cvData.personalData.firstName}
                    onChange={(e) => updatePersonalData('firstName', e.target.value)}
                    placeholder="Max"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Nachname</label>
                  <input
                    id="lastName"
                    type="text"
                    value={cvData.personalData.lastName}
                    onChange={(e) => updatePersonalData('lastName', e.target.value)}
                    placeholder="Mustermann"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">E-Mail</label>
                  <input
                    id="email"
                    type="email"
                    value={cvData.personalData.email}
                    onChange={(e) => updatePersonalData('email', e.target.value)}
                    placeholder="max.mustermann@email.de"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
                  <input
                    id="phone"
                    type="tel"
                    value={cvData.personalData.phone}
                    onChange={(e) => updatePersonalData('phone', e.target.value)}
                    placeholder="+49 123 456789"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
                <input
                  id="address"
                  type="text"
                  value={cvData.personalData.address}
                  onChange={(e) => updatePersonalData('address', e.target.value)}
                  placeholder="Berlin, Deutschland"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-gray-700 mb-1">Berufsbezeichnung</label>
                <input
                  id="profession"
                  type="text"
                  value={cvData.personalData.profession || ''}
                  onChange={(e) => updatePersonalData('profession', e.target.value)}
                  placeholder="Software Engineer"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-1">Profil / Zusammenfassung</label>
                <textarea
                  id="summary"
                  value={cvData.personalData.summary || ''}
                  onChange={(e) => updatePersonalData('summary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Beschreiben Sie Ihre beruflichen Ziele und Qualifikationen..."
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'experience' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                <span>Berufserfahrung</span>
              </h3>
              <p className="text-sm text-gray-600">
                Bearbeiten Sie Ihre erste/aktuelle Position. Weitere Positionen können später hinzugefügt werden.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                  <input
                    id="position"
                    type="text"
                    value={cvData.workExperience[0]?.position || ''}
                    onChange={(e) => updateWorkExperience('position', e.target.value)}
                    placeholder="Software Engineer"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Unternehmen</label>
                  <input
                    id="company"
                    type="text"
                    value={cvData.workExperience[0]?.company || ''}
                    onChange={(e) => updateWorkExperience('company', e.target.value)}
                    placeholder="Tech Corp GmbH"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                  <input
                    id="location"
                    type="text"
                    value={cvData.workExperience[0]?.location || ''}
                    onChange={(e) => updateWorkExperience('location', e.target.value)}
                    placeholder="Berlin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">Von</label>
                  <input
                    id="startDate"
                    type="text"
                    value={cvData.workExperience[0]?.startDate || ''}
                    onChange={(e) => updateWorkExperience('startDate', e.target.value)}
                    placeholder="2020-01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
                  <input
                    id="endDate"
                    type="text"
                    value={cvData.workExperience[0]?.endDate || ''}
                    onChange={(e) => updateWorkExperience('endDate', e.target.value)}
                    placeholder="heute"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  id="description"
                  value={cvData.workExperience[0]?.description || ''}
                  onChange={(e) => updateWorkExperience('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Beschreiben Sie Ihre Aufgaben und Erfolge in dieser Position..."
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'education' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span>Ausbildung</span>
              </h3>
              <p className="text-sm text-gray-600">
                Bearbeiten Sie Ihre höchste/aktuelle Ausbildung. Weitere können später hinzugefügt werden.
              </p>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="degree" className="block text-sm font-medium text-gray-700 mb-1">Abschluss</label>
                  <input
                    id="degree"
                    type="text"
                    value={cvData.education[0]?.degree || ''}
                    onChange={(e) => updateEducation('degree', e.target.value)}
                    placeholder="Bachelor of Science Informatik"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="institution" className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                  <input
                    id="institution"
                    type="text"
                    value={cvData.education[0]?.institution || ''}
                    onChange={(e) => updateEducation('institution', e.target.value)}
                    placeholder="Technische Universität Berlin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="eduLocation" className="block text-sm font-medium text-gray-700 mb-1">Ort</label>
                  <input
                    id="eduLocation"
                    type="text"
                    value={cvData.education[0]?.location || ''}
                    onChange={(e) => updateEducation('location', e.target.value)}
                    placeholder="Berlin"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="eduStartDate" className="block text-sm font-medium text-gray-700 mb-1">Von</label>
                  <input
                    id="eduStartDate"
                    type="text"
                    value={cvData.education[0]?.startDate || ''}
                    onChange={(e) => updateEducation('startDate', e.target.value)}
                    placeholder="2019-10"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="eduEndDate" className="block text-sm font-medium text-gray-700 mb-1">Bis</label>
                  <input
                    id="eduEndDate"
                    type="text"
                    value={cvData.education[0]?.endDate || ''}
                    onChange={(e) => updateEducation('endDate', e.target.value)}
                    placeholder="2023-09"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-1">Note</label>
                  <input
                    id="grade"
                    type="text"
                    value={cvData.education[0]?.grade || ''}
                    onChange={(e) => updateEducation('grade', e.target.value)}
                    placeholder="2,1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="fieldOfStudy" className="block text-sm font-medium text-gray-700 mb-1">Studienrichtung</label>
                  <input
                    id="fieldOfStudy"
                    type="text"
                    value={cvData.education[0]?.fieldOfStudy || ''}
                    onChange={(e) => updateEducation('fieldOfStudy', e.target.value)}
                    placeholder="Informatik"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="eduDescription" className="block text-sm font-medium text-gray-700 mb-1">Beschreibung</label>
                <textarea
                  id="eduDescription"
                  value={cvData.education[0]?.description || ''}
                  onChange={(e) => updateEducation('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Schwerpunkte, Abschlussarbeit, besondere Leistungen..."
                />
              </div>
            </div>
          </div>
        )}

        {activeSection === 'skills' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-orange-600" />
                  <span>Fähigkeiten</span>
                </h3>
              </div>
              <button
                onClick={addSkill}
                className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Fähigkeit hinzufügen
              </button>
            </div>
            <div className="p-6">
              {cvData.skills.length === 0 ? (
                <div className="flex items-center space-x-2">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Noch keine Fähigkeiten hinzugefügt</p>
                  <button 
                    onClick={addSkill}
                    className="mt-4 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Erste Fähigkeit hinzufügen
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cvData.skills.map((skill, index) => (
                    <div key={skill.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input
                          type="text"
                          value={skill.name}
                          onChange={(e) => updateSkill(index, 'name', e.target.value)}
                          placeholder="JavaScript"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                        <select
                          value={skill.level}
                          onChange={(e) => updateSkill(index, 'level', e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="beginner">Anfänger</option>
                          <option value="intermediate">Fortgeschritten</option>
                          <option value="advanced">Sehr gut</option>
                          <option value="expert">Experte</option>
                        </select>
                        <input
                          type="text"
                          value={skill.category || ''}
                          onChange={(e) => updateSkill(index, 'category', e.target.value)}
                          placeholder="Programmierung"
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <button
                        onClick={() => removeSkill(index)}
                        className="p-2 text-red-600 hover:text-red-800 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeSection === 'ai' && (
          <div className="bg-white border border-gray-200 rounded-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>KI-Assistent</span>
              </h3>
              <p className="text-sm text-gray-600">
                Lassen Sie sich von der KI bei der Optimierung Ihrer Texte helfen.
              </p>
            </div>
            <div className="p-6">
              <div className="text-center py-8 text-gray-500">
                <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">KI-Assistent</p>
                <p className="text-sm">
                  KI-gestützte Inhaltsoptimierung wird in einer späteren Phase implementiert.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentEditor;