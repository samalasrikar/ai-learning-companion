import React, { useRef, useEffect } from 'react';
import { Send, Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

export default function ChatInput({ input, setInput, onSubmit, onAttach, placeholder = 'Ask AI Learning Companion...' }) {
  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-grow textarea height on content changes
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '36px'; // base inline height
      const scrollHeight = textareaRef.current.scrollHeight;
      // Cap max height at 120px to prevent viewport overflow
      textareaRef.current.style.height = `${Math.min(scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSubmit(e);
    }
  };

  const handleAttachClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onAttach?.(e.target.files[0]);
    }
  };

  return (
    <form 
      onSubmit={onSubmit} 
      className="flex gap-2 items-end w-full relative bg-card border border-border/40 rounded-2xl pl-2 pr-2.5 py-2 shadow-sm min-h-14 max-h-40"
      aria-label="Chat Input Form"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".pdf"
        aria-label="Upload PDF document"
      />
      
      {/* File Attachment Button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={handleAttachClick}
        className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-xl hover:bg-muted shrink-0 transition-colors focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="Attach PDF file"
      >
        <Paperclip className="h-4.5 w-4.5" />
      </Button>

      {/* Message Text Input */}
      <Textarea
        ref={textareaRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={1}
        className="flex-grow bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 min-h-9 max-h-32 py-2 px-1 text-sm resize-none custom-scrollbar shadow-none text-foreground outline-none leading-relaxed transition-all duration-75"
        aria-label="Type your message"
      />
        
      {/* Send Button */}
      <Button
        type="submit"
        disabled={!input.trim()}
        className="h-9 w-9 bg-primary hover:bg-primary/95 text-primary-foreground rounded-xl transition-all shrink-0 shadow-sm disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center focus-visible:ring-1 focus-visible:ring-primary"
        aria-label="Send message"
      >
        <Send className="h-4 w-4" />
      </Button>
    </form>
  );
}
