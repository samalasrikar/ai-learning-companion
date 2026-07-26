import React from 'react';
import { Bot, FileText } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import MarkdownRenderer from './MarkdownRenderer';
import AttachmentList from './AttachmentList';

const cleanContent = (text) => {
  if (!text) return '';
  return text
    .replace(/^I couldn't find relevant information in your uploaded documents\.?\s*Based on general knowledge:?\s*/i, '')
    .replace(/^Based on general knowledge:?\s*/i, '')
    .trim();
};

function AssistantMessage({ message, attachments = [] }) {
  const sources = message.sources || [];
  const rawText = message.text || message.content;
  const displayText = cleanContent(rawText);

  return (
    <div className="w-full py-1">
      <div className="max-w-4xl mx-auto flex gap-3 items-end justify-start w-full">
        {/* Assistant Avatar on left */}
        <Avatar className="w-8 h-8 bg-primary flex items-center justify-center shrink-0 shadow-sm text-primary-foreground">
          <Bot className="h-4 w-4" />
        </Avatar>

        {/* Bubble */}
        <div className="px-4 py-3 rounded-2xl shadow-sm text-left border bg-card border-border/40 text-foreground rounded-tl-none break-words overflow-wrap-anywhere max-w-[75%]">
          <div className="space-y-1">
            <MarkdownRenderer text={displayText} isAssistant={true} />
          </div>

          {/* Document Citations Badge (shown when sources are cited) */}
          {sources.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-border/40 space-y-1.5 select-none">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                Cited Document Sources ({sources.length})
              </span>
              <div className="flex flex-wrap gap-1.5">
                {sources.map((src, idx) => (
                  <div
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/15 transition-colors"
                  >
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="font-semibold">{src.filename || 'Document'}</span>
                    <span className="opacity-80 text-[10px] font-mono">
                      (Page {src.page_number || src.pageNumber || 1})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <AttachmentList attachments={attachments} />
        </div>
      </div>
    </div>
  );
}

export default React.memo(AssistantMessage);
