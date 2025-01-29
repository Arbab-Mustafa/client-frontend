export const API_CONFIG = {
  // During development, point to local backend
  baseUrl:
    import.meta.env.VITE_API_URL ||
    "https://client-production-ec4d.up.railway.app",
  // Adjust timeout for long-running operations
  timeout: 300000, // 5 minutes
};

export const APP_CONFIG = {
  maxFileSize: 30 * 1024 * 1024, // 30MB
  supportedFormats: [".mp3", ".wav", ".flac", ".m4a", ".ogg"],
};
