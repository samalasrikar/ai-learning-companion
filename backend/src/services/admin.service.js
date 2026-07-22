import fs from 'fs';
import User from '../models/user.model.js';
import Document from '../modules/documents/document.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';

/**
 * Calculate real admin dashboard statistics from MongoDB.
 */
export const getDashboardStatsService = async () => {
  const totalStudents = await User.countDocuments({ role: 'Student' });
  const totalDocuments = await Document.countDocuments();
  const activeStudents = await User.countDocuments({ role: 'Student', isActive: true });

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const newStudents = await User.countDocuments({
    role: 'Student',
    createdAt: { $gte: sevenDaysAgo },
  });

  return {
    totalStudents,
    totalDocuments,
    activeStudents,
    newStudents,
  };
};

/**
 * Construct recent activity stream from registrations, uploads, and AI chat activity.
 */
export const getRecentActivityService = async () => {
  const recentUsers = await User.find({ role: 'Student' })
    .sort({ createdAt: -1 })
    .limit(10);

  const recentDocs = await Document.find()
    .populate('uploadedBy', 'firstName lastName email')
    .sort({ uploadedAt: -1 })
    .limit(10);

  const recentConvs = await Conversation.find()
    .populate('userId', 'firstName lastName email')
    .sort({ updatedAt: -1 })
    .limit(10);

  const activities = [];

  recentUsers.forEach((u) => {
    activities.push({
      id: u._id.toString(),
      type: 'student_registered',
      activity: 'Student Registered',
      studentName: `${u.firstName} ${u.lastName}`,
      email: u.email,
      timestamp: u.createdAt,
    });
  });

  recentDocs.forEach((d) => {
    activities.push({
      id: d._id.toString(),
      type: 'pdf_uploaded',
      activity: `PDF Uploaded: ${d.originalName}`,
      studentName: d.uploadedBy
        ? `${d.uploadedBy.firstName} ${d.uploadedBy.lastName}`
        : 'Student Upload',
      email: d.uploadedBy?.email || 'N/A',
      timestamp: d.uploadedAt,
    });
  });

  recentConvs.forEach((c) => {
    if (c.userId) {
      activities.push({
        id: c._id.toString(),
        type: 'chat_started',
        activity: `Started AI Chat: "${c.title}"`,
        studentName: `${c.userId.firstName} ${c.userId.lastName}`,
        email: c.userId.email,
        timestamp: c.updatedAt || c.createdAt,
      });
    }
  });

  // Sort activities newest first
  activities.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return activities.slice(0, 15);
};

/**
 * Fetch all uploaded documents for admin review with uploader details and search filter.
 */
