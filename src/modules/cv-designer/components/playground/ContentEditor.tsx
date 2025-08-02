/**
 * Content Editor Phase
 * Focused on editing textual CV content with AI suggestions
 */

import React, { useState } from 'react';
import { CVData, WorkExperience, Education, Skill } from '@/types/cv-designer';
import { ContentSuggestionPanel } from '../../ai/ContentSuggestionPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
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
  const updateWorkExperience = (field: keyof WorkExperience, value: string) => {
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
  const updateEducation = (field: keyof Education, value: string) => {
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
    const newSkill: Skill = {
      id: `skill-${Date.now()}`,
      name: '',
      level: 'intermediate',
      category: 'General'
    };
    updateCVData({ skills: [...cvData.skills, newSkill] });
  };

  // Update skill
  const updateSkill = (index: number, field: keyof Skill, value: string) => {
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>

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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Persönliche Daten</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname</Label>
                  <Input
                    id="firstName"
                    value={cvData.personalData.firstName}
                    onChange={(e) => updatePersonalData('firstName', e.target.value)}
                    placeholder="Max"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname</Label>
                  <Input
                    id="lastName"
                    value={cvData.personalData.lastName}
                    onChange={(e) => updatePersonalData('lastName', e.target.value)}
                    placeholder="Mustermann"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">E-Mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={cvData.personalData.email}
                    onChange={(e) => updatePersonalData('email', e.target.value)}
                    placeholder="max.mustermann@email.de"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={cvData.personalData.phone}
                    onChange={(e) => updatePersonalData('phone', e.target.value)}
                    placeholder="+49 123 456789"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="address">Adresse</Label>
                <Input
                  id="address"
                  value={cvData.personalData.address}
                  onChange={(e) => updatePersonalData('address', e.target.value)}
                  placeholder="Berlin, Deutschland"
                />
              </div>

              <div>
                <Label htmlFor="profession">Berufsbezeichnung</Label>
                <Input
                  id="profession"
                  value={cvData.personalData.profession || ''}
                  onChange={(e) => updatePersonalData('profession', e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>

              <div>
                <Label htmlFor="summary">Profil / Zusammenfassung</Label>
                <textarea
                  id="summary"
                  value={cvData.personalData.summary || ''}
                  onChange={(e) => updatePersonalData('summary', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Beschreiben Sie Ihre beruflichen Ziele und Qualifikationen..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'experience' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-green-600" />
                <span>Berufserfahrung</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Bearbeiten Sie Ihre erste/aktuelle Position. Weitere Positionen können später hinzugefügt werden.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input
                    id="position"
                    value={cvData.workExperience[0]?.position || ''}
                    onChange={(e) => updateWorkExperience('position', e.target.value)}
                    placeholder="Software Engineer"
                  />
                </div>
                <div>
                  <Label htmlFor="company">Unternehmen</Label>
                  <Input
                    id="company"
                    value={cvData.workExperience[0]?.company || ''}
                    onChange={(e) => updateWorkExperience('company', e.target.value)}
                    placeholder="Tech Corp GmbH"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="location">Ort</Label>
                  <Input
                    id="location"
                    value={cvData.workExperience[0]?.location || ''}
                    onChange={(e) => updateWorkExperience('location', e.target.value)}
                    placeholder="Berlin"
                  />
                </div>
                <div>
                  <Label htmlFor="startDate">Von</Label>
                  <Input
                    id="startDate"
                    value={cvData.workExperience[0]?.startDate || ''}
                    onChange={(e) => updateWorkExperience('startDate', e.target.value)}
                    placeholder="2020-01"
                  />
                </div>
                <div>
                  <Label htmlFor="endDate">Bis</Label>
                  <Input
                    id="endDate"
                    value={cvData.workExperience[0]?.endDate || ''}
                    onChange={(e) => updateWorkExperience('endDate', e.target.value)}
                    placeholder="heute"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Beschreibung</Label>
                <textarea
                  id="description"
                  value={cvData.workExperience[0]?.description || ''}
                  onChange={(e) => updateWorkExperience('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="Beschreiben Sie Ihre Aufgaben und Erfolge in dieser Position..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'education' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-purple-600" />
                <span>Ausbildung</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Bearbeiten Sie Ihre höchste/aktuelle Ausbildung. Weitere können später hinzugefügt werden.
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="degree">Abschluss</Label>
                  <Input
                    id="degree"
                    value={cvData.education[0]?.degree || ''}
                    onChange={(e) => updateEducation('degree', e.target.value)}
                    placeholder="Bachelor of Science Informatik"
                  />
                </div>
                <div>
                  <Label htmlFor="institution">Institution</Label>
                  <Input
                    id="institution"
                    value={cvData.education[0]?.institution || ''}
                    onChange={(e) => updateEducation('institution', e.target.value)}
                    placeholder="Technische Universität Berlin"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="eduLocation">Ort</Label>
                  <Input
                    id="eduLocation"
                    value={cvData.education[0]?.location || ''}
                    onChange={(e) => updateEducation('location', e.target.value)}
                    placeholder="Berlin"
                  />
                </div>
                <div>
                  <Label htmlFor="eduStartDate">Von</Label>
                  <Input
                    id="eduStartDate"
                    value={cvData.education[0]?.startDate || ''}
                    onChange={(e) => updateEducation('startDate', e.target.value)}
                    placeholder="2019-10"
                  />
                </div>
                <div>
                  <Label htmlFor="eduEndDate">Bis</Label>
                  <Input
                    id="eduEndDate"
                    value={cvData.education[0]?.endDate || ''}
                    onChange={(e) => updateEducation('endDate', e.target.value)}
                    placeholder="2023-09"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="grade">Note</Label>
                  <Input
                    id="grade"
                    value={cvData.education[0]?.grade || ''}
                    onChange={(e) => updateEducation('grade', e.target.value)}
                    placeholder="2,1"
                  />
                </div>
                <div>
                  <Label htmlFor="fieldOfStudy">Studienrichtung</Label>
                  <Input
                    id="fieldOfStudy"
                    value={cvData.education[0]?.fieldOfStudy || ''}
                    onChange={(e) => updateEducation('fieldOfStudy', e.target.value)}
                    placeholder="Informatik"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="eduDescription">Beschreibung</Label>
                <textarea
                  id="eduDescription"
                  value={cvData.education[0]?.description || ''}
                  onChange={(e) => updateEducation('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Schwerpunkte, Abschlussarbeit, besondere Leistungen..."
                />
              </div>
            </CardContent>
          </Card>
        )}

        {activeSection === 'skills' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-orange-600" />
                  <span>Fähigkeiten</span>
                </div>
                <Button onClick={addSkill} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Fähigkeit hinzufügen
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {cvData.skills.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Brain className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Noch keine Fähigkeiten hinzugefügt</p>
                  <Button onClick={addSkill} className="mt-4">
                    <Plus className="w-4 h-4 mr-2" />
                    Erste Fähigkeit hinzufügen
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cvData.skills.map((skill, index) => (
                    <div key={skill.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          value={skill.name}
                          onChange={(e) => updateSkill(index, 'name', e.target.value)}
                          placeholder="JavaScript"
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
                        <Input
                          value={skill.category || ''}
                          onChange={(e) => updateSkill(index, 'category', e.target.value)}
                          placeholder="Programmierung"
                        />
                      </div>
                      <Button
                        onClick={() => removeSkill(index)}
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {activeSection === 'ai' && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                <span>KI-Assistent</span>
              </CardTitle>
              <p className="text-sm text-gray-600">
                Lassen Sie sich von der KI bei der Optimierung Ihrer Texte helfen.
              </p>
            </CardHeader>
            <CardContent>
              <ContentSuggestionPanel
                cvData={cvData}
                onContentUpdate={handleContentUpdate}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ContentEditor;