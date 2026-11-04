import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { validate } from '../../middleware/validate.js';
import { Task, TASK_CATEGORIES, TASK_DIFFICULTIES } from '../../models/Task.js';
import { TaskAssignment } from '../../models/TaskAssignment.js';
import { User } from '../../models/User.js';
import { assertTaskSafe } from '../../services/safetyService.js';
import { logAdminActivity } from '../../services/activityLog.js';
import { notifyUser } from '../../services/notificationService.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticateAdmin);

const createSchema = z.object({
  title: z.string().trim().min(5).max(100),
  description: z.string().trim().min(20).max(2000),
  category: z.enum(TASK_CATEGORIES),
  difficulty: z.enum(TASK_DIFFICULTIES).default('gentle'),
  estimatedMinutes: z.number().int().min(1).max(120),
});

router.get('/', asyncHandler(async (_req, res) => {
  const tasks = await Task.find().sort({ createdAt: -1 }).limit(100).populate('createdBy', 'email');
  res.json({ success: true, data: { tasks } });
}));

router.post('/', validate({ body: createSchema }), asyncHandler(async (req, res) => {
  try { assertTaskSafe(req.body); }
  catch (e) { throw ApiError.badRequest(e.message); }
  const task = await Task.create({ ...req.body, createdBy: req.admin._id });
  await logAdminActivity({ adminId: req.admin._id, action: 'task.create', targetType: 'Task', targetId: task._id, ip: req.ip });
  res.status(201).json({ success: true, data: { task } });
}));

const updateSchema = createSchema.partial();

router.patch('/:id', validate({ body: updateSchema }), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  if (task.publishStatus === 'published') throw ApiError.badRequest('Cannot edit published task; archive first');
  Object.assign(task, req.body);
  if (task.safetyStatus === 'approved') task.safetyStatus = 'pending_review';
  await task.save();
  await logAdminActivity({ adminId: req.admin._id, action: 'task.update', targetType: 'Task', targetId: task._id, ip: req.ip });
  res.json({ success: true, data: { task } });
}));

const reviewSchema = z.object({ notes: z.string().max(1000).optional() });

router.post('/:id/submit-review', validate({ body: reviewSchema }), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  task.safetyStatus = 'pending_review';
  task.safetyNotes = req.body.notes ?? '';
  await task.save();
  await logAdminActivity({ adminId: req.admin._id, action: 'task.submit_review', targetType: 'Task', targetId: task._id, ip: req.ip });
  res.json({ success: true, data: { task } });
}));

router.post('/:id/approve', validate({ body: reviewSchema }), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  try { assertTaskSafe(task); }
  catch (e) { throw ApiError.badRequest(e.message); }
  task.safetyStatus = 'approved';
  task.safetyNotes = req.body.notes ?? '';
  task.reviewedBy = req.admin._id;
  task.reviewedAt = new Date();
  await task.save();
  await logAdminActivity({ adminId: req.admin._id, action: 'task.approve', targetType: 'Task', targetId: task._id, ip: req.ip });
  res.json({ success: true, data: { task } });
}));

router.post('/:id/reject', validate({ body: reviewSchema }), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  task.safetyStatus = 'rejected';
  task.safetyNotes = req.body.notes ?? '';
  task.reviewedBy = req.admin._id;
  task.reviewedAt = new Date();
  await task.save();
  await logAdminActivity({ adminId: req.admin._id, action: 'task.reject', targetType: 'Task', targetId: task._id, ip: req.ip });
  res.json({ success: true, data: { task } });
}));

const publishSchema = z.object({
  publishAt: z.string().datetime().optional(),
  expiresAt: z.string().datetime().optional(),
});

router.post('/:id/publish', validate({ body: publishSchema }), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  if (task.safetyStatus !== 'approved') throw ApiError.badRequest('Task is not safety-approved');
  if (req.body.publishAt) {
    task.publishStatus = 'scheduled';
    task.publishAt = new Date(req.body.publishAt);
  } else {
    task.publishStatus = 'published';
    task.publishAt = new Date();
  }
  if (req.body.expiresAt) task.expiresAt = new Date(req.body.expiresAt);
  await task.save();
  await logAdminActivity({ adminId: req.admin._id, action: 'task.publish', targetType: 'Task', targetId: task._id, ip: req.ip });
  res.json({ success: true, data: { task } });
}));

const assignSchema = z.object({
  userIds: z.array(z.string().regex(/^[a-f\d]{24}$/i)).optional(),
  allUsers: z.boolean().default(false),
  dueAt: z.string().datetime().optional(),
});

router.post('/:id/assign', validate({ body: assignSchema }), asyncHandler(async (req, res) => {
  const task = await Task.findById(req.params.id);
  if (!task) throw ApiError.notFound('Task not found');
  if (task.publishStatus !== 'published') throw ApiError.badRequest('Only published tasks can be assigned');

  let userIds = req.body.userIds ?? [];
  if (req.body.allUsers) {
    const all = await User.find({ accountStatus: 'active' }).select('_id');
    userIds = all.map((u) => u._id.toString());
  }
  if (userIds.length === 0) throw ApiError.badRequest('No users to assign');

  const dueAt = req.body.dueAt ? new Date(req.body.dueAt) : null;
  let created = 0;

  for (const uid of userIds) {
    try {
      await TaskAssignment.create({ taskId: task._id, userId: uid, assignedBy: req.admin._id, dueAt });
      created++;
      await notifyUser({
        userId: uid,
        type: 'new_task',
        title: 'New task available',
        body: task.title,
        data: { taskId: task._id.toString() },
      });
    } catch {
      // Duplicate assignment or invalid user — skip.
    }
  }

  await logAdminActivity({
    adminId: req.admin._id,
    action: 'task.assign',
    targetType: 'Task',
    targetId: task._id,
    metadata: { created },
    ip: req.ip,
  });

  res.json({ success: true, data: { assigned: created } });
}));

export default router;