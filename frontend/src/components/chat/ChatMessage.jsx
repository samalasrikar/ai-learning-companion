import React from 'react';
import UserMessage from './UserMessage';
import AssistantMessage from './AssistantMessage';

/**
 * ChatMessage router proxy component.
 * Detects role and mounts either UserMessage or AssistantMessage.
 */
function ChatMessage({ message, attachments = [] }) {
  const isAssistant = message.role === 'assistant';

  if (isAssistant) {
    return <AssistantMessage message={message} attachments={attachments} />;
  }

  return <UserMessage message={message} attachments={attachments} />;
}

export default React.memo(ChatMessage);
