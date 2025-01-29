import React, { useState, useEffect } from 'react';
import { Music4, Mic2, Radio } from 'lucide-react';
import AudioUploader from './components/AudioUploader';
import DownloadSection from './components/DownloadSection';
import type { SeparationJob } from './types';

const API_URL = 'http://localhost:5001';

export default function App() {
  const [isUploading, setIsUploading] = useState(false);
  const [processedResult, setProcessedResult] = useState<SeparationJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isServerConnected, setIsServerConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    const checkServer = async () => {
      try {
        const response = await fetch(`${API_URL}/health`);
        if (!response.ok) throw new Error('Server responded with an error');
        
        const data = await response.json();
        setIsServerConnected(data.status === 'healthy');
        setConnectionError(null);
      } catch (error) {
        setIsServerConnected(false);
        setConnectionError(error instanceof Error ? error.message : 'Failed to connect to server');
      }
    };
    
    checkServer();
    const interval = setInterval(checkServer, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleFileSelect = async (file: File) => {
    setIsUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Upload failed');
      }

      setProcessedResult(data);
    } catch (error) {
      console.error('Upload error:', error);
      setError(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen py-12 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div className="glass-panel text-center">
          <div className="flex justify-center items-center space-x-6 mb-8">
            <Radio className="w-10 h-10 text-yellow-400 animate-pulse" />
            <Music4 className="w-12 h-12 text-yellow-500" />
            <Mic2 className="w-10 h-10 text-yellow-400 animate-pulse" />
          </div>
          <h1 className="text-6xl font-bold mb-4 elegant-text tracking-wide">
            Sur
          </h1>
          <p className="text-lg text-gray-300 max-w-xl mx-auto">
          Drop your song and generate stems in seconds using the power of AI
          </p>
        </div>

        {/* Server Status */}
        <div className="glass-panel text-center">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
            isServerConnected 
              ? 'bg-yellow-900/30 text-yellow-400' 
              : 'bg-red-900/30 text-red-400'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-2 ${
              isServerConnected ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
            {isServerConnected ? 'Server Connected' : 'Server Disconnected'}
          </span>
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          {!processedResult && (
            <div className="glass-panel">
              <AudioUploader
                onFileSelect={handleFileSelect}
                isUploading={isUploading}
                isDisabled={!isServerConnected}
              />
            </div>
          )}

          {error && (
            <div className="glass-panel text-center text-red-200">
              {error}
            </div>
          )}

          {processedResult && (
            <DownloadSection job={processedResult} />
          )}
        </div>
      </div>

      {/* Developer Credit */}
      <div className="fixed bottom-4 right-4">
        <div className="glass-panel py-2 px-4">
          <p className="text-yellow-400 text-sm">
            Developed by Shanit Ghose, 2024
          </p>
        </div>
      </div>
    </div>
  );
}