export const getAdminDocumentsService = async (searchQuery = '') => {
  let documents = await Document.find()
    .populate('uploadedBy', 'firstName lastName email avatar')
    .sort({ uploadedAt: -1 });

  if (searchQuery) {
    const queryLower = searchQuery.toLowerCase();
    documents = documents.filter((doc) => {
      const fileNameMatch = doc.originalName?.toLowerCase().includes(queryLower);
      const uploaderName = doc.uploadedBy
        ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName} ${doc.uploadedBy.email}`.toLowerCase()
        : '';
      return fileNameMatch || uploaderName.includes(queryLower);
    });
  }

  return documents;
};

/**
 * Delete a document and clean up its file on disk.
 */
export const deleteAdminDocumentService = async (documentId) => {
  const document = await Document.findById(documentId);
  if (!document) {
    const err = new Error('Document not found');
    err.status = 404;
    throw err;
  }

  if (document.path && fs.existsSync(document.path)) {
    try {
      fs.unlinkSync(document.path);
    } catch (unlinkErr) {
      console.error('Failed to delete file on disk:', unlinkErr);
    }
  }

  await Document.findByIdAndDelete(documentId);
  return document;
};

/**
 * Fetch all student conversations for admin inspection with search and date filters.
 */
export const getAdminChatsService = async (searchQuery = '', filter = 'all') => {
  let query = {};

  // Date filtering
  const now = new Date();
  if (filter === 'today') {
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    query.updatedAt = { $gte: startOfToday };
  } else if (filter === 'last7days') {
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    query.updatedAt = { $gte: sevenDaysAgo };
  } else if (filter === 'last30days') {
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    query.updatedAt = { $gte: thirtyDaysAgo };
  }

  let conversations = await Conversation.find(query)
    .populate('userId', 'firstName lastName email avatar role')
    .sort({ updatedAt: -1 });

  // Attach message counts and format for admin view
  const formattedConvs = await Promise.all(
    conversations.map(async (c) => {
      const msgCount = await Message.countDocuments({ conversationId: c._id });
      const cObj = c.toJSON();
      cObj.totalMessages = msgCount;
      return cObj;
    })
  );

  // Search filter by conversation title or student name/email
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    return formattedConvs.filter((c) => {
      const titleMatch = c.title?.toLowerCase().includes(q);
      const studentMatch = c.userId
        ? `${c.userId.firstName} ${c.userId.lastName} ${c.userId.email}`.toLowerCase().includes(q)
        : false;
      return titleMatch || studentMatch;
    });
  }

  return formattedConvs;
};

/**
 * Fetch single conversation with full message transcript.
 */
export const getAdminChatByIdService = async (conversationId) => {
  const conversation = await Conversation.findById(conversationId).populate(
    'userId',
    'firstName lastName email avatar'
  );
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }

  const messages = await Message.find({ conversationId }).sort({ createdAt: 1 });
  const cObj = conversation.toJSON();
  cObj.messages = messages;

  return cObj;
};

/**
 * Delete a conversation and all its messages.
 */
export const deleteAdminChatService = async (conversationId) => {
  const conversation = await Conversation.findByIdAndDelete(conversationId);
  if (!conversation) {
    const err = new Error('Conversation not found');
    err.status = 404;
    throw err;
  }

  await Message.deleteMany({ conversationId });
  return conversation;
};

/**
 * Aggregated analytics for Admin Panel using MongoDB aggregations.
 */
export const getAdminAnalyticsService = async () => {
  const totalConversations = await Conversation.countDocuments();
  const totalMessages = await Message.countDocuments();
  const avgMessagesPerConversation =
    totalConversations > 0 ? parseFloat((totalMessages / totalConversations).toFixed(1)) : 0;

  // Find most active student by message count aggregation
  const activeStudentAgg = await Message.aggregate([
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversationId',
        foreignField: '_id',
        as: 'conv',
      },
    },
    { $unwind: '$conv' },
    {
      $group: {
        _id: '$conv.userId',
        totalMsgs: { $sum: 1 },
      },
    },
    { $sort: { totalMsgs: -1 } },
    { $limit: 1 },
  ]);

  let mostActiveStudent = null;
  if (activeStudentAgg.length > 0) {
    const userDoc = await User.findById(activeStudentAgg[0]._id).select('firstName lastName email');
    if (userDoc) {
      mostActiveStudent = {
        name: `${userDoc.firstName} ${userDoc.lastName}`,
        email: userDoc.email,
        totalMessages: activeStudentAgg[0].totalMsgs,
      };
    }
  }

  // Generate last 7 days date strings array [YYYY-MM-DD]
  const dates7Days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    dates7Days.push(d.toISOString().split('T')[0]);
  }

  // Student Registrations Per Day (last 7 days)
  const regAgg = await User.aggregate([
    { $match: { role: 'Student' } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);
  const regMap = Object.fromEntries(regAgg.map((r) => [r._id, r.count]));
  const registrationsByDay = dates7Days.map((date) => ({ date, count: regMap[date] || 0 }));

  // Document Uploads Per Day (last 7 days)
  const docAgg = await Document.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$uploadedAt' } },
        count: { $sum: 1 },
      },
    },
  ]);
  const docMap = Object.fromEntries(docAgg.map((r) => [r._id, r.count]));
  const uploadsByDay = dates7Days.map((date) => ({ date, count: docMap[date] || 0 }));

  // AI Conversations Per Day (last 7 days)
  const convAgg = await Conversation.aggregate([
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
  ]);
  const convMap = Object.fromEntries(convAgg.map((r) => [r._id, r.count]));
  const conversationsByDay = dates7Days.map((date) => ({ date, count: convMap[date] || 0 }));

  // Top 5 Most Active Students
  const topStudentsAgg = await Message.aggregate([
    {
      $lookup: {
        from: 'conversations',
        localField: 'conversationId',
        foreignField: '_id',
        as: 'conv',
      },
    },
    { $unwind: '$conv' },
    {
      $group: {
        _id: '$conv.userId',
        messages: { $sum: 1 },
      },
    },
    { $sort: { messages: -1 } },
    { $limit: 5 },
  ]);

  const topActiveStudents = await Promise.all(
    topStudentsAgg.map(async (item) => {
      const u = await User.findById(item._id).select('firstName lastName email');
      const convCount = await Conversation.countDocuments({ userId: item._id });
      return {
        name: u ? `${u.firstName} ${u.lastName}` : 'Student',
        email: u?.email || '',
        messages: item.messages,
        conversations: convCount,
      };
    })
  );

  return {
    totalConversations,
    totalMessages,
    avgMessagesPerConversation,
    mostActiveStudent,
    registrationsByDay,
    uploadsByDay,
    conversationsByDay,
    topActiveStudents,
  };
};
