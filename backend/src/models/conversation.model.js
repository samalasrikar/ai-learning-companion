import mongoose from 'mongoose';

const conversationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
  },
  {
    timestamps: true,
    collection: 'conversations',
  }
);

const Conversation = mongoose.model('Conversation', conversationSchema);
export default Conversation;
