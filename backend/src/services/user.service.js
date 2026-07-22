import User from '../models/user.model.js';
import Document from '../modules/documents/document.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

/**
 * Service to fetch all registered Student users with document counts.
 * Admin users are strictly excluded from student management operations.
 */
export const getAllUsersService = async (searchQuery = '') => {
  const filter = { role: 'Student' };

  if (searchQuery) {
    filter.$or = [
      { firstName: { $regex: searchQuery, $options: 'i' } },
      { lastName: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } },
    ];
  }

  const users = await User.find(filter).sort({ createdAt: -1 });

  // Attach document count to each student
  const usersWithDocCount = await Promise.all(
    users.map(async (u) => {
      const docCount = await Document.countDocuments({ uploadedBy: u._id });
      const uObj = u.toJSON();
      uObj.documentsUploaded = docCount;
      return uObj;
    })
  );

  return usersWithDocCount;
};

/**
 * Service to fetch a single Student user by ID with uploaded documents and AI usage statistics.
 * Returns error if user is Admin or non-existent.
 */
export const getUserByIdService = async (userId) => {
  const user = await User.findById(userId);
  if (!user || user.role === 'Admin') {
    const err = new Error('Student user not found');
    err.status = 404;
    throw err;
  }

  const documents = await Document.find({ uploadedBy: user._id }).sort({ uploadedAt: -1 });
  const conversations = await Conversation.find({ userId: user._id }).sort({ updatedAt: -1 });
  
  const totalConversations = conversations.length;
  let totalMessages = 0;
  if (totalConversations > 0) {
    const convIds = conversations.map((c) => c._id);
    totalMessages = await Message.countDocuments({ conversationId: { $in: convIds } });
  }

  const lastAiActivity = conversations.length > 0 ? conversations[0].updatedAt : null;
  const avgMessagesPerConversation =
    totalConversations > 0 ? parseFloat((totalMessages / totalConversations).toFixed(1)) : 0;

  const userObj = user.toJSON();
  userObj.documentsUploaded = documents.length;
  userObj.documents = documents;

  // Student AI Usage Metrics
  userObj.aiUsage = {
    totalConversations,
    totalMessages,
    lastAiActivity,
    avgMessagesPerConversation,
  };

  return userObj;
};

/**
 * Service to toggle a student user's isActive status.
 */
export const toggleUserStatusService = async (userId, isActive) => {
  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  // Prevent modifying Admin account under any circumstances
  if (user.role === 'Admin') {
    const err = new Error('The Admin account cannot be modified or disabled.');
    err.status = 403;
    throw err;
  }

  user.isActive = typeof isActive === 'boolean' ? isActive : !user.isActive;
  await user.save();
  return user;
};
