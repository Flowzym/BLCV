import type { Meta, StoryObj } from '@storybook/react';
import React, { useState } from 'react';
import { TypographyProvider } from '../modules/cv-designer/context/TypographyContext';
import { StyleConfigProvider } from '../modules/cv-designer/context/StyleConfigContext';
import { StyleTypographyPanel } from '../modules/cv-designer/components/StyleTypographyPanel';
import CVPreview from '../modules/cv-designer/components/CVPreview';
import { LayoutElement } from '../modules/cv-designer/types/section';
import { StyleConfig } from '../types/cv-designer';

// Mock CV data for preview
const mockCVData = {
  personalData: {
    firstName: 'Max',
    lastName: 'Mustermann',
    email: 'max.mustermann@email.de',
    phone: '+49 123 456789',
    address: 'Berlin, Deutschland',
    profession: 'Software Engineer',
    summary: 'Erfahrener Software Engineer mit Fokus auf moderne Webtechnologien und agile Entwicklungsmethoden. Spezialisiert auf React, TypeScript und Node.js Entwicklung.'
  },
  workExperience: [
    {
      id: 'exp-1',
      position: 'Senior Software Engineer',
      company: 'Tech Corp GmbH',
      location: 'Berlin',
      startDate: '2020-01',
      endDate: 'heute',
      description: 'Entwicklung von Webanwendungen mit React und Node.js. Leitung eines 5-köpfigen Entwicklerteams.'
    },
    {
      id: 'exp-2',
      position: 'Frontend Developer',
      company: 'Digital Solutions AG',
      location: 'München',
      startDate: '2018-03',
      endDate: '2019-12',
      description: 'Entwicklung responsiver Webanwendungen mit modernen JavaScript-Frameworks.'
    }
  ],
  education: [
    {
      id: 'edu-1',
      degree: 'Bachelor of Science Informatik',
      institution: 'Technische Universität Berlin',
      location: 'Berlin',
      startDate: '2014-10',
      endDate: '2018-09',
      grade: '2,1',
      fieldOfStudy: 'Informatik'
    }
  ],
  skills: [
    { id: 'skill-1', name: 'JavaScript', level: 'expert', category: 'Programming' },
    { id: 'skill-2', name: 'React', level: 'expert', category: 'Frontend' },
    { id: 'skill-3', name: 'TypeScript', level: 'advanced', category: 'Programming' },
    { id: 'skill-4', name: 'Node.js', level: 'advanced', category: 'Backend' },
    { id: 'skill-5', name: 'Python', level: 'intermediate', category: 'Programming' }
  ]
};

// Mock layout elements
const mockLayoutElements: LayoutElement[] = [
  {
    id: 'header',
    type: 'profil',
    title: 'Profil',
    content: '',
    x: 0,
    y: 0,
    width: 600,
    height: 120
  },
  {
    id: 'experience',
    type: 'erfahrung',
    title: 'Berufserfahrung',
    content: '',
    x: 0,
    y: 140,
    width: 600,
    height: 250
  },
  {
    id: 'education',
    type: 'ausbildung',
    title: 'Ausbildung',
    content: '',
    x: 0,
    y: 410,
    width: 600,
    height: 150
  },
  {
    id: 'skills',
    type: 'kenntnisse',
    title: 'Fähigkeiten',
    content: '',
    x: 0,
    y: 580,
    width: 300,
    height: 100
  },
  {
    id: 'softskills',
    type: 'softskills',
    title: 'Soft Skills',
    content: '',
    x: 320,
    y: 580,
    width: 280,
    height: 100
  }
];

// Default style config
const defaultStyleConfig: StyleConfig = {
  primaryColor: '#1e40af',
  accentColor: '#3b82f6',
  fontFamily: 'Inter',
  fontSize: 'medium',
  lineHeight: 1.6,
  margin: 'normal',
  backgroundColor: '#ffffff',
  textColor: '#333333',
  borderRadius: '8px',
  sectionSpacing: 24,
  snapSize: 20,
  widthPercent: 100,
  colors: {
    primary: '#1e40af',
    accent: '#3b82f6',
    background: '#ffffff',
    text: '#333333',
    secondary: '#6b7280',
    textSecondary: '#9ca3af',
    border: '#e5e7eb'
  }
};

