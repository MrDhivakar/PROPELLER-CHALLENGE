import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { validate } from '../../middleware/validate.js';
import { SafetyReport } from '../../models/SafetyReport.js';
import { logAdminActivity } from '../../services/activityLog.js';
import { ApiError } from '../../utils/ApiError.js';

const router = Router();
router.use(authenticateAdmin);

router.get('/', asyncHandler(async (_req, res) => {
  const reports = await SafetyReport.find({ status: { $in: ['open', 'under_review'] } })
    .sort({ createdAt: -1 })
    .limit(100)
    .populate('taskId', 'title')
    .populate('reportedBy', 'email displayName');
  res.json({ success: true, data: { reports } });
}));

const resolveSchema = z.object({
  status: z.enum(['resolved', 'dismissed', 'under_review']),
  note: z.string().max(1000).optional(),
});

router.post('/:id/resolve', validate({ body: resolveSchema }), asyncHandler(async (req, res) => {
  const report = await SafetyReport.findById(req.params.id);
  if (!report) throw ApiError.notFound('Report not found');
  report.status = req.body.status;
  report.resolutionNote = req.body.note ?? '';
  report.reviewedBy = req.admin._id;
  report.reviewedAt = new Date();
  await report.save();
  await logAdminActivity({
    adminId: req.admin._id,
    action: `report.${req.body.status}`,
    targetType: 'SafetyReport',
    targetId: report._id,
    ip: req.ip,
  });
  res.json({ success: true, data: { report } });
}));

export default router;