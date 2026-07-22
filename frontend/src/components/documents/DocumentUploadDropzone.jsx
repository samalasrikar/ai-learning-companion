import React from 'react';
import { UploadCloud, FileText, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function DocumentUploadDropzone({
  selectedFile,
  uploading,
  uploadProgress,
  dragActive,
  fileInputRef,
  onBrowseClick,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onClearSelectedFile,
  onTriggerUpload,
}) {
  return (
    <Card
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`border border-dashed transition-all duration-200 bg-card rounded-xl p-5 flex flex-col justify-between h-48 relative overflow-hidden shadow-sm ${
        dragActive ? 'border-primary bg-primary/5' : 'border-border/60 hover:bg-muted/10 hover:border-primary'
      }`}
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={onFileChange}
        className="hidden"
        accept=".pdf"
      />

      <CardContent className="p-0 flex flex-col justify-between h-full w-full">
        {!selectedFile ? (
          // Initial State: Drag/Drop guidelines
          <div onClick={onBrowseClick} className="flex flex-col items-center justify-center flex-grow cursor-pointer">
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
                  onClick={onClearSelectedFile}
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
                  onClick={onTriggerUpload}
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
  );
}
