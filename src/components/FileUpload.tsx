import { useCallback, useState } from 'react';
import type { ChangeEvent, DragEvent } from 'react';
import { Upload, AlertCircle, Check } from 'lucide-react';
import { parseFile } from '../services/fileParser';

interface FileUploadProps {
  onContentChange: (content: string) => void;
  label: string;
  accept?: string;
  placeholder?: string;
}

export default function FileUpload({ onContentChange, label, accept = ".txt,.docx,.pdf", placeholder }: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleFile = useCallback(async (file: File) => {
    setIsLoading(true);
    setError('');
    
    try {
      const content = await parseFile(file);
      setFileName(file.name);
      onContentChange(content);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
    } finally {
      setIsLoading(false);
    }
  }, [onContentChange]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFile(files[0]);
    }
  }, [handleFile]);

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 transition-all duration-200 ${
          isDragOver 
            ? 'border-blue-500 bg-blue-50' 
            : 'border-gray-300 hover:border-gray-400'
        } ${isLoading ? 'opacity-50 cursor-wait' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isLoading}
        />
        
        <div className="text-center">
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2" style={{ borderColor: '#F29400' }}></div>
              <span className="text-gray-600">Datei wird verarbeitet...</span>
            </div>
          ) : fileName ? (
            <div className="flex items-center justify-center space-x-2" style={{ color: '#F29400' }}>
              <Check className="h-5 w-5" />
              <span className="font-medium">{fileName}</span>
            </div>
          ) : (
            <>
              <Upload className="mx-auto h-12 w-12 mb-4" style={{ color: '#F29400' }} />
              <div className="space-y-2">
                <p className="text-gray-600">
                  Datei hier ablegen oder <span className="font-medium" style={{ color: '#F29400' }}>klicken zum Auswählen</span>
                </p>
                <p className="text-sm text-gray-500">
                  {placeholder || 'Unterstützte Formate: TXT, DOCX, PDF'}
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center space-x-2 text-red-600 text-sm bg-red-50 p-3 rounded-md">
          <AlertCircle className="h-4 w-4 flex-shrink-0" style={{ color: '#F29400' }} />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}