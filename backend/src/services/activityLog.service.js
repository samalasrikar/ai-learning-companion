import ActivityLog from '../models/activityLog.model.js';

/**
 * Log immutable system activity event.
 */
export const logActivity = async ({ userId, userName, role, action, targetResource, ipAddress }) => {
  try {
    await ActivityLog.create({
      userId,
      userName: userName || 'System User',
      role: role || 'System',
      action,
      targetResource: targetResource || '',
      ipAddress: ipAddress || '127.0.0.1',
    });
  } catch (err) {
    console.error('Failed to create activity log:', err);
  }
};

/**
 * Fetch activity logs with search and filter parameters.
 */
export const getActivityLogsService = async ({ search = '', action = '', user = '', date = '' }) => {
  let query = {};

  if (action && action !== 'all') {
    query.action = { $regex: action, $options: 'i' };
  }

  if (user) {
    query.userName = { $regex: user, $options: 'i' };
  }

  if (date) {
    const start = new Date(date);
    const end = new Date(date);
    end.setDate(end.getDate() + 1);
    query.timestamp = { $gte: start, $lt: end };
  }

  let logs = await ActivityLog.find(query).sort({ timestamp: -1 }).limit(100);

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(
      (l) =>
        l.userName.toLowerCase().includes(q) ||
        l.action.toLowerCase().includes(q) ||
        l.targetResource.toLowerCase().includes(q) ||
        l.role.toLowerCase().includes(q)
    );
  }

  return logs;
};
