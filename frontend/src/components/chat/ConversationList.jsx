import React from 'react';
import { MessageSquare, Plus, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SearchBar from '../common/SearchBar';

export default function ConversationList({
  conversations,
  activeConversationId,
  searchQuery,
  setSearchQuery,
  loadingConversations,
  onSelectConversation,
  onNewConversation,
  onOpenRenameModal,
  onOpenDeleteModal,
}) {
  return (
    <div className="p-3 pb-2 flex flex-col gap-2 shrink-0">
      <Button
        onClick={onNewConversation}
        size="sm"
        className="w-full flex items-center justify-center gap-1.5 h-9 rounded-lg font-bold text-xs bg-primary text-primary-foreground shadow-sm transition-all hover:bg-primary/95"
        aria-label="Start new conversation"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>New Chat</span>
      </Button>

      <SearchBar
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search chats..."
      />

      <div className="flex-grow overflow-y-auto pt-2 space-y-1.5 custom-scrollbar">
        {loadingConversations ? (
          <div className="text-center py-12 text-xs text-muted-foreground">Loading chats...</div>
        ) : conversations.length > 0 ? (
          <div className="space-y-1.5">
            <p className="px-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest text-left">
              Conversations
            </p>
            <div className="space-y-1">
              {conversations.map((c) => {
                const isActive = c._id === activeConversationId;
                return (
                  <div
                    key={c._id}
                    onClick={() => onSelectConversation(c._id)}
                    className={`group flex items-center gap-2 p-2.5 rounded-xl border transition-all cursor-pointer shadow-xs ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'bg-card border-border/40 text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                    }`}
                  >
                    <MessageSquare className={`h-4 w-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'}`} />
                    <div className="flex-grow min-w-0 flex items-center justify-between gap-1 text-left">
                      <span className="truncate text-xs font-semibold">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        type="button"
                        onClick={(e) => onOpenRenameModal(c._id, c.title, e)}
                        className="p-1 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-lg transition-all"
                        title="Rename conversation"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => onOpenDeleteModal(c._id, c.title, e)}
                        className="p-1 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all"
                        title="Delete conversation"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-xs text-muted-foreground px-4 leading-relaxed">
            Start a new conversation with Jarvis.
          </div>
        )}
      </div>
    </div>
  );
}
