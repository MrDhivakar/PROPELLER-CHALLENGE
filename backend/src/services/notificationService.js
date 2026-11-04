import { Notification } from '../models/Notification.js';
import { User } from '../models/User.js';

const PREF_MAP = {
  new_task: 'newTask',
  reminder: 'reminder',
  review_result: 'reviewResult',
  security: 'security',
};

// In-app notification always respects preferences. Security alerts cannot be fully disabled.
export async function notifyUser({ userId, type, title, body, data = {} }) {
  const user = await User.findById(userId);
  if (!user) return null;

  const prefKey = PREF_MAP[type];
  const prefs = user.notificationPrefs || {};
  if (prefKey && type !== 'security' && prefs[prefKey] === false) {
    return null;
  }

  const notif = await Notification.create({ userId, type, title, body, data });

  // FCM push delivery is configured in Phase 8. This is an explicit no-op until then.
  if (user.fcmTokens && user.fcmTokens.length > 0) {
    // FCM send would happen here once Firebase Admin SDK is wired in Phase 8.
  }

  return notif;
}