import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversation',
      required: [true, 'Conversation ID is required'],
    },
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: [true, 'Role is required'],
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
    },
    sources: [
      {
        filename: String,
        page_number: Number,
        document_id: String,
        chunk_id: String,
        similarity_score: Number,
      },
    ],
    mode: {
      type: String,
      enum: ['rag', 'general'],
      default: 'rag',
    },
  },
  {
    timestamps: true,
    collection: 'messages',
  }
);

const Message = mongoose.model('Message', messageSchema);
export default Message;