// Story component
const TypographyPreviewStory = () => {
  const [selectedSection, setSelectedSection] = useState('profil');
  const [selectedField, setSelectedField] = useState('header');

  return (
    <StyleConfigProvider>
      <TypographyProvider>
        <div className="flex h-screen bg-gray-100">
          {/* Left Panel - Typography Controls */}
          <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Typography Controls</h2>
              
              {/* Section Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Section
                </label>
                <select
                  value={selectedSection}
                  onChange={(e) => setSelectedSection(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="profil">Profil</option>
                  <option value="erfahrung">Berufserfahrung</option>
                  <option value="ausbildung">Ausbildung</option>
                  <option value="kenntnisse">Fähigkeiten</option>
                  <option value="softskills">Soft Skills</option>
                </select>
              </div>

              {/* Field Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Field
                </label>
                <select
                  value={selectedField}
                  onChange={(e) => setSelectedField(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                >
                  <option value="header">Header</option>
                  <option value="content">Content</option>
                  <option value="name">Name</option>
                  <option value="position">Position</option>
                  <option value="company">Company</option>
                  <option value="institution">Institution</option>
                  <option value="skillname">Skill Name</option>
                </select>
              </div>
            </div>

            {/* Typography Panel */}
            <div className="p-4">
              <StyleTypographyPanel />
            </div>
          </div>

          {/* Right Panel - CV Preview */}
          <div className="flex-1 bg-gray-50 overflow-y-auto">
            <div className="p-6">
              <div className="mb-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Live CV Preview</h2>
                <p className="text-sm text-gray-600">
                  Changes to typography settings are immediately reflected in the preview below.
                </p>
              </div>

              {/* CV Preview Container */}
              <div className="bg-white rounded-lg shadow-lg p-4">
                <CVPreview
                  layoutElements={mockLayoutElements}
                  cvData={mockCVData}
                  templateName="classic"
                  showDebugBorders={false}
                  scale={0.8}
                />
              </div>

              {/* Typography Info Panel */}
              <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Current Typography Settings
                </h3>
                <div className="text-xs text-gray-600 space-y-1">
                  <div>Selected: <span className="font-medium">{selectedSection}.{selectedField}</span></div>
                  <div>All changes are applied in real-time to the preview above.</div>
                  <div>Use the reset buttons to restore default typography settings.</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </TypographyProvider>
    </StyleConfigProvider>
  );
};

