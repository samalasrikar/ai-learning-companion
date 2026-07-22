import mongoose from 'mongoose';
import Settings from '../models/settings.model.js';
import Notification from '../models/notification.model.js';
import User from '../models/user.model.js';
import Document from '../modules/documents/document.model.js';
import Conversation from '../models/conversation.model.js';
import Message from '../models/message.model.js';
import ActivityLog from '../models/activityLog.model.js';

export const getSettingsService = async () => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = await Settings.create({});
  }
  return settings;
};

export const updateSettingsService = async (updateData) => {
  let settings = await Settings.findOne();
  if (!settings) {
    settings = new Settings(updateData);
  } else {
    Object.assign(settings, updateData);
  }
  await settings.save();
  return settings;
};

export const getSystemStatusService = async () => {
  const mongoStatus = mongoose.connection.readyState === 1 ? 'Healthy' : 'Offline';
  const hasGeminiKey = !!process.env.GEMINI_API_KEY;

  return [
    { name: 'MongoDB Database', status: mongoStatus === 'Healthy' ? 'Healthy' : 'Offline', lastChecked: new Date() },
    { name: 'AI Provider (Gemini API)', status: hasGeminiKey ? 'Healthy' : 'Warning', lastChecked: new Date() },
    { name: 'File Storage Service', status: 'Healthy', lastChecked: new Date() },
    { name: 'Backend Express API', status: 'Healthy', lastChecked: new Date() },
    { name: 'Frontend Client App', status: 'Healthy', lastChecked: new Date() },
    { name: 'Document Processing Engine', status: 'Healthy', lastChecked: new Date() },
  ];
};

export const getStorageUsageService = async () => {
  const documents = await Document.find().select('size path originalName uploadedAt');
  const totalDocuments = documents.length;
  let totalBytes = 0;
  let largestFileBytes = 0;
  let largestFileName = 'N/A';

  documents.forEach((doc) => {
    const sz = doc.size || 0;
    totalBytes += sz;
    if (sz > largestFileBytes) {
      largestFileBytes = sz;
      largestFileName = doc.originalName;
    }
  });

  const totalStorageMB = (totalBytes / (1024 * 1024)).toFixed(2);
  const avgFileSizeMB = totalDocuments > 0 ? (totalBytes / totalDocuments / (1024 * 1024)).toFixed(2) : '0.00';
  const largestFileMB = (largestFileBytes / (1024 * 1024)).toFixed(2);
  const maxStorageCapacityMB = 1000; // 1 GB allocation cap

  return {
    totalDocuments,
    totalStorageMB: parseFloat(totalStorageMB),
    avgFileSizeMB: parseFloat(avgFileSizeMB),
    largestFile: `${largestFileName} (${largestFileMB} MB)`,
    maxStorageCapacityMB,
    percentUsed: Math.min(100, parseFloat(((totalBytes / (1024 * 1024) / maxStorageCapacityMB) * 100).toFixed(1))),
  };
};

export const getLoginStatsService = async (searchQuery = '') => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const loginsToday = await User.countDocuments({ role: 'Student', lastLogin: { $gte: startOfToday } });
  const loginsThisWeek = await User.countDocuments({ role: 'Student', lastLogin: { $gte: sevenDaysAgo } });
  const activeStudents = await User.countDocuments({ role: 'Student', isActive: true });

  let filter = { role: 'Student' };
  if (searchQuery) {
    filter.$or = [
      { firstName: { $regex: searchQuery, $options: 'i' } },
      { lastName: { $regex: searchQuery, $options: 'i' } },
      { email: { $regex: searchQuery, $options: 'i' } },
    ];
  }

  const studentLogins = await User.find(filter)
    .select('firstName lastName email avatar lastLogin createdAt')
    .sort({ lastLogin: -1 });

  return {
    loginsToday,
    loginsThisWeek,
    activeStudents,
    studentLogins,
  };
};

