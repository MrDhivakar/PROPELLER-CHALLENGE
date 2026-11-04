import mongoose from 'mongoose';

const CardSchema = new mongoose.Schema({
  cardId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  level: { type: Number, required: true },
  imageUrl: { type: String, required: true },
  description: { type: String, default: '' }
}, { timestamps: true });

export const Card = mongoose.model('Card', CardSchema);
