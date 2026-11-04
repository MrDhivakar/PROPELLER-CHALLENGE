import mongoose from 'mongoose';

const GameParticipantSchema = new mongoose.Schema({
  gameId: { type: mongoose.Schema.Types.ObjectId, ref: 'LocationGame', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, enum: ['accepted', 'arrived', 'submitted', 'winner'], default: 'accepted' },
  liveLocation: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  submittedAnswer: { type: String, default: '' },
  isWinner: { type: Boolean, default: false }
}, { timestamps: true });

GameParticipantSchema.index({ gameId: 1, userId: 1 }, { unique: true });

export const GameParticipant = mongoose.model('GameParticipant', GameParticipantSchema);
