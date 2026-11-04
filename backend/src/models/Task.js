import mongoose from 'mongoose';

const CATEGORIES = ['drawing', 'puzzle', 'learning', 'writing', 'organizing', 'reflection'];
const DIFFICULTIES = ['gentle', 'moderate', 'focus'];
const SAFETY_STATUSES = ['draft', 'pending_review', 'approved', 'rejected'];
const PUBLISH_STATUSES = ['draft', 'scheduled', 'published', 'archived'];

const TaskSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, minlength: 5, maxlength: 100 },
  description: { type: String, required: true, trim: true, minlength: 20, maxlength: 2000 },
  category: { type: String, required: true, enum: CATEGORIES },
  difficulty: { type: String, required: true, enum: DIFFICULTIES, default: 'gentle' },
  estimatedMinutes: { type: Number, required: true, min: 1, max: 120 },
  safetyStatus: { type: String, enum: SAFETY_STATUSES, default: 'draft', index: true },
  safetyNotes: { type: String, trim: true, maxlength: 1000, default: '' },
  safetyFlags: { type: [String], default: [] },
  publishStatus: { type: String, enum: PUBLISH_STATUSES, default: 'draft', index: true },
  publishAt: { type: Date, default: null },
  expiresAt: { type: Date, default: null },
  archivedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true, index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  reviewedAt: { type: Date, default: null },
}, { timestamps: true });

TaskSchema.index({ publishStatus: 1, publishAt: 1 });
TaskSchema.index({ category: 1, publishStatus: 1 });
TaskSchema.index({ createdAt: -1 });

TaskSchema.methods.canPublish = function () {
  return this.safetyStatus === 'approved' && this.publishStatus !== 'archived';
};

TaskSchema.pre('save', function (next) {
  if (this.publishStatus === 'published' && this.safetyStatus !== 'approved') {
    return next(new Error('Cannot publish a task that is not safety-approved'));
  }
  next();
});

export const Task = mongoose.model('Task', TaskSchema);
export const TASK_CATEGORIES = CATEGORIES;
export const TASK_DIFFICULTIES = DIFFICULTIES;
export const SAFETY_STATUSES = SAFETY_STATUSES;
export const PUBLISH_STATUSES = PUBLISH_STATUSES;