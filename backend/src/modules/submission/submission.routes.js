import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireNotBlocked } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { TaskAssignment } from '../../models/TaskAssignment.js';
import { TaskSubmission } from '../../models/TaskSubmission.js';
import { assertTaskSafe } from '../../services/safetyService.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticateUser, requireNotBlocked);

const submitSchema = z
  .object({
    textResponse: z.string().trim().max(5000).optional(),
    imageUrls: z.array(z.string().url()).max(6).optional(),
  })
  .refine(
    (d) =>
      (d.textResponse && d.textResponse.length > 0) ||
      (d.imageUrls && d.imageUrls.length > 0),
    { message: 'Submission requires text or at least one image' }
  );

router.post('/assignments/:id/submissions', validate({ body: submitSchema }), asyncHandler(async (req, res) => {
  const a = await TaskAssignment.findOne({ _id: req.params.id, userId: req.user._id });
  if (!a) throw ApiError.notFound('Assignment not found');
  if (a.assignmentStatus !== 'accepted') throw ApiError.badRequest('Accept the task before submitting');
  const existing = await TaskSubmission.findOne({ assignmentId: a._id });
  if (existing) throw ApiError.conflict('Submission already exists for this assignment');

  // Safety check on user-generated text.
  if (req.body.textResponse) {
    try { assertTaskSafe({ title: '', description: req.body.textResponse }); }
    catch (e) { throw ApiError.badRequest(e.message); }
  }

  const sub = await TaskSubmission.create({
    assignmentId: a._id,
    userId: req.user._id,
    taskId: a.taskId,
    textResponse: req.body.textResponse ?? '',
    imageUrls: req.body.imageUrls ?? [],
  });
  a.assignmentStatus = 'submitted';
  a.respondedAt = new Date();
  await a.save();
  res.status(201).json({ success: true, data: { submissionId: sub._id, status: sub.status } });
}));

router.get('/me/submissions', asyncHandler(async (req, res) => {
  const list = await TaskSubmission.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('taskId', 'title category difficulty');
  res.json({
    success: true,
    data: {
      submissions: list.map((s) => ({
        id: s._id,
        status: s.status,
        createdAt: s.createdAt,
        reviewedAt: s.reviewedAt,
        reviewNote: s.reviewNote,
        task: s.taskId && {
          id: s.taskId._id,
          title: s.taskId.title,
          category: s.taskId.category,
        },
      })),
    },
  });
}));

export default router;