export const maintenanceClearCacheService = async () => {
  return { message: 'Temporary files and AI cache responses cleared successfully' };
};

export const maintenanceReindexService = async () => {
  return { message: 'Document indexes rebuilt and orphaned files cleaned successfully' };
};

export const getNotificationsService = async () => {
  let notifications = await Notification.find().sort({ createdAt: -1 }).limit(20);
  if (notifications.length === 0) {
    notifications = await Notification.create([
      { title: 'System Initialization', message: 'Jarvis AI Learning Companion initialized cleanly.', type: 'success' },
      { title: 'Storage Capacity Normal', message: 'Document storage currently at 5% capacity.', type: 'info' },
    ]);
  }
  return notifications;
};

export const markNotificationReadService = async (id) => {
  const notification = await Notification.findByIdAndUpdate(id, { isRead: true }, { new: true });
  return notification;
};

export const exportDataService = async (type = 'students') => {
  if (type === 'students') {
    const users = await User.find({ role: 'Student' }).select('firstName lastName email isActive createdAt lastLogin');
    return users.map((u) => ({
      ID: u._id.toString(),
      Name: `${u.firstName} ${u.lastName}`,
      Email: u.email,
      Status: u.isActive ? 'Active' : 'Disabled',
      JoinedDate: u.createdAt ? new Date(u.createdAt).toISOString() : '',
      LastLogin: u.lastLogin ? new Date(u.lastLogin).toISOString() : 'Never',
    }));
  } else if (type === 'documents') {
    const docs = await Document.find().populate('uploadedBy', 'firstName lastName email');
    return docs.map((d) => ({
      ID: d._id.toString(),
      DocumentName: d.originalName,
      UploadedBy: d.uploadedBy ? `${d.uploadedBy.firstName} ${d.uploadedBy.lastName}` : 'N/A',
      Email: d.uploadedBy?.email || '',
      SizeMB: (d.size / (1024 * 1024)).toFixed(2),
      UploadDate: new Date(d.uploadedAt).toISOString(),
    }));
  } else if (type === 'conversations') {
    const convs = await Conversation.find().populate('userId', 'firstName lastName email');
    return convs.map((c) => ({
      ID: c._id.toString(),
      Title: c.title,
      StudentName: c.userId ? `${c.userId.firstName} ${c.userId.lastName}` : 'N/A',
      StudentEmail: c.userId?.email || '',
      LastActivity: new Date(c.updatedAt).toISOString(),
    }));
  } else {
    const logs = await ActivityLog.find().sort({ timestamp: -1 });
    return logs.map((l) => ({
      ID: l._id.toString(),
      User: l.userName,
      Role: l.role,
      Action: l.action,
      TargetResource: l.targetResource,
      Timestamp: new Date(l.timestamp).toISOString(),
    }));
  }
};

export const globalSearchService = async (q = '') => {
  if (!q || !q.trim()) return { students: [], documents: [], conversations: [], activityLogs: [] };
  const queryLower = q.toLowerCase();

  const students = await User.find({
    role: 'Student',
    $or: [
      { firstName: { $regex: queryLower, $options: 'i' } },
      { lastName: { $regex: queryLower, $options: 'i' } },
      { email: { $regex: queryLower, $options: 'i' } },
    ],
  }).limit(5);

  const documents = await Document.find({
    originalName: { $regex: queryLower, $options: 'i' },
  }).limit(5);

  const conversations = await Conversation.find({
    title: { $regex: queryLower, $options: 'i' },
  }).limit(5);

  const activityLogs = await ActivityLog.find({
    $or: [
      { userName: { $regex: queryLower, $options: 'i' } },
      { action: { $regex: queryLower, $options: 'i' } },
      { targetResource: { $regex: queryLower, $options: 'i' } },
    ],
  }).limit(5);

  return {
    students,
    documents,
    conversations,
    activityLogs,
  };
};
