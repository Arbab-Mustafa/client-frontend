import React, { useEffect, useState } from 'react';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import type { SeparationJob } from '../types';
import { getJobStatus } from '../api';

interface ProcessingStatusProps {
  jobId: string;
  onComplete: (job: SeparationJob) => void;
}

export default function ProcessingStatus({ jobId, onComplete }: ProcessingStatusProps) {
  const [status, setStatus] = useState<SeparationJob | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const pollStatus = async () => {
      try {
        const response = await getJobStatus(jobId);
        if (!response.success) {
          setError(response.error || 'Failed to fetch status');
          return;
        }

        setStatus(response.data!);
        
        if (response.data?.status === 'completed') {
          onComplete(response.data);
        } else if (response.data?.status === 'failed') {
          setError(response.data.error || 'Processing failed');
        } else {
          setTimeout(pollStatus, 2000);
        }
      } catch (err) {
        setError('Failed to connect to server');
      }
    };

    pollStatus();
  }, [jobId, onComplete]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-900/90 border border-gray-800 rounded-lg shadow-lg backdrop-blur-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-center">
          {status?.status === 'completed' ? (
            <CheckCircle className="w-8 h-8 text-green-400" />
          ) : status?.status === 'failed' ? (
            <XCircle className="w-8 h-8 text-red-400" />
          ) : (
            <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
          )}
        </div>

        <div className="text-center">
          <h3 className="text-lg font-medium text-yellow-400">
            {status?.status === 'completed' ? 'Processing Complete' :
             status?.status === 'failed' ? 'Processing Failed' :
             'Processing Audio'}
          </h3>
          
          {status?.progress !== undefined && (
            <div className="mt-4">
              <div className="w-full bg-gray-800 rounded-full h-2.5">
                <div 
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, status.progress)}%` }}
                />
              </div>
              <p className="text-sm text-gray-400 mt-2">
                {Math.round(status.progress)}% complete
              </p>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-400 mt-2">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}