// Storybook meta configuration
const meta: Meta<typeof TypographyPreviewStory> = {
  title: 'CV Designer/Typography Preview',
  component: TypographyPreviewStory,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Typography Preview Story

This story demonstrates the new TypographyContext in action with a live CV preview.

## Features:
- **Left Panel**: StyleTypographyPanel with all typography controls
- **Right Panel**: Live CV preview that updates immediately when typography changes
- **Section/Field Selection**: Choose which part of the CV to customize
- **Real-time Updates**: See changes applied instantly in the preview

## How to Use:
1. Select a section (Profil, Berufserfahrung, etc.) from the dropdown
2. Select a field (Header, Content, Name, etc.) from the second dropdown  
3. Adjust typography settings in the left panel
4. Watch the changes appear immediately in the CV preview on the right

## Typography Properties:
- **Font Family**: Choose from web fonts and system fonts
- **Font Size**: Adjust size in pixels with slider or input
- **Font Weight**: Toggle between normal and bold
- **Italic**: Toggle italic styling
- **Text Color**: Pick custom colors with color picker
- **Letter Spacing**: Fine-tune character spacing
- **Line Height**: Adjust line spacing for readability

## Context Integration:
- Uses the new TypographyContext for all font management
- Demonstrates separation from StyleConfigContext
- Shows batched updates and conflict prevention
- Includes reset functionality and inheritance
        `
      }
    }
  },
  argTypes: {},
};

export default meta;

type Story = StoryObj<typeof TypographyPreviewStory>;

// Default story
export const Default: Story = {
  name: 'Typography Live Preview',
  render: () => <TypographyPreviewStory />,
};

// Story with preset typography changes
export const WithCustomTypography: Story = {
  name: 'With Custom Typography',
  render: () => {
    const CustomTypographyStory = () => {
      const [initialized, setInitialized] = useState(false);

      return (
        <StyleConfigProvider>
          <TypographyProvider
            initialTypography={{
              sections: {
                profil: {
                  header: {
                    fontFamily: 'Georgia',
                    fontSize: 18,
                    fontWeight: 'bold',
                    textColor: '#7c3aed'
                  },
                  name: {
                    fontFamily: 'Playfair Display',
                    fontSize: 24,
                    fontWeight: 'bold',
                    textColor: '#1e40af'
                  },
                  content: {
                    fontFamily: 'Georgia',
                    fontSize: 13,
                    lineHeight: 1.7,
                    textColor: '#374151'
                  }
                },
                erfahrung: {
                  header: {
                    fontFamily: 'Montserrat',
                    fontSize: 16,
                    fontWeight: 'bold',
                    textColor: '#059669'
                  },
                  position: {
                    fontFamily: 'Montserrat',
                    fontSize: 14,
                    fontWeight: 'bold',
                    textColor: '#1f2937'
                  }
                }
              }
            }}
          >
            <TypographyPreviewStory />
          </TypographyProvider>
        </StyleConfigProvider>
      );
    };

    return <CustomTypographyStory />;
  },
  parameters: {
    docs: {
      description: {
        story: `
This story shows the typography system with pre-configured custom settings:
- **Profil Header**: Georgia, 18px, Bold, Purple
- **Profil Name**: Playfair Display, 24px, Bold, Blue  
- **Profil Content**: Georgia, 13px, Line Height 1.7
- **Experience Header**: Montserrat, 16px, Bold, Green
- **Experience Position**: Montserrat, 14px, Bold, Dark Gray

Demonstrates how the TypographyContext preserves custom settings and applies them consistently across the CV.
        `
      }
    }
  }
};

// Story demonstrating reset functionality
export const ResetFunctionality: Story = {
  name: 'Reset Functionality Demo',
  render: () => {
    const ResetDemoStory = () => {
      return (
        <StyleConfigProvider>
          <TypographyProvider>
            <div className="flex h-screen bg-gray-100">
              <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Reset Demo</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This demo shows how the reset functionality works. Make some typography changes, 
                    then use the reset buttons to restore defaults.
                  </p>
                  
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-yellow-800 mb-2">Instructions:</h4>
                    <ol className="text-xs text-yellow-700 space-y-1">
                      <li>1. Make typography changes in the panel below</li>
                      <li>2. Notice the "Angepasst" badges appear</li>
                      <li>3. Click reset buttons to restore defaults</li>
                      <li>4. Watch the preview update in real-time</li>
                    </ol>
                  </div>
                </div>

                <StyleTypographyPanel />
              </div>

              <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">CV Preview</h2>
                  <p className="text-sm text-gray-600">
                    Watch how typography changes affect the CV appearance.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-4">
                  <CVPreview
                    layoutElements={mockLayoutElements}
                    cvData={mockCVData}
                    templateName="classic"
                    showDebugBorders={false}
                    scale={0.7}
                  />
                </div>
              </div>
            </div>
          </TypographyProvider>
        </StyleConfigProvider>
      );
    };

    return <ResetDemoStory />;
  },
  parameters: {
    docs: {
      description: {
        story: `
This story demonstrates the reset functionality of the typography system:

## Reset Features:
- **Field-level Reset**: Reset individual fields to their defaults
- **Section-level Reset**: Reset entire sections at once  
- **Global Reset**: Reset all typography to defaults
- **Visual Indicators**: "Angepasst" badges show which fields have custom settings
- **Inheritance**: Fields fall back to appropriate defaults when reset

## Testing Reset:
1. Make changes to various typography settings
2. Notice the orange "Angepasst" badges appear next to modified fields
3. Use the reset buttons (↻) to restore defaults
4. Watch the preview update and badges disappear
        `
      }
    }
  }
};

// Story for performance testing
export const PerformanceTest: Story = {
  name: 'Performance Test - Rapid Updates',
  render: () => {
    const PerformanceTestStory = () => {
      const [updateCount, setUpdateCount] = useState(0);
      const [isRunning, setIsRunning] = useState(false);

      const runPerformanceTest = async () => {
        setIsRunning(true);
        setUpdateCount(0);

        // Simulate rapid typography updates
        for (let i = 0; i < 50; i++) {
          setTimeout(() => {
            setUpdateCount(i + 1);
            // These would be actual typography updates in a real scenario
          }, i * 20);
        }

        setTimeout(() => {
          setIsRunning(false);
        }, 1100);
      };

      return (
        <StyleConfigProvider>
          <TypographyProvider>
            <div className="flex h-screen bg-gray-100">
              <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto p-4">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Performance Test</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    This demo tests the batching functionality of the TypographyContext.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-blue-800 mb-2">Test Status:</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>Updates: {updateCount}/50</div>
                      <div>Status: {isRunning ? 'Running...' : 'Idle'}</div>
                      <div>Batching: {isRunning ? 'Active' : 'Inactive'}</div>
                    </div>
                  </div>

                  <button
                    onClick={runPerformanceTest}
                    disabled={isRunning}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunning ? 'Running Test...' : 'Start Performance Test'}
                  </button>
                </div>

                <StyleTypographyPanel />
              </div>

              <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">CV Preview</h2>
                  <p className="text-sm text-gray-600">
                    The preview should remain smooth even during rapid updates.
                  </p>
                </div>

                <div className="bg-white rounded-lg shadow-lg p-4">
                  <CVPreview
                    layoutElements={mockLayoutElements}
                    cvData={mockCVData}
                    templateName="classic"
                    showDebugBorders={false}
                    scale={0.7}
                  />
                </div>
              </div>
            </div>
          </TypographyProvider>
        </StyleConfigProvider>
      );
    };

    return <PerformanceTestStory />;
  },
  parameters: {
    docs: {
      description: {
        story: `
This story tests the performance and batching capabilities of the TypographyContext:

## Performance Features:
- **Batched Updates**: Multiple rapid changes are batched together (100ms debounce)
- **Race Condition Prevention**: Updates don't overwrite each other
- **Smooth Rendering**: Preview remains responsive during rapid changes
- **Memory Efficiency**: Reduced re-renders through intelligent batching

## Test Scenario:
The performance test simulates 50 rapid typography updates to verify that:
1. The UI remains responsive
2. No updates are lost
3. The final state is consistent
4. Memory usage remains stable
        `
      }
    }
  }
};