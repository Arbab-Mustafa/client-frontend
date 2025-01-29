import React, { useCallback, useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';

const SUPPORTED_FORMATS = ['.mp3', '.wav', '.flac', '.m4a', '.ogg'];
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 30MB

interface AudioUploaderProps {
  onFileSelect: (file: File) => void;
  isUploading: boolean;
  isDisabled?: boolean;
}

export default function AudioUploader({ 
  onFileSelect, 
  isUploading, 
  isDisabled = false 
}: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (!SUPPORTED_FORMATS.some(format => 
      file.name.toLowerCase().endsWith(format)
    )) {
      setError('Unsupported file format');
      return false;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setError('File size exceeds 30MB limit');
      return false;
    }

    setError(null);
    return true;
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    if (isDisabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, [isDisabled]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    if (isDisabled) return;
    
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect, isDisabled]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (isDisabled) return;
    
    const file = e.target.files?.[0];
    if (file && validateFile(file)) {
      onFileSelect(file);
    }
  }, [onFileSelect, isDisabled]);

  return (
    <div
      className={`relative rounded-lg border-2 border-dashed p-8 text-center transition-colors
        ${dragActive ? 'border-yellow-400 bg-yellow-500/5' : 'border-gray-700'}
        ${isUploading || isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-yellow-700'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept={SUPPORTED_FORMATS.join(',')}
        disabled={isUploading || isDisabled}
      />
      
      <div className="flex flex-col items-center justify-center space-y-4">
        <Upload className="w-12 h-12 text-yellow-500" />
        <div className="text-gray-300">
          <p className="font-medium">
            {isDisabled 
              ? 'Please wait for server connection...'
              : 'Drop your audio file here or click to upload'
            }
          </p>
          <p className="text-sm text-gray-400 mt-1">
            Supports {SUPPORTED_FORMATS.join(', ')} (Max {MAX_FILE_SIZE / 1024 / 1024}MB)
          </p>
        </div>
        
        {error && (
          <div className="flex items-center text-red-400 text-sm mt-2">
            <AlertCircle className="w-4 h-4 mr-1" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
}