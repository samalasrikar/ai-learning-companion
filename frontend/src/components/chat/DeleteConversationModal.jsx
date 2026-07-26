import React from 'react';
import ConfirmDialog from '../common/ConfirmDialog';

export default function DeleteConversationModal({ isOpen, title, onClose, onConfirm }) {
  return (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={onConfirm}
      title="Delete Conversation"
      description="Are you sure you want to delete this conversation and all of its messages? This action cannot be undone."
      itemName={title}
      confirmText="Delete Chat"
      variant="danger"
    />
  );
}
