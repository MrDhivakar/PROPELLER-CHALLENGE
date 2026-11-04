import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireNotBlocked } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { TaskAssignment } from '../../models/TaskAssignment.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticateUser, requireNotBlocked);

async function loadAssignment(req) {
  const a = await TaskAssignment.findOne({ _id: req.params.id, userId: req.user._id }).populate('taskId');
  if (!a) throw ApiError.notFound('Assignment not found');
  if (a.taskId && a.taskId.publishStatus !== 'published') {
    throw ApiError.badRequest('Task no longer available');
  }
  return a;
}

router.post('/:id/accept', asyncHandler(async (req, res) => {
  const a = await loadAssignment(req);
  if (a.assignmentStatus !== 'offered') {
    throw ApiError.badRequest(`Cannot accept from status ${a.assignmentStatus}`);
  }
  a.assignmentStatus = 'accepted';
  a.respondedAt = new Date();
  await a.save();
  res.json({ success: true, data: { assignmentId: a._id, status: a.assignmentStatus } });
}));

const reasonSchema = z.object({ reason: z.string().trim().max(500).optional() });

router.post('/:id/skip', validate({ body: reasonSchema }), asyncHandler(async (req, res) => {
  const a = await loadAssignment(req);
  if (!['offered', 'accepted'].includes(a.assignmentStatus)) {
    throw ApiError.badRequest(`Cannot skip from status ${a.assignmentStatus}`);
  }
  a.assignmentStatus = 'skipped';
  a.respondedAt = new Date();
  if (req.body?.reason) a.skipReason = req.body.reason;
  await a.save();
  res.json({ success: true, data: { assignmentId: a._id, status: a.assignmentStatus } });
}));

router.post('/:id/decline', validate({ body: reasonSchema }), asyncHandler(async (req, res) => {
  const a = await loadAssignment(req);
  if (a.assignmentStatus !== 'offered') {
    throw ApiError.badRequest(`Cannot decline from status ${a.assignmentStatus}`);
  }
  a.assignmentStatus = 'declined';
  a.respondedAt = new Date();
  if (req.body?.reason) a.declineReason = req.body.reason;
  await a.save();
  res.json({ success: true, data: { assignmentId: a._id, status: a.assignmentStatus } });
}));

export default router;