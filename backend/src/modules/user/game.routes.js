import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateUser } from '../../middleware/auth.js';
import { LocationGame } from '../../models/LocationGame.js';
import { GameParticipant } from '../../models/GameParticipant.js';
import { UserCard } from '../../models/UserCard.js';
import { Card } from '../../models/Card.js';

const router = Router();
router.use(authenticateUser);

// Get active/upcoming games
router.get('/', asyncHandler(async (req, res) => {
  const games = await LocationGame.find({ status: { $in: ['upcoming', 'live'] } }).populate('rewardCardId');
  res.json({ success: true, data: { games } });
}));

// Accept game
router.post('/:id/accept', asyncHandler(async (req, res) => {
  let participant = await GameParticipant.findOne({ gameId: req.params.id, userId: req.user._id });
  if (!participant) {
    participant = await GameParticipant.create({ gameId: req.params.id, userId: req.user._id });
  }
  res.json({ success: true, data: { participant } });
}));

// Update live location (called by Android periodically)
router.post('/:id/location', asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  await GameParticipant.updateOne(
    { gameId: req.params.id, userId: req.user._id },
    { liveLocation: { type: 'Point', coordinates: [lng, lat] } }
  );
  res.json({ success: true });
}));

// Submit answer
router.post('/:id/submit', asyncHandler(async (req, res) => {
  const { answer } = req.body;
  await GameParticipant.updateOne(
    { gameId: req.params.id, userId: req.user._id },
    { submittedAnswer: answer, status: 'submitted' }
  );
  res.json({ success: true });
}));

// Get User's Cards
router.get('/my-cards', asyncHandler(async (req, res) => {
  const cards = await UserCard.find({ userId: req.user._id }).populate('cardId');
  res.json({ success: true, data: { cards } });
}));

// Claim / Combine Cards (5 same cards = 1 next level card)
router.post('/claim-card', asyncHandler(async (req, res) => {
  const { cardId } = req.body;
  const userCard = await UserCard.findOne({ userId: req.user._id, cardId });
  if (!userCard || userCard.quantity < 5) {
    return res.status(400).json({ success: false, error: { message: "You need 5 of the same card to claim the next level." } });
  }
  
  const currentCard = await Card.findById(cardId);
  const nextCard = await Card.findOne({ level: currentCard.level + 1 });

  if (!nextCard) return res.status(400).json({ success: false, error: { message: "Max level reached!" } });

  // Deduct 5, add 1 next level
  userCard.quantity -= 5;
  if (userCard.quantity === 0) await userCard.deleteOne(); else await userCard.save();

  await UserCard.findOneAndUpdate(
    { userId: req.user._id, cardId: nextCard._id },
    { $inc: { quantity: 1 } },
    { upsert: true, new: true }
  );

  res.json({ success: true, data: { message: "Card Upgraded!", newCard: nextCard } });
}));

export default router;
