import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { validate } from '../../middleware/validate.js';
import { TaskSubmission } from '../../models/TaskSubmission.js';
import { TaskAssignment } from '../../models/TaskAssignment.js';
import { notifyUser } from '../../services/notificationService.js';
import { logAdminActivity } from '../../services/activityLog.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticateAdmin);

const listSchema = z.object({
  status: z.enum(['submitted', 'under_review', 'accepted', 'returned']).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  skip: z.coerce.number().int().min(0).default(0),
});

router.get('/', validate({ query: listSchema }), asyncHandler(async (req, res) => {
  const { status, limit, skip } = req.validatedQuery;
  const q = status ? { status } : { status: { $in: ['submitted', 'under_review'] } };
  const [subs, total] = await Promise.all([
    TaskSubmission.find(q)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('taskId', 'title')
      .populate('userId', 'email displayName'),
    TaskSubmission.countDocuments(q),
  ]);
  res.json({ success: true, data: { total, submissions: subs } });
}));

const reviewSchema = z.object({
  decision: z.enum(['accepted', 'returned']),
  note: z.string().max(1000).optional(),
});

router.post('/:id/review', validate({ body: reviewSchema }), asyncHandler(async (req, res) => {
  const sub = await TaskSubmission.findById(req.params.id);
  if (!sub) throw ApiError.notFound('Submission not found');
  sub.status = req.body.decision;
  sub.reviewedBy = req.admin._id;
  sub.reviewedAt = new Date();
  sub.reviewNote = req.body.note ?? '';
  await sub.save();
  await TaskAssignment.updateOne({ _id: sub.assignmentId }, { $set: { assignmentStatus: 'reviewed' } });
  await notifyUser({
    userId: sub.userId,
    type: 'review_result',
    title: 'Review result',
    body: `Your submission was ${req.body.decision}`,
    data: { submissionId: sub._id.toString() },
  });
  await logAdminActivity({
    adminId: req.admin._id,
    action: `submission.${req.body.decision}`,
    targetType: 'TaskSubmission',
    targetId: sub._id,
    ip: req.ip,
  });
  res.json({ success: true, data: { submission: sub } });
}));

export default router;