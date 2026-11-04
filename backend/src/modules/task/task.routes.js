import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireNotBlocked } from '../../middleware/authorize.js';
import { Task } from '../../models/Task.js';
import { TaskAssignment } from '../../models/TaskAssignment.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticateUser, requireNotBlocked);

router.get('/today', asyncHandler(async (req, res) => {
  if (req.user.accountStatus === 'paused') {
    return res.json({ success: true, data: { paused: true, assignments: [] } });
  }
  const now = new Date();
  const assignments = await TaskAssignment.find({
    userId: req.user._id,
    assignmentStatus: { $in: ['offered', 'accepted'] },
  })
    .sort({ offeredAt: -1 })
    .limit(20)
    .populate('taskId');

  const visible = assignments.filter(
    (a) =>
      a.taskId &&
      a.taskId.publishStatus === 'published' &&
      (!a.taskId.expiresAt || a.taskId.expiresAt > now)
  );

  res.json({
    success: true,
    data: {
      paused: false,
      assignments: visible.map((a) => ({
        id: a._id,
        status: a.assignmentStatus,
        offeredAt: a.offeredAt,
        dueAt: a.dueAt,
        task: {
          id: a.taskId._id,
          title: a.taskId.title,
          description: a.taskId.description,
          category: a.taskId.category,
          difficulty: a.taskId.difficulty,
          estimatedMinutes: a.taskId.estimatedMinutes,
          expiresAt: a.taskId.expiresAt,
        },
      })),
    },
  });
}));

router.get('/:taskId', asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.taskId);
  if (!task || task.publishStatus !== 'published') throw ApiError.notFound('Task not found');
  const assignment = await TaskAssignment.findOne({ taskId: task._id, userId: req.user._id });
  if (!assignment) throw ApiError.forbidden('Task not assigned to you');
  res.json({
    success: true,
    data: {
      task: {
        id: task._id,
        title: task.title,
        description: task.description,
        category: task.category,
        difficulty: task.difficulty,
        estimatedMinutes: task.estimatedMinutes,
        expiresAt: task.expiresAt,
      },
      assignment: {
        id: assignment._id,
        status: assignment.assignmentStatus,
        offeredAt: assignment.offeredAt,
        dueAt: assignment.dueAt,
      },
    },
  });
}));

export default router;