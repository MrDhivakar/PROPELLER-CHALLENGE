import mongoose from 'mongoose';

const UserCardSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  quantity: { type: Number, default: 1 },
  collectedAt: { type: Date, default: Date.now }
}, { timestamps: true });

UserCardSchema.index({ userId: 1, cardId: 1 }, { unique: true });

export const UserCard = mongoose.model('UserCard', UserCardSchema);
