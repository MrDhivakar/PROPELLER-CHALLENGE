import mongoose from 'mongoose';

const LocationGameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  address: {
    country: { type: String, default: 'Unknown' },
    state: { type: String, default: 'Unknown' },
    district: { type: String, default: 'Unknown' }
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  durationMinutes: { type: Number, required: true }, // NEW: Admin set duration
  rewardCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' },
  winnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null } // Store winner
}, { timestamps: true });

LocationGameSchema.index({ location: '2dsphere' });

export const LocationGame = mongoose.model('LocationGame', LocationGameSchema);
