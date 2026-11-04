import mongoose from 'mongoose';

const ASSIGNMENT_STATUSES = ['offered', 'accepted', 'skipped', 'declined', 'submitted', 'reviewed'];

const TaskAssignmentSchema = new mongoose.Schema({
  taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', required: true, index: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Admin', required: true },
  assignmentStatus: { type: String, enum: ASSIGNMENT_STATUSES, default: 'offered', index: true },
  offeredAt: { type: Date, required: true, default: Date.now },
  respondedAt: { type: Date, default: null },
  dueAt: { type: Date, default: null },
  skipReason: { type: String, trim: true, maxlength: 500, default: null },
  declineReason: { type: String, trim: true, maxlength: 500, default: null },
}, { timestamps: true });

TaskAssignmentSchema.index({ taskId: 1, userId: 1 }, { unique: true });
TaskAssignmentSchema.index({ userId: 1, assignmentStatus: 1, offeredAt: -1 });

export const TaskAssignment = mongoose.model('TaskAssignment', TaskAssignmentSchema);
export const ASSIGNMENT_STATUSES = ASSIGNMENT_STATUSES;