export interface SeparationJob {
  status: string;
  job_id: string;
  stems?: Record<string, string>;
  message?: string;
  error?: string;
}