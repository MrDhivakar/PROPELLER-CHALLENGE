import { Router } from 'express';
import { asyncHandler } from '../../utils/asyncHandler.js';
import { authenticateUser } from '../../middleware/auth.js';
import { LocationGame } from '../../models/LocationGame.js';
import { GameParticipant } from '../../models/GameParticipant.js';
import { UserCard } from '../../models/UserCard.js';
import { Card } from '../../models/Card.js';

const router = Router();
router.use(authenticateUser);

// FIX: Calculate status dynamically based on server time
router.get('/', asyncHandler(async (req, res) => {
  const games = await LocationGame.find().populate('rewardCardId');
  const now = new Date();

  const updatedGames = games.map(g => {
    const gameObj = g.toObject();
    if (gameObj.winnerId) {
      gameObj.status = 'ended';
    } else if (now < new Date(gameObj.startTime)) {
      gameObj.status = 'upcoming';
    } else if (now > new Date(gameObj.endTime)) {
      gameObj.status = 'ended'; // Time up, waiting for admin
    } else {
      gameObj.status = 'live';
    }
    return gameObj;
  });

  res.json({ success: true, data: { games: updatedGames } });
}));

// ... rest of the routes (accept, location, live-players, submit, my-cards, claim-card) remain exactly the same ...
router.post('/:id/accept', asyncHandler(async (req, res) => {
  let participant = await GameParticipant.findOne({ gameId: req.params.id, userId: req.user._id });
  if (!participant) {
    participant = await GameParticipant.create({ gameId: req.params.id, userId: req.user._id });
  }
  res.json({ success: true, data: { participant } });
}));

router.post('/:id/location', asyncHandler(async (req, res) => {
  const { lat, lng } = req.body;
  await GameParticipant.updateOne(
    { gameId: req.params.id, userId: req.user._id },
    { liveLocation: { type: 'Point', coordinates: [lng, lat] } }
  );
  res.json({ success: true });
}));

router.get('/:id/live-players', asyncHandler(async (req, res) => {
  const players = await GameParticipant.find({ gameId: req.params.id, status: 'accepted' })
    .populate('userId', 'displayName');
  res.json({ success: true, data: { players } });
}));

router.post('/:id/submit', asyncHandler(async (req, res) => {
  const { answer } = req.body;
  const participant = await GameParticipant.findOne({ gameId: req.params.id, userId: req.user._id });
  
  if (!participant) return res.status(404).json({ success: false, error: { message: "Not accepted" } });
  if (participant.status === 'submitted' || participant.status === 'winner') {
    return res.status(400).json({ success: false, error: { message: "You have already submitted!" } });
  }

  participant.submittedAnswer = answer;
  participant.status = 'submitted';
  await participant.save();
  
  res.json({ success: true });
}));

router.get('/my-cards', asyncHandler(async (req, res) => {
  const cards = await UserCard.find({ userId: req.user._id }).populate('cardId');
  res.json({ success: true, data: { cards } });
}));

router.post('/claim-card', asyncHandler(async (req, res) => {
  const { cardId } = req.body;
  const userCard = await UserCard.findOne({ userId: req.user._id, cardId });
  if (!userCard || userCard.quantity < 5) {
    return res.status(400).json({ success: false, error: { message: "Need 5 cards to combine." } });
  }
  const currentCard = await Card.findById(cardId);
  const nextCard = await Card.findOne({ level: currentCard.level + 1 });
  if (!nextCard) return res.status(400).json({ success: false, error: { message: "Max level reached!" } });

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
