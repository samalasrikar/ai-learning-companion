import React from 'react';
import { FileText } from 'lucide-react';

function AttachmentList({ attachments = [] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mt-2.5 flex flex-wrap gap-1.5 border-t border-border/10 pt-2 select-none w-full justify-start">
      {attachments.map((file, idx) => (
        <div 
          key={idx} 
          className="flex items-center gap-1.5 px-2.5 py-1 bg-muted/60 hover:bg-muted rounded-lg text-xs font-semibold border border-border/40 text-foreground transition-colors cursor-pointer"
        >
          <FileText className="h-3.5 w-3.5 text-primary" />
          <span className="max-w-[120px] truncate">{file.name}</span>
        </div>
      ))}
    </div>
  );
}

export default React.memo(AttachmentList);
