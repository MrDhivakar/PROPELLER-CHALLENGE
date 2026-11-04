import mongoose from 'mongoose';

const SUBMISSION_STATUSES = ['submitted', 'under_review', 'accepted', 'returned'];

const TaskSubmissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'TaskAssignment', required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  textResponse: { type: String, trim: true, maxlength: 5000, default: '' },
  imageUrls: { type: [String], default: [] },
  status: { type: String, enum: SUBMISSION_STATUSES, default: 'submitted', index: true },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', default: null },
  reviewedAt: { type: Date, default: null },
  reviewNote: { type: String, trim: true, maxlength: 1000, default: '' },
}, { timestamps: true });

TaskSubmissionSchema.index({ status: 1, createdAt: -1 });
TaskSubmissionSchema.index({ userId: 1, createdAt: -1 });

TaskSubmissionSchema.pre('validate', function (next) {
  const hasText = typeof this.textResponse === 'string' && this.textResponse.trim().length > 0;
  const hasImage = Array.isArray(this.imageUrls) && this.imageUrls.length > 0;
  if (!hasText && !hasImage) {
    return next(new Error('Submission requires text response or at least one image'));
  }
  next();
});

export const TaskSubmission = mongoose.model('TaskSubmission', TaskSubmissionSchema);
export { SUBMISSION_STATUSES };
