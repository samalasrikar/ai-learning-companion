import asyncHandler from 'express-async-handler';
import {
  getDashboardStatsService,
  getRecentActivityService,
  getAdminDocumentsService,
  deleteAdminDocumentService,
  getAdminChatsService,
  getAdminChatByIdService,
  deleteAdminChatService,
  getAdminAnalyticsService,
} from '../../services/admin.service.js';
import {
  getSettingsService,
  updateSettingsService,
  getSystemStatusService,
  getStorageUsageService,
  getLoginStatsService,
  maintenanceClearCacheService,
  maintenanceReindexService,
  getNotificationsService,
  markNotificationReadService,
  exportDataService,
  globalSearchService,
} from '../../services/systemAdmin.service.js';
import { getActivityLogsService, logActivity } from '../../services/activityLog.service.js';

export const getDashboardStats = asyncHandler(async (req, res) => {
  const stats = await getDashboardStatsService();
  res.status(200).json({ success: true, ...stats });
});

export const getRecentActivity = asyncHandler(async (req, res) => {
  const activities = await getRecentActivityService();
  res.status(200).json({ success: true, count: activities.length, activities });
});

export const getAdminDocuments = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const documents = await getAdminDocumentsService(search);
  res.status(200).json({ success: true, count: documents.length, documents });
});

export const deleteAdminDocument = asyncHandler(async (req, res) => {
  const doc = await deleteAdminDocumentService(req.params.id);
  await logActivity({
    userId: req.user?._id,
    userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
    role: 'Admin',
    action: 'Admin deleted document',
    targetResource: doc.originalName || req.params.id,
  });
  res.status(200).json({ success: true, message: 'Document deleted successfully' });
});

export const getAdminChats = asyncHandler(async (req, res) => {
  const { search, filter } = req.query;
  const conversations = await getAdminChatsService(search, filter);
  res.status(200).json({ success: true, count: conversations.length, conversations });
});

export const getAdminChatById = asyncHandler(async (req, res) => {
  const conversation = await getAdminChatByIdService(req.params.conversationId);
  res.status(200).json({ success: true, conversation });
});

export const deleteAdminChat = asyncHandler(async (req, res) => {
  const conv = await deleteAdminChatService(req.params.conversationId);
  await logActivity({
    userId: req.user?._id,
    userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
    role: 'Admin',
    action: 'Admin deleted conversation',
    targetResource: conv.title || req.params.conversationId,
  });
  res.status(200).json({ success: true, message: 'AI conversation deleted successfully' });
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getAdminAnalyticsService();
  res.status(200).json({ success: true, analytics });
});

// Phase 3 Endpoints
export const getSettings = asyncHandler(async (req, res) => {
  const settings = await getSettingsService();
  res.status(200).json({ success: true, settings });
});

export const updateSettings = asyncHandler(async (req, res) => {
  const settings = await updateSettingsService(req.body);
  await logActivity({
    userId: req.user?._id,
    userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
    role: 'Admin',
    action: 'Admin changed settings',
    targetResource: 'Application Settings',
  });
  res.status(200).json({ success: true, settings, message: 'Settings updated successfully' });
});

export const getSystemStatus = asyncHandler(async (req, res) => {
  const status = await getSystemStatusService();
  res.status(200).json({ success: true, status });
});

export const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await getActivityLogsService(req.query);
  res.status(200).json({ success: true, count: logs.length, logs });
});

export const getStorageUsage = asyncHandler(async (req, res) => {
  const storage = await getStorageUsageService();
  res.status(200).json({ success: true, storage });
});

export const getLoginStats = asyncHandler(async (req, res) => {
  const { search } = req.query;
  const stats = await getLoginStatsService(search);
  res.status(200).json({ success: true, ...stats });
});

export const maintenanceClearCache = asyncHandler(async (req, res) => {
  const result = await maintenanceClearCacheService();
  await logActivity({
    userId: req.user?._id,
    userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
    role: 'Admin',
    action: 'Executed maintenance clear-cache',
  });
  res.status(200).json({ success: true, ...result });
});

export const maintenanceReindex = asyncHandler(async (req, res) => {
  const result = await maintenanceReindexService();
  await logActivity({
    userId: req.user?._id,
    userName: req.user ? `${req.user.firstName} ${req.user.lastName}` : 'Admin',
    role: 'Admin',
    action: 'Executed maintenance reindex',
  });
  res.status(200).json({ success: true, ...result });
});

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await getNotificationsService();
  res.status(200).json({ success: true, notifications });
});

export const markNotificationRead = asyncHandler(async (req, res) => {
  const notification = await markNotificationReadService(req.params.id);
  res.status(200).json({ success: true, notification });
});

export const exportData = asyncHandler(async (req, res) => {
  const { type = 'students', format = 'json' } = req.query;
  const data = await exportDataService(type);
  res.status(200).json({ success: true, type, format, data });
});

export const globalSearch = asyncHandler(async (req, res) => {
  const { q } = req.query;
  const results = await globalSearchService(q);
  res.status(200).json({ success: true, results });
});

// ──────────────────────────────────────────────
// Admin RAG Management Handlers
// ──────────────────────────────────────────────
import {
  getRagStatsService,
  getRagDebugInfoService,
  reindexDocumentRagService,
  deleteDocumentVectorsRagService,
  rebuildVectorStoreRagService,
} from '../../services/ragClient.service.js';

export const getAdminRagStats = asyncHandler(async (req, res) => {
  const stats = await getRagStatsService();
  res.status(200).json({
    success: true,
    ...stats,
  });
});

export const getAdminRagDebugInfo = asyncHandler(async (req, res) => {
  const info = await getRagDebugInfoService();
  res.status(200).json({
    success: true,
    ...info,
  });
});

export const reindexAdminDocument = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const result = await reindexDocumentRagService(documentId);
  res.status(200).json({
    success: true,
    ...result,
  });
});

export const deleteAdminDocumentVectors = asyncHandler(async (req, res) => {
  const { documentId } = req.params;
  const result = await deleteDocumentVectorsRagService(documentId);
  res.status(200).json({
    success: true,
    ...result,
  });
});

export const rebuildAdminVectorStore = asyncHandler(async (req, res) => {
  const result = await rebuildVectorStoreRagService();
  res.status(200).json({
    success: true,
    ...result,
  });
});
