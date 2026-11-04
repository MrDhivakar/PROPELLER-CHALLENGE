import { Router } from 'express';
import healthRoutes from '../modules/health/health.routes.js';
import authRoutes from '../modules/auth/auth.routes.js';
import adminAuthRoutes from '../modules/admin/auth/adminAuth.routes.js';
import userRoutes from '../modules/user/user.routes.js';
import taskRoutes from '../modules/task/task.routes.js';
import assignmentRoutes from '../modules/assignment/assignment.routes.js';
import submissionRoutes from '../modules/submission/submission.routes.js';
import reportRoutes from '../modules/report/report.routes.js';
import adminDashboardRoutes from '../modules/admin/dashboard.routes.js';
import adminUsersRoutes from '../modules/admin/users.routes.js';
import adminTasksRoutes from '../modules/admin/tasks.routes.js';
import adminSubmissionsRoutes from '../modules/admin/submissions.routes.js';
import adminReportsRoutes from '../modules/admin/reports.routes.js';
import adminLogsRoutes from '../modules/admin/logs.routes.js';
import adminGameRoutes from '../modules/admin/game.routes.js'; // NEW IMPORT

const router = Router();

router.use('/health', healthRoutes);
router.use('/auth', authRoutes);
router.use('/admin/auth', adminAuthRoutes);
router.use('/me', userRoutes);
router.use('/tasks', taskRoutes);
router.use('/assignments', assignmentRoutes);
router.use('/submissions', submissionRoutes);
router.use('/reports', reportRoutes);
router.use('/admin/dashboard', adminDashboardRoutes);
router.use('/admin/users', adminUsersRoutes);
router.use('/admin/tasks', adminTasksRoutes);
router.use('/admin/submissions', adminSubmissionsRoutes);
router.use('/admin/reports', adminReportsRoutes);
router.use('/admin/logs', adminLogsRoutes);
router.use('/admin/games', adminGameRoutes); // NEW ROUTE

export default router;
