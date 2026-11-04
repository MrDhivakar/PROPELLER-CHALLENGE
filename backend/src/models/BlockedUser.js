import mongoose from 'mongoose';

const BLOCK_REASONS = ['user_request', 'safety_violation', 'admin_action'];

const BlockedUserSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  reasonCategory: { type: String, enum: BLOCK_REASONS, required: true },
  reasonNote: { type: String, trim: true, maxlength: 500, default: '' },
  blockedAt: { type: Date, default: Date.now },
  blockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  unblockedAt: { type: Date, default: null },
}, { timestamps: true });

BlockedUserSchema.index({ unblockedAt: 1 });

export const BlockedUser = mongoose.model('BlockedUser', BlockedUserSchema);
export const BLOCK_REASONS = BLOCK_REASONS;