import api from './api';

/**
 * Uploads a document to the Express backend.
 * @param {File} file - The file object to upload.
 * @param {Function} onProgress - Callback triggered with percentage value (0-100).
 * @returns {Promise<{success: boolean, fileId: string, filename: string, size: number, uploadedAt: string, path: string}>} The upload result details.
 */
export const uploadDocument = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('file', file);

  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
    onUploadProgress: (progressEvent) => {
      if (onProgress && progressEvent.total) {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      }
    },
  });

  return response.data;
};
