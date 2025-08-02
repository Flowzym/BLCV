// 📄 src/pages/CVPlayground.tsx

import { useState } from "react"
import { LayoutElement } from "@/modules/cv-designer/types/section"
import { defaultStyleConfig } from "@/modules/cv-designer/config/defaultStyleConfig"
import { Button } from "@/components/ui/button"
import { LayoutDesigner } from "@/modules/cv-designer/components/LayoutDesigner"
import { AdvancedLayoutCanvas } from "@/modules/cv-designer/components/AdvancedLayoutCanvas"
import { MultiColumnLayout } from "@/modules/cv-designer/components/MultiColumnLayout"
import { AdvancedStyleEngine } from "@/modules/cv-designer/components/AdvancedStyleEngine"
import { StyleConfigProvider } from "@/context/StyleConfigContext"
import { ExportButton } from "@/components/ExportButton"
import { mockTemplates } from "@/modules/cv-designer/data/mockTemplates"

export default function CVPlayground() {
  const [layout, setLayout] = useState<LayoutElement[]>(mockTemplates[0].layout)
  const [activeDemo, setActiveDemo] = useState<'designer' | 'canvas' | 'columns' | 'style'>('designer')

  // Mock CV Data für Export-Tests
  const mockCVData = {
    personalData: {
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@example.com',
      phone: '+49 123 456789',
      address: 'Berlin, Deutschland',
      profession: 'Software Developer'
    },
    workExperience: [],
    education: [],
    skills: []
  }

  const mockDesignConfig = {
    primaryColor: '#1e40af',
    accentColor: '#3b82f6',
    fontFamily: 'Inter' as const,
    fontSize: 'medium' as const,
    lineHeight: 1.5,
    margin: 'normal' as const
  }

  function handleReverseUpload(data: LayoutElement[]) {
    console.log("ReverseUpload data:", data)
    setLayout(data)
  }

  function handleReverseUploadWithGPT(file: File) {
    const fakeElements: LayoutElement[] = [
      { id: "gpt-1", type: "profil", x: 50, y: 50, width: 400, height: 120 }
    ]
    setLayout(fakeElements)
  }

  return (
    <StyleConfigProvider initialConfig={defaultStyleConfig}>
      <div className="p-6 space-y-6">
        <h1 className="text-2xl font-bold">🎮 CV Playground</h1>

        {/* Demo Mode Selector */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          {[
            { mode: 'designer', label: '🎨 Layout Designer' },
            { mode: 'canvas', label: '🖼️ Advanced Canvas' },
            { mode: 'columns', label: '📊 Multi-Column' },
            { mode: 'style', label: '🎭 Style Engine' }
          ].map(({ mode, label }) => (
            <button
              key={mode}
              onClick={() => setActiveDemo(mode as any)}
              className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                activeDemo === mode
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Export Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Teste die erweiterten Layout-Features des CV-Designers
          </div>
          <ExportButton
            cvData={mockCVData}
            designConfig={mockDesignConfig}
            showDropdown={true}
          />
        </div>

        {/* Demo Content */}
        <div className="h-[800px] border border-gray-200 rounded-lg overflow-hidden">
          {activeDemo === 'designer' && (
            <LayoutDesigner
              initialLayout={layout}
              onLayoutChange={setLayout}
              onSave={(layout, style) => {
                console.log('Layout gespeichert:', { layout, style })
              }}
            />
          )}

          {activeDemo === 'canvas' && (
            <AdvancedLayoutCanvas
              layout={layout}
              onChange={setLayout}
              showToolbar={true}
              showRulers={true}
              showGuides={true}
            />
          )}

          {activeDemo === 'columns' && (
            <div className="p-6 h-full overflow-auto">
              <MultiColumnLayout
                sections={layout.filter(el => el.type !== 'group')}
                onSectionsChange={(sections) => {
                  setLayout(sections.map((section, index) => ({
                    ...section,
                    x: section.x || 40 + (index % 3) * 320,
                    y: section.y || 40 + Math.floor(index / 3) * 140,
                    width: section.width || 300,
                    height: section.height || 120
                  })))
                }}
              />
            </div>
          )}

          {activeDemo === 'style' && (
            <div className="p-6 h-full overflow-auto">
              <AdvancedStyleEngine
                config={{
                  primaryColor: '#1e40af',
                  accentColor: '#3b82f6',
                  fontFamily: 'Inter',
                  fontSize: 'medium',
                  lineHeight: 1.5,
                  margin: 'normal',
                  backgroundColor: '#ffffff',
                  textColor: '#000000',
                  borderRadius: '8px',
                  sectionSpacing: 24,
                  snapSize: 20,
                  widthPercent: 100
                }}
                onChange={(config) => {
                  console.log('Style geändert:', config)
                }}
                showPreview={true}
                showPresets={true}
              />
            </div>
          )}
        </div>
      </div>
    </StyleConfigProvider>
  )
}
