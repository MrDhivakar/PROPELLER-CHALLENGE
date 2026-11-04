import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { AdminActivityLog } from '../../models/AdminActivityLog.js';

const router = Router();
router.use(authenticateAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 100, 200);
  const logs = await AdminActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('adminId', 'email');
  res.json({ success: true, data: { logs } });
}));

export default router;