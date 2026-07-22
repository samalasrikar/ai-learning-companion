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
  getSettings,
  updateSettings,
  getSystemStatus,
  getActivityLogs,
  getStorageUsage,
  getLoginStats,
  maintenanceClearCache,
  maintenanceReindex,
  getNotifications,
  markNotificationRead,
  exportData,
  globalSearch,
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

// Phase 3 Endpoints
router.get('/settings', getSettings);
router.patch('/settings', updateSettings);
router.get('/system-status', getSystemStatus);
router.get('/activity-logs', getActivityLogs);
router.get('/storage', getStorageUsage);
router.get('/login-stats', getLoginStats);
router.post('/maintenance/clear-cache', maintenanceClearCache);
router.post('/maintenance/reindex', maintenanceReindex);
router.get('/notifications', getNotifications);
router.patch('/notifications/:id/read', markNotificationRead);
router.get('/export', exportData);
router.get('/search', globalSearch);

export default router;
