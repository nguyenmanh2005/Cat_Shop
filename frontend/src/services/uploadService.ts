import { apiService } from './api';
import { API_CONFIG } from '@/config/api';

// Upload Service
export const uploadService = {
  // Upload một file hình ảnh
  async uploadImage(file: File): Promise<{ url: string; filename: string }> {
    return apiService.upload<{ url: string; filename: string }>(
      API_CONFIG.ENDPOINTS.UPLOAD.IMAGE,
      file
    );
  },

  // Upload nhiều file
  async uploadMultiple(files: File[]): Promise<{ urls: string[]; filenames: string[] }> {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`files`, file);
    });

    const response = await apiService.post<{ urls: string[]; filenames: string[] }>(
      API_CONFIG.ENDPOINTS.UPLOAD.MULTIPLE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    return response;
  },

  // Upload file với progress callback
  async uploadWithProgress(
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<{ url: string; filename: string }> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiService.post<{ url: string; filename: string }>(
      API_CONFIG.ENDPOINTS.UPLOAD.IMAGE,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(progress);
          }
        },
      }
    );

    return response;
  }
};
