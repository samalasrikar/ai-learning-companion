import React, { useState, useRef } from 'react';
import { UploadCloud, Sparkles, Plus, AlertCircle, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import DocumentCard from '../components/dashboard/DocumentCard';
import EmptyState from '../components/common/EmptyState';
import { toast } from 'sonner';
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
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
          accept=".pdf"
        />
      </section>

      {/* Grid Layout: Upload Area & AI Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Drag & Drop Upload Zone */}
        <div className="lg:col-span-6 h-full">
          <Card
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`border border-dashed transition-all duration-200 bg-card rounded-xl p-5 flex flex-col justify-between h-48 relative overflow-hidden shadow-sm ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border/60 hover:bg-muted/10 hover:border-primary'
            }`}
          >
            <CardContent className="p-0 flex flex-col justify-between h-full w-full">
              {!selectedFile ? (
                // Initial State: Drag/Drop guidelines
                <div onClick={handleBrowseClick} className="flex flex-col items-center justify-center flex-grow cursor-pointer">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center mb-2.5">
                    <UploadCloud className="h-4.5 w-4.5 text-muted-foreground" />
                  </div>
                  <h3 className="text-xs font-bold text-foreground mb-0.5">Drag & Drop file</h3>
                  <p className="text-[10px] text-muted-foreground mb-2 max-w-[200px] text-center">
                    Supported formats: PDF (Max 20MB)
                  </p>
                  <span className="text-[10px] font-bold text-primary hover:underline">Or browse files</span>
                </div>
              ) : (
                // Active State: File selected review panel
                <div className="flex flex-col justify-between h-full w-full">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2 text-left">
                      <div className="p-2 bg-primary/10 text-primary rounded-lg">
                        <FileText className="h-4.5 w-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs font-bold text-foreground truncate max-w-[220px]" title={selectedFile.name}>
                          {selectedFile.name}
                        </h4>
                        <p className="text-[10px] text-muted-foreground">
                          {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      </div>
                    </div>
                    {!uploading && (
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setSelectedFile(null)}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-lg"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>

                  {/* Upload trigger controls & loading progress bar */}
                  <div className="space-y-3 pt-2">
                    {uploading ? (
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>Uploading PDF...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                          <div
                            className="bg-primary h-full rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    ) : (
                      <Button
                        onClick={triggerUpload}
                        className="w-full bg-primary hover:bg-primary/95 text-primary-foreground font-bold h-9 rounded-lg shadow-sm text-xs flex items-center justify-center gap-1.5 active:scale-98"
                      >
                        <Check className="h-3.5 w-3.5" />
                        <span>Confirm and Upload</span>
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI Context Summary Panel */}
        <div className="lg:col-span-6">
          <Card className="bg-card border-border/40 p-5 flex flex-col justify-between h-48 relative overflow-hidden shadow-sm rounded-xl">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-xs font-bold text-foreground">AI Knowledge Base</h3>
              </div>
              <span className="px-2 py-0.5 bg-primary-container/10 text-primary font-bold rounded-full text-[9px] uppercase tracking-wider">
                BETA
              </span>
            </div>
            <div className="flex-grow flex flex-col items-center justify-center bg-muted/20 border border-dashed border-border/40 rounded-lg p-3 text-center mt-3">
              <p className="text-[11px] text-muted-foreground max-w-sm leading-relaxed">
                PDF indexing and summarization are prepared. In subsequent phases, uploaded document files will automatically populate study guides and flashcards.
              </p>
            </div>
          </Card>
        </div>
      </div>

      {/* Uploaded Documents Grid */}
      <section className="space-y-3">
        <h3 className="text-base font-bold text-foreground tracking-tight">Your Documents</h3>
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                doc={doc}
                onDelete={handleDelete}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={AlertCircle}
            title="No documents uploaded"
            description="Index files to build your personalized study context and generate custom practice questions."
            actionText="Upload a file"
            onAction={handleBrowseClick}
          />
        )}
      </section>
    </div>
  );
}
