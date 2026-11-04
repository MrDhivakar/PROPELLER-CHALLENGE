import mongoose from 'mongoose';

const AdminActivityLogSchema = new mongoose.Schema({
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
  action: { type: String, required: true, trim: true, maxlength: 100 },
  targetType: { type: String, trim: true, maxlength: 50, default: null },
  targetId: { type: mongoose.Schema.Types.ObjectId, default: null },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  ip: { type: String, trim: true, maxlength: 64, default: null },
}, { timestamps: { createdAt: true, updatedAt: false } });

AdminActivityLogSchema.index({ createdAt: -1 });
AdminActivityLogSchema.index({ adminId: 1, createdAt: -1 });
AdminActivityLogSchema.index({ targetType: 1, targetId: 1 });

export const AdminActivityLog = mongoose.model('AdminActivityLog', AdminActivityLogSchema);