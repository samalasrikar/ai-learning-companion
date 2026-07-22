import React, { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import DocumentUploadDropzone from '../components/documents/DocumentUploadDropzone';
import DocumentAiPanel from '../components/documents/DocumentAiPanel';
import DocumentGrid from '../components/documents/DocumentGrid';
import { uploadDocument } from '../services/document.service';

export default function Documents() {
  // Load initial list from localStorage for cross-page persistence
  const [documents, setDocuments] = useState(() => {
    const stored = localStorage.getItem('uploaded_documents');
    return stored ? JSON.parse(stored) : [];
  });
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  
  const fileInputRef = useRef(null);

  const handleBrowseClick = () => {
    if (uploading) return;
    fileInputRef.current?.click();
  };

  const validateAndSelectFile = (file) => {
    if (!file) return;

    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      toast.error('Invalid file type', {
        description: 'Only PDF documents are allowed at this stage.',
      });
      return;
    }

    const maxSize = 20 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error('File size exceeded', {
        description: 'Maximum permitted file size is 20 MB.',
      });
      return;
    }

    setSelectedFile(file);
    setUploadProgress(0);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      validateAndSelectFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (uploading) return;
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (uploading) return;
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      validateAndSelectFile(e.dataTransfer.files[0]);
    }
  };

  const triggerUpload = async () => {
    if (!selectedFile || uploading) return;

    setUploading(true);
    setUploadProgress(0);

    const toastId = toast.loading(`Uploading "${selectedFile.name}"... 0%`);

    try {
      const response = await uploadDocument(selectedFile, (progress) => {
        setUploadProgress(progress);
        toast.loading(`Uploading "${selectedFile.name}"... ${progress}%`, { id: toastId });
      });

      if (response && response.success) {
        toast.success('Upload complete', {
          id: toastId,
          description: `Successfully uploaded ${selectedFile.name}`,
        });

        const newDoc = {
          id: response.documentId,
          name: response.filename,
          size: `${(selectedFile.size / (1024 * 1024)).toFixed(1)} MB`,
          date: 'Uploaded just now',
        };
        
        // Update state and write to localStorage
        setDocuments((prev) => {
          const updated = [newDoc, ...prev];
          localStorage.setItem('uploaded_documents', JSON.stringify(updated));
          return updated;
        });
        setSelectedFile(null);
      } else {
        throw new Error('Upload returned unsuccessful status');
      }
    } catch (err) {
      console.error(err);
      toast.error('Upload failed', {
        id: toastId,
        description: err.response?.data?.message || err.message || 'Please check your connection to the server.',
      });
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (docToDelete) => {
    setDocuments((prev) => {
      const updated = prev.filter((doc) => doc.id !== docToDelete.id);
      localStorage.setItem('uploaded_documents', JSON.stringify(updated));
      return updated;
    });
    toast.success('Document deleted');
  };

  const handleAnalyze = (doc) => {
    toast.info('Document analysis prepared', {
      description: `Analysis logic will connect to server compiler modules in the next phase. Document: ${doc.name}`,
    });
  };

  return (
    <div className="space-y-6 w-full text-left">
      {/* Page Header */}
      <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            Documents
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your study materials and AI knowledge base context.
          </p>
        </div>
        <Button
          onClick={handleBrowseClick}
          disabled={uploading}
          size="sm"
          className="bg-primary hover:bg-primary/95 text-primary-foreground font-bold px-4 py-2 h-9 rounded-lg shadow-md shadow-primary/10 transition-all flex items-center gap-1.5 active:scale-98"
        >
          <Plus className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
      </section>

      {/* Grid Layout: Upload Area & AI Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Drag & Drop Upload Zone Component */}
        <div className="lg:col-span-6 h-full">
          <DocumentUploadDropzone
            selectedFile={selectedFile}
            uploading={uploading}
            uploadProgress={uploadProgress}
            dragActive={dragActive}
            fileInputRef={fileInputRef}
            onBrowseClick={handleBrowseClick}
            onFileChange={handleFileChange}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClearSelectedFile={() => setSelectedFile(null)}
            onTriggerUpload={triggerUpload}
          />
        </div>

        {/* AI Context Summary Panel Component */}
        <div className="lg:col-span-6">
          <DocumentAiPanel />
        </div>
      </div>

      {/* Uploaded Documents Grid Component */}
      <DocumentGrid
        documents={documents}
        onDelete={handleDelete}
        onAnalyze={handleAnalyze}
        onBrowseClick={handleBrowseClick}
      />
    </div>
  );
}
