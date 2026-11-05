import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { LocationGame } from '../../models/LocationGame.js';
import { GameParticipant } from '../../models/GameParticipant.js';
import { UserCard } from '../../models/UserCard.js';
import { Card } from '../../models/Card.js';
import { logAdminActivity } from '../../services/activityLog.js';

const router = Router();
router.use(authenticateAdmin);

// --- CARDS MANAGEMENT ---
router.get('/cards', asyncHandler(async (req, res) => {
  const cards = await Card.find().sort({ level: 1 });
  res.json({ success: true, data: { cards } });
}));

router.post('/cards', asyncHandler(async (req, res) => {
  const existing = await Card.findOne({ cardId: req.body.cardId });
  if (existing) return res.status(400).json({ success: false, error: { message: "Card ID already exists" } });
  const card = await Card.create(req.body);
  res.status(201).json({ success: true, data: { card } });
}));

// --- GAMES MANAGEMENT ---
router.post('/', asyncHandler(async (req, res) => {
  const game = await LocationGame.create({ ...req.body, createdBy: req.admin._id, status: 'live' });
  await logAdminActivity({ adminId: req.admin._id, action: 'game.create', targetId: game._id });
  res.status(201).json({ success: true, data: { game } });
}));

router.get('/', asyncHandler(async (req, res) => {
  const games = await LocationGame.find().populate('rewardCardId');
  res.json({ success: true, data: { games } });
}));

// Get Live Participants & Locations
router.get('/:id/live', asyncHandler(async (req, res) => {
  const participants = await GameParticipant.find({ gameId: req.params.id })
    .populate('userId', 'displayName email');
  res.json({ success: true, data: { participants } });
}));

// Declare Winner (Adds card to user)
router.post('/:id/winner', asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const participant = await GameParticipant.findById(participantId);
  if (!participant) return res.status(404).json({ success: false, error: { message: "Participant not found" } });

  const game = await LocationGame.findById(participant.gameId);
  if (!game) return res.status(404).json({ success: false, error: { message: "Game not found" } });

  participant.isWinner = true;
  participant.status = 'winner';
  await participant.save();

  // Add reward card to user's inventory
  await UserCard.findOneAndUpdate(
    { userId: participant.userId, cardId: game.rewardCardId },
    { $inc: { quantity: 1 } },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: { message: "Winner declared and card added!" } });
}));

export default router;
