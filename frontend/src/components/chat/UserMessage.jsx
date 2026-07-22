import React from 'react';
import { User } from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import AttachmentList from './AttachmentList';

function UserMessage({ message, attachments = [] }) {
  return (
    <div className="w-full py-1">
      <div className="max-w-4xl mx-auto flex gap-3 items-end justify-end w-full">
        {/* Bubble */}
        <div className="px-4 py-3 rounded-2xl shadow-sm text-left border bg-primary border-primary text-primary-foreground rounded-tr-none break-words overflow-wrap-anywhere max-w-[70%]">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          <AttachmentList attachments={attachments} />
        </div>

        {/* User Avatar on right, aligned with bottom of bubble */}
        <Avatar className="w-8 h-8 bg-secondary border border-border/40 flex items-center justify-center shrink-0 shadow-sm text-secondary-foreground">
          <User className="h-4 w-4" />
        </Avatar>
      </div>
    </div>
  );
}

export default React.memo(UserMessage);
