import mongoose from 'mongoose';

const REPORT_REASONS = ['unsafe_content', 'coercion', 'harassment', 'privacy', 'other'];
const REPORT_STATUSES = ['open', 'under_review', 'resolved', 'dismissed'];

const SafetyReportSchema = new mongoose.Schema({
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskAssignment', default: null },
  reason: { type: String, enum: REPORT_REASONS, required: true },
  details: { type: String, trim: true, maxlength: 2000, default: '' },
  status: { type: String, enum: REPORT_STATUSES, default: 'open', index: true },
  resolutionNote: { type: String, trim: true, maxlength: 1000, default: '' },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

SafetyReportSchema.index({ status: 1, createdAt: -1 });
SafetyReportSchema.index({ taskId: 1, status: 1 });

export const SafetyReport = mongoose.model('SafetyReport', SafetyReportSchema);
export const REPORT_REASONS = REPORT_REASONS;