import React from 'react';
import { AlertCircle } from 'lucide-react';
import DocumentCard from '../dashboard/DocumentCard';
import EmptyState from '../common/EmptyState';

export default function DocumentGrid({
  documents,
  onDelete,
  onAnalyze,
  onViewContent,
  onDownload,
  onBrowseClick,
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-base font-bold text-foreground tracking-tight">Your Documents</h3>
      {documents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((doc) => (
            <DocumentCard
              key={doc.id || doc._id}
              doc={doc}
              onDelete={onDelete}
              onAnalyze={onAnalyze}
              onViewContent={onViewContent}
              onDownload={onDownload}
            />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={AlertCircle}
          title="No documents uploaded"
          description="Index files to build your personalized study context and generate custom practice questions."
          actionText="Upload a file"
          onAction={onBrowseClick}
        />
      )}
    </section>
  );
}
