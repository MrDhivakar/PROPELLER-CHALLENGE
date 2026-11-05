import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateAdmin } from '../../middleware/adminAuth.js';
import { LocationGame } from '../../models/LocationGame.js';
import { GameParticipant } from '../../models/GameParticipant.js';
import { UserCard } from '../../models/UserCard.js';
import { Card } from '../../models/Card.js';

const router = Router();
router.use(authenticateAdmin);

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

router.post('/', asyncHandler(async (req, res) => {
  const { durationMinutes, startTime } = req.body;
  // Auto Calculate End Time based on duration
  const endTime = new Date(new Date(startTime).getTime() + durationMinutes * 60000);
  
  const game = await LocationGame.create({ 
    ...req.body, 
    endTime, 
    createdBy: req.admin._id,
    status: new Date(startTime) > new Date() ? 'upcoming' : 'live'
  });
  res.status(201).json({ success: true, data: { game } });
}));

router.get('/', asyncHandler(async (req, res) => {
  const games = await LocationGame.find().populate('rewardCardId');
  res.json({ success: true, data: { games } });
}));

router.get('/:id/live', asyncHandler(async (req, res) => {
  const participants = await GameParticipant.find({ gameId: req.params.id })
    .populate('userId', 'displayName email');
  res.json({ success: true, data: { participants } });
}));

// Declare Winner
router.post('/:id/winner', asyncHandler(async (req, res) => {
  const { participantId } = req.body;
  const participant = await GameParticipant.findById(participantId);
  const game = await LocationGame.findById(participant.gameId);

  participant.isWinner = true;
  participant.status = 'winner';
  await participant.save();

  // Save winner to game and end it
  game.winnerId = participant.userId;
  game.status = 'ended';
  await game.save();

  // Give Card
  await UserCard.findOneAndUpdate(
    { userId: participant.userId, cardId: game.rewardCardId },
    { $inc: { quantity: 1 } },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: { message: "Winner declared!" } });
}));

export default router;
