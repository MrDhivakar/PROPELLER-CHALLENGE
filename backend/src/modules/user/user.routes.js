import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { BlockedUser } from '../../models/BlockedUser.js';
import { RefreshToken } from '../../models/RefreshToken.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticateUser);

router.get('/', (req, res) => {
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
});

const patchSchema = z.object({
  displayName: z.string().trim().min(2).max(50).optional(),
  timezone: z.string().min(1).max(64).optional(),
  notificationPrefs: z
    .object({
      newTask: z.boolean().optional(),
      reminder: z.boolean().optional(),
      reviewResult: z.boolean().optional(),
      security: z.boolean().optional(),
    })
    .optional(),
});

router.patch('/', validate({ body: patchSchema }), asyncHandler(async (req, res) => {
  const { displayName, timezone, notificationPrefs } = req.body;
  if (displayName !== undefined) req.user.displayName = displayName;
  if (timezone !== undefined) req.user.timezone = timezone;
  if (notificationPrefs) {
    for (const [k, v] of Object.entries(notificationPrefs)) {
      if (v !== undefined) req.user.notificationPrefs[k] = v;
    }
  }
  await req.user.save();
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
}));

router.post('/pause', asyncHandler(async (req, res) => {
  if (req.user.accountStatus !== 'active') throw ApiError.badRequest('Only active accounts can be paused');
  req.user.accountStatus = 'paused';
  req.user.pausedAt = new Date();
  await req.user.save();
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
}));

router.post('/resume', asyncHandler(async (req, res) => {
  if (req.user.accountStatus !== 'paused') throw ApiError.badRequest('Account is not paused');
  req.user.accountStatus = 'active';
  req.user.pausedAt = null;
  await req.user.save();
  res.json({ success: true, data: { user: req.user.toSafeJSON() } });
}));

router.post('/block', asyncHandler(async (req, res) => {
  const existing = await BlockedUser.findOne({ userId: req.user._id, unblockedAt: null });
  if (existing) {
    return res.json({ success: true, data: { blocked: true, already: true } });
  }
  await BlockedUser.create({ userId: req.user._id, reasonCategory: 'user_request', blockedBy: null });
  res.json({ success: true, data: { blocked: true } });
}));

router.post('/unblock', asyncHandler(async (req, res) => {
  await BlockedUser.updateMany(
    { userId: req.user._id, unblockedAt: null },
    { $set: { unblockedAt: new Date() } }
  );
  res.json({ success: true, data: { blocked: false } });
}));

router.delete('/', asyncHandler(async (req, res) => {
  req.user.accountStatus = 'pending_deletion';
  req.user.deletedAt = new Date();
  await req.user.save();
  await RefreshToken.updateMany(
    { userId: req.user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
  res.json({ success: true, data: { pendingDeletion: true, graceDays: 30 } });
}));

export default router;