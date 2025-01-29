import { API_CONFIG } from '../config';
import type { ApiResponse, SeparationJob } from '../types';

export async function uploadAudio(file: File): Promise<ApiResponse<SeparationJob>> {
  const formData = new FormData();
  formData.append('audio', file);

  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/separate`, {
      method: 'POST',
      body: formData,
    });
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Failed to upload audio file',
    };
  }
}

export async function getJobStatus(jobId: string): Promise<ApiResponse<SeparationJob>> {
  try {
    const response = await fetch(`${API_CONFIG.baseUrl}/status/${jobId}`);
    return await response.json();
  } catch (error) {
    return {
      success: false,
      error: 'Failed to fetch job status',
    };
  }
}