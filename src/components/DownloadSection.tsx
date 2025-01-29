import React from 'react';
import type { SeparationJob } from '../types';
import { Download } from 'lucide-react';

interface DownloadSectionProps {
  job: SeparationJob;
}

export default function DownloadSection({ job }: DownloadSectionProps) {
  const handleDownloadAll = async () => {
    if (!job.stems) return;

    // Download each stem sequentially
    for (const [name, path] of Object.entries(job.stems)) {
      try {
        const response = await fetch(`http://localhost:5001${path}`, {
          headers: {
            'Content-Type': 'audio/wav',
          },
        });
        
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${name}.wav`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } catch (error) {
        console.error(`Failed to download ${name}:`, error);
      }
    }
  };

  return (
    <div className="glass-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-yellow-400">Processing Complete</h3>
        <button
          onClick={handleDownloadAll}
          className="p-2 text-yellow-400 hover:text-yellow-300 transition-colors rounded-full hover:bg-gray-800"
          title="Download all stems"
        >
          <Download className="w-6 h-6" />
        </button>
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p className="text-gray-300 mb-2">Available stems:</p>
        <ul className="list-disc list-inside">
          {job.stems && Object.keys(job.stems).map(stem => (
            <li key={stem} className="capitalize">
              {stem}.wav
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}