@@ .. @@
-/**
- * Start/Load CV Phase
- * Allows users to create new CVs or load existing templates
- */
-
-import React, { useState } from 'react';
-import { CVData } from '@/types/cv-designer';
-import { StyleConfig } from '@/types/cv-designer';
-import { LayoutElement } from '@/modules/cv-designer/types/section';
-import { TemplateSelector } from '@/modules/cv-designer/components/TemplateSelector';
-import { CVImporter } from '@/modules/cv-designer/components/CVImporter';
-import { useCvContext } from '@/modules/cv-designer/context/CvContext';
-import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
-import { Button } from '@/components/ui/button';
-import { Input } from '@/components/ui/input';
-import { Label } from '@/components/ui/label';
-import { 
-  Plus, 
-  Upload, 
-  FileText, 
-  User,
-  Sparkles,
-  Download,
-  Folder
-} from 'lucide-react';
-
-interface StartLoadCVProps {
-  cvData: CVData | null;
-  setCVData: (data: CVData | null) => void;
-  styleConfig: StyleConfig;
-  setStyleConfig: (config: StyleConfig) => void;
-  layoutElements: LayoutElement[];
-  setLayoutElements: (elements: LayoutElement[]) => void;
-}
-
-export const StartLoadCV: React.FC<StartLoadCVProps> = ({
-  cvData,
-  setCVData,
-  styleConfig,
-  setStyleConfig,
-  layoutElements,
-  setLayoutElements
-}) => {
-  const [activeTab, setActiveTab] = useState<'new' | 'template' | 'import'>('new');
-  const [newCvName, setNewCvName] = useState('');
-  
-  // Access CV context for template operations
-  const { templates, loadTemplate, saveTemplate } = useCvContext();
-
-  // Create new blank CV
-  const createNewCV = () => {
-    const newCV: CVData = {
-      personalData: {
-        firstName: '',
-        lastName: '',
-        email: '',
-        phone: '',
-        address: '',
-        profession: '',
-        summary: ''
-      },
-      workExperience: [],
-      education: [],
-      skills: [],
-      languages: []
-    };
-    
-    setCVData(newCV);
-    setLayoutElements([]);
-  };
-
-  // Load template and apply to current CV
-  const handleTemplateSelect = (templateId: string) => {
-    const template = loadTemplate(templateId);
-    if (template) {
-      setStyleConfig(template.style);
-      setLayoutElements(template.layout);
-      
-      // Create basic CV data structure from template
-      const newCV: CVData = {
-        personalData: {
-          firstName: '',
-          lastName: '',
-          email: '',
-          phone: '',
-          address: '',
-          profession: '',
-          summary: ''
-        },
-        workExperience: [],
-        education: [],
-        skills: [],
-        languages: []
-      };
-      
-      setCVData(newCV);
-    }
-  };
-
-  // Handle CV import from file
-  const handleCVImport = (importedData: CVData) => {
-    setCVData(importedData);
-  };
-
-  const tabs = [
-    { id: 'new', label: 'Neuer CV', icon: Plus },
-    { id: 'template', label: 'Aus Template', icon: FileText },
-    { id: 'import', label: 'Importieren', icon: Upload }
-  ];
-
-  return (
-    <div className="space-y-6">
-      {/* Header */}
-      <div>
-        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start / CV laden</h2>
-        <p className="text-gray-600">
-          Erstellen Sie einen neuen CV, laden Sie ein Template oder importieren Sie bestehende Daten.
-        </p>
-      </div>
-
-      {/* Current Status */}
-      {cvData && (
-        <Card className="bg-green-50 border-green-200">
-          <CardContent className="p-4">
-            <div className="flex items-center space-x-3">
-              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
-                <User className="w-6 h-6 text-green-600" />
-              </div>
-              <div>
-                <h3 className="font-medium text-green-900">
-                  CV geladen: {cvData.personalData.firstName || 'Unbenannt'} {cvData.personalData.lastName}
-                </h3>
-                <p className="text-sm text-green-700">
-                  {cvData.personalData.profession || 'Keine Berufsbezeichnung'} • 
-                  {cvData.workExperience.length} Berufserfahrungen • 
-                  {cvData.skills.length} Fähigkeiten
-                </p>
-              </div>
-            </div>
-          </CardContent>
-        </Card>
-      )}
-
-      {/* Tab Navigation */}
-      <div className="border-b border-gray-200">
-        <nav className="flex space-x-8">
-          {tabs.map(tab => {
-            const Icon = tab.icon;
-            return (
-              <button
-                key={tab.id}
-                onClick={() => setActiveTab(tab.id as any)}
-                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
-                  activeTab === tab.id
-                    ? 'text-blue-600 border-blue-600'
-                    : 'text-gray-500 hover:text-gray-700 border-transparent'
-                }`}
-              >
-                <Icon className="w-4 h-4" />
-                <span>{tab.label}</span>
-              </button>
-            );
-          })}
-        </nav>
-      </div>
-
-      {/* Tab Content */}
-      <div className="min-h-96">
-        {activeTab === 'new' && (
-          <Card>
-            <CardHeader>
-              <CardTitle className="flex items-center space-x-2">
-                <Plus className="w-5 h-5 text-blue-600" />
-                <span>Neuen CV erstellen</span>
-              </CardTitle>
-              <p className="text-sm text-gray-600">
-                Beginnen Sie mit einem leeren CV und füllen Sie Ihre Daten ein.
-              </p>
-            </CardHeader>
-            <CardContent className="space-y-4">
-              <div>
-                <Label htmlFor="cvName">CV-Name (optional)</Label>
-                <Input
-                  id="cvName"
-                  value={newCvName}
-                  onChange={(e) => setNewCvName(e.target.value)}
-                  placeholder="Mein Lebenslauf"
-                />
-              </div>
-              
-              <Button onClick={createNewCV} className="w-full">
-                <Plus className="w-4 h-4 mr-2" />
-                Neuen CV erstellen
-              </Button>
-              
-              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
-                <div className="flex items-center space-x-2 text-blue-800 mb-2">
-                  <Sparkles className="w-4 h-4" />
-                  <span className="font-medium">Tipp</span>
-                </div>
-                <p className="text-sm text-blue-700">
-                  Ein leerer CV gibt Ihnen die volle Kontrolle über Struktur und Inhalt. 
-                  Ideal, wenn Sie ein individuelles Design erstellen möchten.
-                </p>
-              </div>
-            </CardContent>
-          </Card>
-        )}
-
-        {activeTab === 'template' && (
-          <Card>
-            <CardHeader>
-              <CardTitle className="flex items-center space-x-2">
-                <FileText className="w-5 h-5 text-purple-600" />
-                <span>Template auswählen</span>
-              </CardTitle>
-              <p className="text-sm text-gray-600">
-                Starten Sie mit einem vorgefertigten Template und passen Sie es an.
-              </p>
-            </CardHeader>
-            <CardContent>
-              {templates.length > 0 ? (
-                <div className="space-y-4">
-                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
-                    {templates.slice(0, 4).map(template => (
-                      <div
-                        key={template.id}
-                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
-                        onClick={() => handleTemplateSelect(template.id)}
-                      >
-                        <div className="flex items-center justify-between mb-2">
-                          <h4 className="font-medium text-gray-900">{template.name}</h4>
-                          <span className="text-xs text-gray-500">{template.category}</span>
-                        </div>
-                        <p className="text-sm text-gray-600 mb-3">
-                          {template.description || 'Keine Beschreibung verfügbar'}
-                        </p>
-                        <div className="flex items-center justify-between">
-                          <div className="flex space-x-1">
-                            {template.tags.slice(0, 2).map(tag => (
-                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
-                                {tag}
-                              </span>
-                            ))}
-                          </div>
-                          <Button size="sm" variant="outline">
-                            Auswählen
-                          </Button>
-                        </div>
-                      </div>
-                    ))}
-                  </div>
-                  
-                  {templates.length > 4 && (
-                    <div className="text-center">
-                      <Button variant="outline">
-                        Alle {templates.length} Templates anzeigen
-                      </Button>
-                    </div>
-                  )}
-                </div>
-              ) : (
-                <div className="text-center py-12">
-                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
-                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Templates vorhanden</h3>
-                  <p className="text-gray-600 mb-4">
-                    Erstellen Sie zuerst einen CV und speichern Sie ihn als Template.
-                  </p>
-                  <Button onClick={() => setActiveTab('new')}>
-                    <Plus className="w-4 h-4 mr-2" />
-                    Neuen CV erstellen
-                  </Button>
-                </div>
-              )}
-            </CardContent>
-          </Card>
-        )}
-
-        {activeTab === 'import' && (
-          <Card>
-            <CardHeader>
-              <CardTitle className="flex items-center space-x-2">
-                <Upload className="w-5 h-5 text-green-600" />
-                <span>CV importieren</span>
-              </CardTitle>
-              <p className="text-sm text-gray-600">
-                Importieren Sie einen bestehenden CV aus verschiedenen Formaten.
-              </p>
-            </CardHeader>
-            <CardContent>
-              <CVImporter onImport={handleCVImport} />
-              
-              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
-                <div className="flex items-center space-x-2 text-yellow-800 mb-2">
-                  <Download className="w-4 h-4" />
-                  <span className="font-medium">Unterstützte Formate</span>
-                </div>
-                <ul className="text-sm text-yellow-700 space-y-1">
-                  <li>• JSON (CV Designer Export)</li>
-                  <li>• PDF (Text-Extraktion)</li>
-                  <li>• DOCX (Word-Dokumente)</li>
-                  <li>• TXT (Plain Text)</li>
-                </ul>
-              </div>
-            </CardContent>
-          </Card>
-        )}
-      </div>
-
-      {/* Quick Stats */}
-      <Card className="bg-gray-50 border-gray-200">
-        <CardHeader>
-          <CardTitle className="text-sm text-gray-900">📊 Playground-Status</CardTitle>
-        </CardHeader>
-        <CardContent>
-          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
-            <div className="text-center">
-              <div className="text-lg font-bold text-blue-600">{templates.length}</div>
-              <div className="text-gray-600">Templates</div>
-            </div>
-            <div className="text-center">
-              <div className="text-lg font-bold text-purple-600">{layoutElements.length}</div>
-              <div className="text-gray-600">Layout-Elemente</div>
-            </div>
-            <div className="text-center">
-              <div className="text-lg font-bold text-green-600">
-                {cvData ? '1' : '0'}
-              </div>
-              <div className="text-gray-600">CV geladen</div>
-            </div>
-            <div className="text-center">
-              <div className="text-lg font-bold text-orange-600">
-                {cvData?.personalData.profileImage ? '1' : '0'}
-              </div>
-              <div className="text-gray-600">Profilbild</div>
-            </div>
-          </div>
-        </CardContent>
-      </Card>
-    </div>
-  );
-};
-
-export default StartLoadCV;
+/**
+ * Start/Load CV Phase
+ * Allows users to create new CVs or load existing templates
+ */
+
+import React, { useState } from 'react';
+import { useCvContext } from '../../context/CvContext';
+import { LayoutElement } from '../../types/section';
+import { StyleConfig } from '../../types/styles';
+import { 
+  Plus, 
+  Upload, 
+  FileText, 
+  User,
+  Sparkles,
+  Download,
+  Folder
+} from 'lucide-react';
+
+// Mock CVData interface for playground
+interface CVData {
+  personalData: {
+    firstName: string;
+    lastName: string;
+    email: string;
+    phone: string;
+    address: string;
+    profession?: string;
+    summary?: string;
+    profileImage?: string;
+  };
+  workExperience: Array<{
+    id: string;
+    position: string;
+    company: string;
+    location?: string;
+    startDate: string;
+    endDate: string;
+    description: string;
+  }>;
+  education: Array<{
+    id: string;
+    degree: string;
+    institution: string;
+    location?: string;
+    startDate: string;
+    endDate: string;
+    description?: string;
+    grade?: string;
+    fieldOfStudy?: string;
+  }>;
+  skills: Array<{
+    id: string;
+    name: string;
+    level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
+    category?: string;
+  }>;
+  languages?: Array<{
+    id: string;
+    name: string;
+    level: string;
+  }>;
+}
+
+interface StartLoadCVProps {
+  cvData: CVData | null;
+  setCVData: (data: CVData | null) => void;
+  styleConfig: StyleConfig;
+  setStyleConfig: (config: StyleConfig) => void;
+  layoutElements: LayoutElement[];
+  setLayoutElements: (elements: LayoutElement[]) => void;
+}
+
+export const StartLoadCV: React.FC<StartLoadCVProps> = ({
+  cvData,
+  setCVData,
+  styleConfig,
+  setStyleConfig,
+  layoutElements,
+  setLayoutElements
+}) => {
+  const [activeTab, setActiveTab] = useState<'new' | 'template' | 'import'>('new');
+  const [newCvName, setNewCvName] = useState('');
+  
+  // Access CV context for template operations
+  const { templates, loadTemplate, saveTemplate } = useCvContext();
+
+  // Create new blank CV
+  const createNewCV = () => {
+    const newCV: CVData = {
+      personalData: {
+        firstName: '',
+        lastName: '',
+        email: '',
+        phone: '',
+        address: '',
+        profession: '',
+        summary: ''
+      },
+      workExperience: [],
+      education: [],
+      skills: [],
+      languages: []
+    };
+    
+    setCVData(newCV);
+    setLayoutElements([]);
+  };
+
+  // Load template and apply to current CV
+  const handleTemplateSelect = (templateId: string) => {
+    const template = loadTemplate(templateId);
+    if (template) {
+      setStyleConfig(template.style);
+      setLayoutElements(template.layout);
+      
+      // Create basic CV data structure from template
+      const newCV: CVData = {
+        personalData: {
+          firstName: '',
+          lastName: '',
+          email: '',
+          phone: '',
+          address: '',
+          profession: '',
+          summary: ''
+        },
+        workExperience: [],
+        education: [],
+        skills: [],
+        languages: []
+      };
+      
+      setCVData(newCV);
+    }
+  };
+
+  // Handle CV import from file
+  const handleCVImport = (importedData: CVData) => {
+    setCVData(importedData);
+  };
+
+  const tabs = [
+    { id: 'new', label: 'Neuer CV', icon: Plus },
+    { id: 'template', label: 'Aus Template', icon: FileText },
+    { id: 'import', label: 'Importieren', icon: Upload }
+  ];
+
+  return (
+    <div className="space-y-6">
+      {/* Header */}
+      <div>
+        <h2 className="text-2xl font-bold text-gray-900 mb-2">Start / CV laden</h2>
+        <p className="text-gray-600">
+          Erstellen Sie einen neuen CV, laden Sie ein Template oder importieren Sie bestehende Daten.
+        </p>
+      </div>
+
+      {/* Current Status */}
+      {cvData && (
+        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
+          <div className="flex items-center space-x-3">
+            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
+              <User className="w-6 h-6 text-green-600" />
+            </div>
+            <div>
+              <h3 className="font-medium text-green-900">
+                CV geladen: {cvData.personalData.firstName || 'Unbenannt'} {cvData.personalData.lastName}
+              </h3>
+              <p className="text-sm text-green-700">
+                {cvData.personalData.profession || 'Keine Berufsbezeichnung'} • 
+                {cvData.workExperience.length} Berufserfahrungen • 
+                {cvData.skills.length} Fähigkeiten
+              </p>
+            </div>
+          </div>
+        </div>
+      )}
+
+      {/* Tab Navigation */}
+      <div className="border-b border-gray-200">
+        <nav className="flex space-x-8">
+          {tabs.map(tab => {
+            const Icon = tab.icon;
+            return (
+              <button
+                key={tab.id}
+                onClick={() => setActiveTab(tab.id as any)}
+                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm ${
+                  activeTab === tab.id
+                    ? 'text-blue-600 border-blue-600'
+                    : 'text-gray-500 hover:text-gray-700 border-transparent'
+                }`}
+              >
+                <Icon className="w-4 h-4" />
+                <span>{tab.label}</span>
+              </button>
+            );
+          })}
+        </nav>
+      </div>
+
+      {/* Tab Content */}
+      <div className="min-h-96">
+        {activeTab === 'new' && (
+          <div className="bg-white border border-gray-200 rounded-lg">
+            <div className="p-6 border-b border-gray-200">
+              <h3 className="text-lg font-semibold flex items-center space-x-2">
+                <Plus className="w-5 h-5 text-blue-600" />
+                <span>Neuen CV erstellen</span>
+              </h3>
+              <p className="text-sm text-gray-600 mt-1">
+                Beginnen Sie mit einem leeren CV und füllen Sie Ihre Daten ein.
+              </p>
+            </div>
+            <div className="p-6 space-y-4">
+              <div>
+                <label htmlFor="cvName" className="block text-sm font-medium text-gray-700 mb-1">
+                  CV-Name (optional)
+                </label>
+                <input
+                  id="cvName"
+                  type="text"
+                  value={newCvName}
+                  onChange={(e) => setNewCvName(e.target.value)}
+                  placeholder="Mein Lebenslauf"
+                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
+                />
+              </div>
+              
+              <button 
+                onClick={createNewCV}
+                className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
+              >
+                <Plus className="w-4 h-4 mr-2" />
+                Neuen CV erstellen
+              </button>
+              
+              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
+                <div className="flex items-center space-x-2 text-blue-800 mb-2">
+                  <Sparkles className="w-4 h-4" />
+                  <span className="font-medium">Tipp</span>
+                </div>
+                <p className="text-sm text-blue-700">
+                  Ein leerer CV gibt Ihnen die volle Kontrolle über Struktur und Inhalt. 
+                  Ideal, wenn Sie ein individuelles Design erstellen möchten.
+                </p>
+              </div>
+            </div>
+          </div>
+        )}
+
+        {activeTab === 'template' && (
+          <div className="bg-white border border-gray-200 rounded-lg">
+            <div className="p-6 border-b border-gray-200">
+              <h3 className="text-lg font-semibold flex items-center space-x-2">
+                <FileText className="w-5 h-5 text-purple-600" />
+                <span>Template auswählen</span>
+              </h3>
+              <p className="text-sm text-gray-600 mt-1">
+                Starten Sie mit einem vorgefertigten Template und passen Sie es an.
+              </p>
+            </div>
+            <div className="p-6">
+              {templates.length > 0 ? (
+                <div className="space-y-4">
+                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
+                    {templates.slice(0, 4).map(template => (
+                      <div
+                        key={template.id}
+                        className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
+                        onClick={() => handleTemplateSelect(template.id)}
+                      >
+                        <div className="flex items-center justify-between mb-2">
+                          <h4 className="font-medium text-gray-900">{template.name}</h4>
+                          <span className="text-xs text-gray-500">{template.category}</span>
+                        </div>
+                        <p className="text-sm text-gray-600 mb-3">
+                          {template.description || 'Keine Beschreibung verfügbar'}
+                        </p>
+                        <div className="flex items-center justify-between">
+                          <div className="flex space-x-1">
+                            {template.tags.slice(0, 2).map(tag => (
+                              <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
+                                {tag}
+                              </span>
+                            ))}
+                          </div>
+                          <button className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50">
+                            Auswählen
+                          </button>
+                        </div>
+                      </div>
+                    ))}
+                  </div>
+                  
+                  {templates.length > 4 && (
+                    <div className="text-center">
+                      <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
+                        Alle {templates.length} Templates anzeigen
+                      </button>
+                    </div>
+                  )}
+                </div>
+              ) : (
+                <div className="text-center py-12">
+                  <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
+                  <h3 className="text-lg font-medium text-gray-900 mb-2">Keine Templates vorhanden</h3>
+                  <p className="text-gray-600 mb-4">
+                    Erstellen Sie zuerst einen CV und speichern Sie ihn als Template.
+                  </p>
+                  <button 
+                    onClick={() => setActiveTab('new')}
+                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
+                  >
+                    <Plus className="w-4 h-4 mr-2" />
+                    Neuen CV erstellen
+                  </button>
+                </div>
+              )}
+            </div>
+          </div>
+        )}
+
+        {activeTab === 'import' && (
+          <div className="bg-white border border-gray-200 rounded-lg">
+            <div className="p-6 border-b border-gray-200">
+              <h3 className="text-lg font-semibold flex items-center space-x-2">
+                <Upload className="w-5 h-5 text-green-600" />
+                <span>CV importieren</span>
+              </h3>
+              <p className="text-sm text-gray-600 mt-1">
+                Importieren Sie einen bestehenden CV aus verschiedenen Formaten.
+              </p>
+            </div>
+            <div className="p-6">
+              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
+                <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
+                <h4 className="text-lg font-medium text-gray-900 mb-2">CV-Datei hochladen</h4>
+                <p className="text-gray-600 mb-4">
+                  Ziehen Sie eine Datei hierher oder klicken Sie zum Auswählen
+                </p>
+                <input
+                  type="file"
+                  accept=".json,.pdf,.docx,.txt"
+                  onChange={(e) => {
+                    const file = e.target.files?.[0];
+                    if (file) {
+                      console.log('File selected:', file.name);
+                      // Import logic would be implemented here
+                    }
+                  }}
+                  className="hidden"
+                  id="cv-file-input"
+                />
+                <label
+                  htmlFor="cv-file-input"
+                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer"
+                >
+                  <Upload className="w-4 h-4 mr-2" />
+                  Datei auswählen
+                </label>
+              </div>
+              
+              <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
+                <div className="flex items-center space-x-2 text-yellow-800 mb-2">
+                  <Download className="w-4 h-4" />
+                  <span className="font-medium">Unterstützte Formate</span>
+                </div>
+                <ul className="text-sm text-yellow-700 space-y-1">
+                  <li>• JSON (CV Designer Export)</li>
+                  <li>• PDF (Text-Extraktion)</li>
+                  <li>• DOCX (Word-Dokumente)</li>
+                  <li>• TXT (Plain Text)</li>
+                </ul>
+              </div>
+            </div>
+          </div>
+        )}
+      </div>
+
+      {/* Quick Stats */}
+      <div className="bg-gray-50 border border-gray-200 rounded-lg">
+        <div className="p-4 border-b border-gray-200">
+          <h3 className="text-sm font-medium text-gray-900">📊 Playground-Status</h3>
+        </div>
+        <div className="p-4">
+          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
+            <div className="text-center">
+              <div className="text-lg font-bold text-blue-600">{templates.length}</div>
+              <div className="text-gray-600">Templates</div>
+            </div>
+            <div className="text-center">
+              <div className="text-lg font-bold text-purple-600">{layoutElements.length}</div>
+              <div className="text-gray-600">Layout-Elemente</div>
+            </div>
+            <div className="text-center">
+              <div className="text-lg font-bold text-green-600">
+                {cvData ? '1' : '0'}
+              </div>
+              <div className="text-gray-600">CV geladen</div>
+            </div>
+            <div className="text-center">
+              <div className="text-lg font-bold text-orange-600">
+                {cvData?.personalData.profileImage ? '1' : '0'}
+              </div>
+              <div className="text-gray-600">Profilbild</div>
+            </div>
+          </div>
+        </div>
+      </div>
+    </div>
+  );
+};
+
+export default StartLoadCV;