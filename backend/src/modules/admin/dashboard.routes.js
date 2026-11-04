import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { User } from '../../models/User.js';
import { Task } from '../../models/Task.js';
import { TaskSubmission } from '../../models/TaskSubmission.js';
import { SafetyReport } from '../../models/SafetyReport.js';
import { AdminActivityLog } from '../../models/AdminActivityLog.js';

const router = Router();
router.use(authenticateAdmin);

router.get('/', asyncHandler(async (_req, res) => {
  const [users, publishedTasks, pendingSubmissions, openReports, recentActivity] = await Promise.all([
    User.countDocuments(),
    Task.countDocuments({ publishStatus: 'published' }),
    TaskSubmission.countDocuments({ status: 'submitted' }),
    SafetyReport.countDocuments({ status: 'open' }),
    AdminActivityLog.find().sort({ createdAt: -1 }).limit(10).populate('adminId', 'email'),
  ]);
  res.json({
    success: true,
    data: { users, publishedTasks, pendingSubmissions, openReports, recentActivity },
  });
}));

export default router;