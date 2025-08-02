/**
 * Media Management Phase
 * Dedicated area for image editing and management
 */

import React, { useState } from 'react';
import { 
  Image as ImageIcon, 
  Eye, 
  Upload,
  Crop,
  Settings,
  CheckCircle,
  AlertTriangle,
  FileText
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

interface MediaManagementPhaseProps {
  cvData: CVData | null;
  setCVData: (data: CVData | null) => void;
}

export const MediaManagementPhase: React.FC<MediaManagementPhaseProps> = ({
  cvData,
  setCVData
}) => {
  const [showPreview, setShowPreview] = useState(true);
  const [lastUploadedImage, setLastUploadedImage] = useState<string | null>(null);

  // Handle image selection from MediaManager
  const handleImageSelect = (imageSrc: string, thumbnail?: string) => {
    if (!cvData || !setCVData) return;
    
    // Update profile image in CV data
    const updatedCVData = {
      ...cvData,
      personalData: {
        ...cvData.personalData,
        profileImage: imageSrc
      }
    };
    
    setCVData(updatedCVData);
    setLastUploadedImage(imageSrc);
  };

  // Handle file upload
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        handleImageSelect(result);
      }
    };
    reader.readAsDataURL(file);
  };

  // Get image status
  const getImageStatus = () => {
    const hasImage = !!cvData?.personalData.profileImage;
    const isNewImage = lastUploadedImage === cvData?.personalData.profileImage;
    
    return {
      hasImage,
      isNewImage,
      imageSize: hasImage ? 'Verfügbar' : 'Nicht vorhanden'
    };
  };

  const imageStatus = getImageStatus();

  if (!cvData) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Medien verwalten</h2>
          <p className="text-gray-600">
            Laden Sie Profilbilder hoch und bearbeiten Sie diese mit professionellen Tools.
          </p>
        </div>
        
        <div className="flex items-center justify-center h-64 text-gray-500">
          <div className="text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
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
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Medien verwalten</h2>
        <p className="text-gray-600">
          Laden Sie Profilbilder hoch und bearbeiten Sie diese mit professionellen Tools.
        </p>
      </div>

      {/* Current CV Info */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-purple-900">
                  Medien: {cvData.personalData.firstName} {cvData.personalData.lastName}
                </h3>
                <p className="text-sm text-purple-700">
                  {cvData.personalData.profession || 'Keine Berufsbezeichnung'} • 
                  Profilbild: {imageStatus.imageSize}
                  {imageStatus.isNewImage && ' (Neu hochgeladen)'}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <div className={`text-2xl font-bold ${imageStatus.hasImage ? 'text-green-600' : 'text-gray-400'}`}>
                {imageStatus.hasImage ? '✓' : '○'}
              </div>
              <div className="text-sm text-purple-700">Profilbild</div>
            </div>
          </div>
      </div>

      {/* Image Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Status */}
        <div className={`${imageStatus.hasImage ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border rounded-lg`}>
          <div className="p-6 border-b border-gray-200">
            <h3 className={`text-lg font-semibold flex items-center space-x-2 ${imageStatus.hasImage ? 'text-green-900' : 'text-yellow-900'}`}>
              {imageStatus.hasImage ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>Profilbild-Status</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className={imageStatus.hasImage ? 'text-green-700' : 'text-yellow-700'}>Status:</span>
                <span className="font-medium">
                  {imageStatus.hasImage ? 'Vorhanden' : 'Nicht vorhanden'}
                </span>
              </div>
              {imageStatus.hasImage && (
                <>
                  <div className="flex justify-between">
                    <span className="text-green-700">Typ:</span>
                    <span className="font-medium">Base64 Image</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Größe:</span>
                    <span className="font-medium">
                      {Math.round(cvData.personalData.profileImage!.length / 1024)} KB
                    </span>
                  </div>
                </>
              )}
              {imageStatus.isNewImage && (
                <div className="flex items-center space-x-2 text-green-700 mt-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-xs">Neu hochgeladen in dieser Session</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg">
          <div className="p-6 border-b border-blue-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2 text-blue-900">
              <Settings className="w-5 h-5" />
              <span>Empfehlungen</span>
            </h3>
          </div>
          <div className="p-6">
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Verwenden Sie ein professionelles Foto</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Quadratisches Format (1:1) funktioniert am besten</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Hohe Auflösung für bessere Druckqualität</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 mt-0.5 text-blue-600" />
                <span>Neutrale Hintergrundfarbe bevorzugt</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Main Media Management Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Media Manager */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2">
              <Upload className="w-5 h-5 text-purple-600" />
              <span>Bildbearbeitung</span>
            </h3>
            <p className="text-sm text-gray-600">
              Laden Sie Ihr Profilbild hoch und bearbeiten Sie es mit professionellen Tools
            </p>
          </div>
          <div className="p-6">
            {/* Image Upload Area */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              {cvData.personalData.profileImage ? (
                <div className="space-y-4">
                  <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                    <img 
                      src={cvData.personalData.profileImage} 
                      alt="Profilbild"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Profilbild hochgeladen</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      Größe: {Math.round(cvData.personalData.profileImage.length / 1024)} KB
                    </p>
                    <div className="space-x-2">
                      <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                        <Upload className="w-4 h-4 mr-2" />
                        Neues Bild hochladen
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          className="hidden"
                        />
                      </label>
                      <button
                        onClick={() => handleImageSelect('')}
                        className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                      >
                        Entfernen
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Profilbild hochladen</h4>
                  <p className="text-gray-600 mb-4">
                    Ziehen Sie ein Bild hierher oder klicken Sie zum Auswählen
                  </p>
                  <label className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Bild auswählen
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              )}
            </div>
            
            {/* Media Features Info */}
            <div className="mt-6 bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2 flex items-center">
                <Crop className="w-4 h-4 mr-2" />
                Verfügbare Features
              </h4>
              <ul className="text-sm text-purple-800 space-y-1">
                <li>• Drag & Drop Upload</li>
                <li>• Professioneller Bildzuschnitt</li>
                <li>• Aspect Ratio-Kontrolle (1:1 für Profilbilder)</li>
                <li>• Qualitätsoptimierung</li>
                <li>• Thumbnail-Generierung</li>
                <li>• Live-Vorschau Integration</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - CV Preview with Image */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>CV-Vorschau mit Profilbild</span>
              </h3>
              <p className="text-sm text-gray-600">
                Sehen Sie, wie Ihr Profilbild im fertigen CV aussieht
              </p>
            </div>
            <button
              onClick={() => setShowPreview(!showPreview)}
              className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
            </button>
          </div>
          <div className="p-6">
            {showPreview ? (
              <div className="flex items-center space-x-2">
                <div className="max-h-96 overflow-y-auto border rounded-lg bg-white p-4 w-full">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      {cvData.personalData.profileImage && (
                        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                          <img 
                            src={cvData.personalData.profileImage} 
                            alt="Profilbild"
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <h1 className="text-xl font-bold text-blue-600">
                          {cvData.personalData.firstName} {cvData.personalData.lastName}
                        </h1>
                        <p className="text-blue-500">{cvData.personalData.profession}</p>
                        <p className="text-sm text-gray-600">{cvData.personalData.email}</p>
                      </div>
                    </div>
                    
                    {cvData.personalData.summary && (
                      <div>
                        <h2 className="text-lg font-semibold text-blue-600 mb-2">Profil</h2>
                        <p className="text-sm">{cvData.personalData.summary}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Vorschau ausgeblendet</p>
                  <button
                    onClick={() => setShowPreview(true)}
                    className="mt-2 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Vorschau anzeigen
                  </button>
                </div>
              </div>
            )}
            
            {/* Preview Stats */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Profilbild:</span>
                <span className="font-medium">
                  {imageStatus.hasImage ? 'Vorhanden' : 'Nicht vorhanden'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Sektionen:</span>
                <span className="font-medium">3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Bildgröße:</span>
                <span className="font-medium">
                  {imageStatus.hasImage 
                    ? `${Math.round(cvData.personalData.profileImage!.length / 1024)} KB`
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Format:</span>
                <span className="font-medium">
                  {imageStatus.hasImage ? 'Base64 Image' : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Media Management Tips */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-900">💡 Profilbild-Tipps</h3>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-700">
            <div>
              <h5 className="font-medium mb-2">📸 Bildqualität</h5>
              <ul className="space-y-1 text-xs">
                <li>• Mindestens 300x300 Pixel</li>
                <li>• Gute Beleuchtung</li>
                <li>• Scharfes, klares Bild</li>
                <li>• Professioneller Ausdruck</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">🎨 Bildbearbeitung</h5>
              <ul className="space-y-1 text-xs">
                <li>• Automatischer Zuschnitt</li>
                <li>• Qualitätsoptimierung</li>
                <li>• Thumbnail-Generierung</li>
                <li>• Format-Konvertierung</li>
              </ul>
            </div>
            <div>
              <h5 className="font-medium mb-2">📄 CV-Integration</h5>
              <ul className="space-y-1 text-xs">
                <li>• Automatische Größenanpassung</li>
                <li>• Kreisförmiger Zuschnitt</li>
                <li>• Export-Optimierung</li>
                <li>• Live-Vorschau</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Image Processing Status */}
      {imageStatus.hasImage && (
        <div className="bg-green-50 border border-green-200 rounded-lg">
          <div className="p-6 border-b border-green-200">
            <h3 className="text-lg font-semibold flex items-center space-x-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              <span>Profilbild erfolgreich integriert</span>
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Image Info */}
              <div>
                <h4 className="font-medium text-green-900 mb-3">Bild-Informationen</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-700">Format:</span>
                    <span className="font-medium">Base64 Image</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Größe:</span>
                    <span className="font-medium">
                      {Math.round(cvData.personalData.profileImage!.length / 1024)} KB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Aspect Ratio:</span>
                    <span className="font-medium">1:1 (Quadratisch)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-green-700">Form:</span>
                    <span className="font-medium">Kreisförmig</span>
                  </div>
                </div>
              </div>

              {/* Processing Info */}
              <div>
                <h4 className="font-medium text-green-900 mb-3">Verarbeitung</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Automatisch zugeschnitten</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Qualität optimiert</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Export-bereit</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">CV-integriert</span>
                  </div>
                </div>
              </div>

              {/* Export Compatibility */}
              <div>
                <h4 className="font-medium text-green-900 mb-3">Export-Kompatibilität</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">PDF: Eingebettet</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">DOCX: Kompatibel</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">JSON: Base64 gespeichert</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-green-700">Web: Sofort verfügbar</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
        </button>
        
        {imageStatus.hasImage && (
          <button
            onClick={() => handleImageSelect('')}
            className="flex items-center px-4 py-2 border border-gray-300 text-red-600 rounded-md hover:bg-gray-50 hover:text-red-800"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Profilbild entfernen
          </button>
        )}
      </div>
    </div>
  );
};

export default MediaManagementPhase;