import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { validate } from '../../middleware/validate.js';
import { User } from '../../models/User.js';
import { RefreshToken } from '../../models/RefreshToken.js';
import { logAdminActivity } from '../../services/activityLog.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticateAdmin);

const listSchema = z.object({
  status: z.enum(['active', 'paused', 'suspended', 'pending_deletion']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

router.get('/', validate({ query: listSchema }), asyncHandler(async (req, res) => {
  const { status, limit, skip } = req.validatedQuery;
  const q = status ? { accountStatus: status } : {};
  const [users, total] = await Promise.all([
    User.find(q).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(q),
  ]);
  res.json({ success: true, data: { total, users: users.map((u) => u.toSafeJSON()) } });
}));

const statusSchema = z.object({
  status: z.enum(['active', 'suspended']),
  note: z.string().max(500).optional(),
});

router.patch('/:id/status', validate({ body: statusSchema }), asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw ApiError.notFound('User not found');
  user.accountStatus = req.body.status;
  user.suspendedAt = req.body.status === 'suspended' ? new Date() : null;
  await user.save();
  if (req.body.status === 'suspended') {
    await RefreshToken.updateMany({ userId: user._id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  }
  await logAdminActivity({
    adminId: req.admin._id,
    action: 'user.status',
    targetType: 'User',
    targetId: user._id,
    metadata: { status: req.body.status, note: req.body.note },
    ip: req.ip,
  });
  res.json({ success: true, data: { user: user.toSafeJSON() } });
}));

export default router;