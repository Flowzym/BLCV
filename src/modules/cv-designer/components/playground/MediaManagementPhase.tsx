/**
 * Media Management Phase
 * Dedicated area for image editing and management
 */

import React, { useState } from 'react';
import { CVData } from '@/types/cv-designer';
import { MediaManager } from '@/components/MediaManager';
import { CVPreview } from '@/modules/cv-designer/components/CVPreview';
import { useMapping } from '@/modules/cv-designer/hooks/useMapping';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  
  // Mapping hook to convert CV data to sections for preview
  const { mapCVData } = useMapping();
  const [mappedSections, setMappedSections] = React.useState<any[]>([]);

  // Map CV data when it changes
  React.useEffect(() => {
    if (cvData) {
      const result = mapCVData(cvData, {
        locale: 'de',
        layoutType: 'classic-one-column'
      });
      setMappedSections(result.sections);
    } else {
      setMappedSections([]);
    }
  }, [cvData, mapCVData]);

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
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4">
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
        </CardContent>
      </Card>

      {/* Image Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Current Status */}
        <Card className={imageStatus.hasImage ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}>
          <CardHeader>
            <CardTitle className={`flex items-center space-x-2 ${imageStatus.hasImage ? 'text-green-900' : 'text-yellow-900'}`}>
              {imageStatus.hasImage ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertTriangle className="w-5 h-5" />
              )}
              <span>Profilbild-Status</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Recommendations */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-blue-900">
              <Settings className="w-5 h-5" />
              <span>Empfehlungen</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      </div>

      {/* Main Media Management Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Side - Media Manager */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Upload className="w-5 h-5 text-purple-600" />
              <span>Bildbearbeitung</span>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Laden Sie Ihr Profilbild hoch und bearbeiten Sie es mit professionellen Tools
            </p>
          </CardHeader>
          <CardContent>
            <MediaManager
              onImageSelect={handleImageSelect}
              currentImage={cvData.personalData.profileImage}
              aspectRatio={1} // Square aspect ratio for profile pictures
              shape="circle"
            />
            
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
          </CardContent>
        </Card>

        {/* Right Side - CV Preview with Image */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Eye className="w-5 h-5 text-blue-600" />
                <span>CV-Vorschau mit Profilbild</span>
              </div>
              <Button
                onClick={() => setShowPreview(!showPreview)}
                variant="outline"
                size="sm"
              >
                {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
              </Button>
            </CardTitle>
            <p className="text-sm text-gray-600">
              Sehen Sie, wie Ihr Profilbild im fertigen CV aussieht
            </p>
          </CardHeader>
          <CardContent>
            {showPreview ? (
              <div className="max-h-96 overflow-y-auto border rounded-lg bg-white">
                <CVPreview
                  sections={mappedSections}
                  styleConfig={{
                    primaryColor: '#1e40af',
                    accentColor: '#3b82f6',
                    fontFamily: 'Inter',
                    fontSize: 'medium',
                    lineHeight: 1.6,
                    margin: 'normal'
                  }}
                  cvData={cvData}
                />
              </div>
            ) : (
              <div className="flex items-center justify-center h-64 text-gray-500">
                <div className="text-center">
                  <Eye className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <p>Vorschau ausgeblendet</p>
                  <Button
                    onClick={() => setShowPreview(true)}
                    variant="outline"
                    className="mt-2"
                  >
                    Vorschau anzeigen
                  </Button>
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
                <span className="font-medium">{mappedSections.length}</span>
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
          </CardContent>
        </Card>
      </div>

      {/* Media Management Tips */}
      <Card className="bg-gray-50 border-gray-200">
        <CardHeader>
          <CardTitle className="text-sm text-gray-900">💡 Profilbild-Tipps</CardTitle>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>

      {/* Image Processing Status */}
      {imageStatus.hasImage && (
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-green-900">
              <CheckCircle className="w-5 h-5" />
              <span>Profilbild erfolgreich integriert</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="flex justify-center space-x-4">
        <Button
          onClick={() => setShowPreview(!showPreview)}
          variant="outline"
        >
          <Eye className="w-4 h-4 mr-2" />
          {showPreview ? 'Vorschau ausblenden' : 'Vorschau anzeigen'}
        </Button>
        
        {imageStatus.hasImage && (
          <Button
            onClick={() => handleImageSelect('')}
            variant="outline"
            className="text-red-600 hover:text-red-800"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Profilbild entfernen
          </Button>
        )}
      </div>
    </div>
  );
};

export default MediaManagementPhase;