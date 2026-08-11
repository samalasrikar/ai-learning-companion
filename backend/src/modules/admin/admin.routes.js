import express from 'express';
import {
  getDashboardStats,
  getRecentActivity,
  getAdminDocuments,
  deleteAdminDocument,
  getAdminChats,
  getAdminChatById,
  deleteAdminChat,
  getAdminAnalytics,
  getAdminRagStats,
  getAdminRagDebugInfo,
  reindexAdminDocument,
  deleteAdminDocumentVectors,
  rebuildAdminVectorStore,
} from './admin.controller.js';
import { authenticateUser, authorizeAdmin } from '../../middleware/auth.middleware.js';

const router = express.Router();

// Require authentication and Admin authorization for all admin endpoints
router.use(authenticateUser, authorizeAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/recent-activity', getRecentActivity);
router.get('/activity', getRecentActivity);
router.get('/documents', getAdminDocuments);
router.delete('/documents/:id', deleteAdminDocument);

// AI Chat Management endpoints
router.get('/chats', getAdminChats);
router.get('/chats/:conversationId', getAdminChatById);
router.delete('/chats/:conversationId', deleteAdminChat);

// Aggregated Analytics endpoint
router.get('/analytics', getAdminAnalytics);

// Admin RAG Management endpoints
router.get('/rag/stats', getAdminRagStats);
router.get('/rag/debug', getAdminRagDebugInfo);
router.post('/rag/reindex/:documentId', reindexAdminDocument);
router.delete('/rag/documents/:documentId', deleteAdminDocumentVectors);
router.post('/rag/rebuild', rebuildAdminVectorStore);

export default router;
