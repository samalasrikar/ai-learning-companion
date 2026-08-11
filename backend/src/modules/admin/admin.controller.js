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
  await deleteAdminDocumentService(req.params.id);
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
  await deleteAdminChatService(req.params.conversationId);
  res.status(200).json({ success: true, message: 'AI conversation deleted successfully' });
});

export const getAdminAnalytics = asyncHandler(async (req, res) => {
  const analytics = await getAdminAnalyticsService();
  res.status(200).json({ success: true, analytics });
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
