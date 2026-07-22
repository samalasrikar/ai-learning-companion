import React from 'react';
import ConversationList from '../components/chat/ConversationList';
import ChatWorkspace from '../components/chat/ChatWorkspace';
import RenameConversationModal from '../components/chat/RenameConversationModal';
import DeleteConversationModal from '../components/chat/DeleteConversationModal';
import { useChatSession } from '../hooks/useChatSession';

export default function Chat() {
  const {
    conversations,
    activeConversation,
    activeConversationId,
    messages,
    input,
    setInput,
    loadingMessages,
    loadingAi,
    loadingConversations,
    searchQuery,
    setSearchQuery,
    sidebarOpen,
    setSidebarOpen,
    attachedFiles,
    setAttachedFiles,
    renameModal,
    setRenameModal,
    deleteModal,
    setDeleteModal,
    messagesEndRef,
    handleSelectConversation,
    handleNewConversation,
    openRenameModal,
    confirmRename,
    openDeleteModal,
    confirmDelete,
    handleSend,
    handleAttach,
  } = useChatSession();

  return (
    <div className="absolute inset-0 top-14 left-[240px] flex overflow-hidden bg-background">
      {/* Mobile Backdrop overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="absolute inset-0 bg-background/40 backdrop-blur-xs z-20 lg:hidden cursor-pointer"
        />
      )}

      {/* Left Pane: Conversation Sidebar Component */}
      <aside 
        className={`border-r border-border/40 bg-muted/25 flex flex-col shrink-0 h-full transition-all duration-300 ease-in-out lg:relative absolute z-30 lg:z-0 left-0 top-0 bottom-0 bg-card ${
          sidebarOpen ? 'w-72 shadow-xl lg:shadow-none border-r' : 'w-0 overflow-hidden border-r-0'
        }`}
        aria-label="Conversation history sidebar"
      >
        <ConversationList
          conversations={conversations}
          activeConversationId={activeConversationId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          loadingConversations={loadingConversations}
          onSelectConversation={handleSelectConversation}
          onNewConversation={handleNewConversation}
          onOpenRenameModal={openRenameModal}
          onOpenDeleteModal={openDeleteModal}
        />
      </aside>

      {/* Right Pane: Conversation Chat Workspace Component */}
      <ChatWorkspace
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        activeConversation={activeConversation}
        messages={messages}
        loadingMessages={loadingMessages}
        loadingAi={loadingAi}
        attachedFiles={attachedFiles}
        setAttachedFiles={setAttachedFiles}
        input={input}
        setInput={setInput}
        onSend={handleSend}
        onAttach={handleAttach}
        onOpenRenameModal={openRenameModal}
        messagesEndRef={messagesEndRef}
      />

      {/* Modular Modals */}
      <RenameConversationModal
        isOpen={renameModal.isOpen}
        title={renameModal.title}
        setTitle={(t) => setRenameModal((prev) => ({ ...prev, title: t }))}
        onClose={() => setRenameModal({ isOpen: false, convId: null, title: '' })}
        onConfirm={confirmRename}
      />

      <DeleteConversationModal
        isOpen={deleteModal.isOpen}
        title={deleteModal.title}
        onClose={() => setDeleteModal({ isOpen: false, convId: null, title: '' })}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
