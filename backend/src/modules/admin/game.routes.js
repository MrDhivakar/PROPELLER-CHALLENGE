import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { LocationGame } from '../../models/LocationGame.js';
import { GameParticipant } from '../../models/GameParticipant.js';
import { logAdminActivity } from '../../services/activityLog.js';

const router = Router();
router.use(authenticateAdmin);

// Create Game
router.post('/', asyncHandler(async (req, res) => {
  const game = await LocationGame.create({ ...req.body, createdBy: req.admin._id });
  await logAdminActivity({ adminId: req.admin._id, action: 'game.create', targetId: game._id });
  res.status(201).json({ success: true, data: { game } });
}));

// Get Live Participants for a game
router.get('/:id/live', asyncHandler(async (req, res) => {
  const participants = await GameParticipant.find({ gameId: req.params.id })
    .populate('userId', 'displayName email');
  res.json({ success: true, data: { participants } });
}));

export default router;
