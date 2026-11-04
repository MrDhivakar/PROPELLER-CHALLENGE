import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateUser } from '../../middleware/auth.js';
import { requireNotBlocked } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { SafetyReport, REPORT_REASONS } from '../../models/SafetyReport.js';

const router = Router();
router.use(authenticateUser, requireNotBlocked);

const schema = z.object({
  taskId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  assignmentId: z.string().regex(/^[a-f\d]{24}$/i).optional(),
  reason: z.enum(REPORT_REASONS),
  details: z.string().trim().max(2000).optional(),
});

router.post('/', validate({ body: schema }), asyncHandler(async (req, res) => {
  const r = await SafetyReport.create({
    reportedBy: req.user._id,
    taskId: req.body.taskId ?? null,
    assignmentId: req.body.assignmentId ?? null,
    reason: req.body.reason,
    details: req.body.details ?? '',
  });
  res.status(201).json({ success: true, data: { reportId: r._id, status: r.status } });
}));

export default router;