import React from 'react';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';

export default function DocumentAiPanel() {
  return (
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
  );
}
