import { AdminActivityLog } from '../models/AdminActivityLog.js';

// Never throw from logging — audit must not break request handling.
export async function logAdminActivity({
  adminId,
  action,
  targetType = null,
  targetId = null,
  metadata = {},
  ip = null,
}) {
  try {
    await AdminActivityLog.create({ adminId, action, targetType, targetId, metadata, ip });
  } catch (err) {
    console.error('[activityLog] failed:', err.message);
  }
}