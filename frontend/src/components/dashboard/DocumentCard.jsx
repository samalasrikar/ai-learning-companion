import React from 'react';
import { FileText, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DocumentActionsMenu from '@/components/documents/DocumentActionsMenu';

export default function DocumentCard({
  doc,
  onAnalyze,
  onViewContent,
  onDownload,
  onDelete,
}) {
  const { name, size, date } = doc;

  return (
    <Card className="bg-card border-border/40 hover:-translate-y-0.5 hover:shadow-md transition-all duration-200 shadow-sm p-3.5 rounded-xl">
      <CardContent className="p-0 flex items-center justify-between gap-3 w-full">
        {/* Document Icon & Details */}
        <div className="flex items-center gap-2.5 min-w-0 text-left">
          <div className="p-2 bg-muted rounded-lg shrink-0 text-primary">
            <FileText className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-foreground truncate max-w-[180px]" title={name}>
              {name}
            </h4>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {size} • {date}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            onClick={() => onAnalyze?.(doc)}
            className="hidden sm:flex items-center gap-1 text-[10px] font-bold h-7 px-2.5 bg-primary/10 hover:bg-primary/20 text-primary border-none shadow-none rounded-lg cursor-pointer transition-colors"
          >
            <Sparkles className="h-3 w-3" />
            <span>Analyze</span>
          </Button>

          <DocumentActionsMenu
            doc={doc}
            onViewContent={onViewContent}
            onDownload={onDownload}
            onDelete={onDelete}
          />
        </div>
      </CardContent>
    </Card>
  );
}
