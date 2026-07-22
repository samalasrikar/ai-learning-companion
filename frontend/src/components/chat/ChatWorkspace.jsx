import React from 'react';
import { Bot, SidebarClose, SidebarOpen, FileText, X, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';

export default function ChatWorkspace({
  sidebarOpen,
  setSidebarOpen,
  activeConversation,
  messages,
  loadingMessages,
  loadingAi,
  attachedFiles,
  setAttachedFiles,
  input,
  setInput,
  onSend,
  onAttach,
  onOpenRenameModal,
  messagesEndRef,
}) {
  return (
    <section className="flex-grow flex flex-col bg-background relative h-full min-w-0" aria-label="Active chat workspace">
      {/* Subheader Bar */}
      <div className="h-10 border-b border-border/40 px-3 flex items-center justify-between bg-card/45 backdrop-blur-xs shrink-0 select-none">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSidebarOpen(prev => !prev)}
          className="h-7 w-7 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted"
          aria-label={sidebarOpen ? "Hide chat history" : "Show chat history"}
        >
          {sidebarOpen ? <SidebarClose className="h-4 w-4" /> : <SidebarOpen className="h-4 w-4" />}
        </Button>
        <div className="flex items-center gap-2 max-w-[320px]">
          <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest truncate">
            {activeConversation?.title || 'AI Chat Workspace'}
          </span>
          {activeConversation && (
            <button
              type="button"
              onClick={() => onOpenRenameModal(activeConversation._id, activeConversation.title)}
              className="p-1 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
              title="Rename chat"
            >
              <Edit2 className="h-3 w-3" />
            </button>
          )}
        </div>
        <div className="w-7"></div>
      </div>

      {/* Messages Body */}
      <div className="flex-grow overflow-y-auto px-4 py-4 custom-scrollbar flex flex-col gap-4">
        <div className="max-w-4xl mx-auto w-full space-y-4 flex-grow">
          {loadingMessages ? (
            <div className="py-20 text-center text-xs text-muted-foreground">Loading messages...</div>
          ) : messages.length > 0 ? (
            messages.map((msg, idx) => (
              <ChatMessage 
                key={msg.id || idx} 
                message={msg} 
                attachments={msg.attachments}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-28 space-y-3">
              <Bot className="h-10 w-10 text-primary/30 animate-pulse" />
              <h3 className="text-sm font-bold text-foreground">Jarvis AI Learning Companion</h3>
              <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
                Start a new conversation with Jarvis. Ask questions, clarify concepts, or attach PDF documents for context.
              </p>
            </div>
          )}

          {/* AI Thinking Indicator */}
          {loadingAi && (
            <div className="w-full py-1">
              <div className="max-w-4xl mx-auto flex gap-3.5 items-start justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5 shadow-sm text-primary-foreground animate-pulse">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex flex-col gap-1 max-w-[70%] items-start">
                  <div className="px-4 py-2.5 bg-card border border-border/40 text-foreground rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Jarvis is thinking</span>
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                    <span className="h-1.5 w-1.5 bg-muted-foreground rounded-full animate-bounce"></span>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Bar Footer */}
      <footer className="p-4 border-t border-border/40 bg-card/60 backdrop-blur-md shrink-0">
        <div className="max-w-4xl mx-auto w-full space-y-2">
          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pb-2">
              {attachedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center gap-1 px-2.5 py-1 bg-muted border border-border/40 rounded-lg text-xs font-semibold text-foreground">
                  <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate max-w-[120px]">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => setAttachedFiles((prev) => prev.filter((_, i) => i !== idx))}
                    className="ml-1 text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10 rounded p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={onSend}
            onAttach={onAttach}
            placeholder={loadingAi ? 'Thinking...' : 'Ask Jarvis AI Learning Companion...'}
            disabled={loadingAi}
          />
        </div>
      </footer>
    </section>
  );
}
