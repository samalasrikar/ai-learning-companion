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

/**
 * Deletes a document by ID.
 * @param {string} documentId - The ID of the document to delete.
 * @returns {Promise<{success: boolean, message: string}>} Response payload.
 */
export const deleteDocument = async (documentId) => {
  const response = await api.delete(`/documents/${documentId}`);
  return response.data;
};

/**
 * Fetches PDF document Blob for inline viewing.
 * @param {string} documentId - The ID of the document to view.
 * @returns {Promise<Blob>} The PDF file Blob.
 */
export const fetchDocumentBlob = async (documentId) => {
  const response = await api.get(`/documents/${documentId}/view`, {
    responseType: 'blob',
  });
  return response.data;
};

/**
 * Downloads document file attachment and triggers native browser download.
 * @param {string} documentId - The ID of the document to download.
 * @param {string} fallbackFilename - Original document filename.
 */
export const downloadDocumentFile = async (documentId, fallbackFilename = 'document.pdf') => {
  const response = await api.get(`/documents/${documentId}/download`, {
    responseType: 'blob',
  });

  // Extract filename from Content-Disposition header if available
  let filename = fallbackFilename;
  const disposition = response.headers?.['content-disposition'];
  if (disposition && disposition.includes('filename=')) {
    const filenameMatch = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
    if (filenameMatch && filenameMatch[1]) {
      filename = decodeURIComponent(filenameMatch[1].replace(/['"]/g, ''));
    }
  }

  const blob = new Blob([response.data], { type: response.headers?.['content-type'] || 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  if (link.parentNode) {
    link.parentNode.removeChild(link);
  }
  window.URL.revokeObjectURL(url);
};


