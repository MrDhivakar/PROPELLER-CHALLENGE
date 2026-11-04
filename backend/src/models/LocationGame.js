import mongoose from 'mongoose';

const LocationGameSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  rewardCardId: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  status: { type: String, enum: ['upcoming', 'live', 'ended'], default: 'upcoming' }
}, { timestamps: true });

LocationGameSchema.index({ location: '2dsphere' });

export const LocationGame = mongoose.model('LocationGame', LocationGameSchema);
