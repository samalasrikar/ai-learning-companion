import React from 'react';
import { Bot } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import MarkdownRenderer from './MarkdownRenderer';
import AttachmentList from './AttachmentList';

function AssistantMessage({ message, attachments = [] }) {
  return (
    <div className="w-full py-1">
      <div className="max-w-4xl mx-auto flex gap-3 items-end justify-start w-full">
        {/* Assistant Avatar on left, aligned with bottom of bubble */}
        <Avatar className="w-8 h-8 bg-primary flex items-center justify-center shrink-0 shadow-sm text-primary-foreground">
          <Bot className="h-4 w-4" />
        </Avatar>

        {/* Bubble */}
        <div className="px-4 py-3 rounded-2xl shadow-sm text-left border bg-card border-border/40 text-foreground rounded-tl-none break-words overflow-wrap-anywhere max-w-[70%]">
          <span className="text-[9px] font-bold text-primary uppercase tracking-wider block mb-1 select-none">
            AI Companion
          </span>

          <div className="space-y-1">
            <MarkdownRenderer text={message.text} isAssistant={true} />
          </div>

          <AttachmentList attachments={attachments} />
        </div>
      </div>
    </div>
  );
}

export default React.memo(AssistantMessage);
