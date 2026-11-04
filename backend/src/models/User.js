import mongoose from 'mongoose';

const NotificationPrefsSchema = new mongoose.Schema({
  newTask: { type: Boolean, default: true },
  reminder: { type: Boolean, default: true },
  reviewResult: { type: Boolean, default: true },
  security: { type: Boolean, default: true },
}, { _id: false });

const FcmTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  platform: { type: String, enum: ['android'], default: 'android' },
  lastSeenAt: { type: Date, default: Date.now },
}, { _id: false });

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 254 },
  passwordHash: { type: String, required: true, select: false },
  displayName: { type: String, required: true, trim: true, minlength: 2, maxlength: 50 },
  gender: {
    type: String,
    enum: ['male', 'female', 'other', 'prefer_not_to_say'],
    default: 'prefer_not_to_say',
  },
  dateOfBirth: { type: Date, required: true },
  country: { type: String, trim: true, maxlength: 60, default: '' },
  state: { type: String, trim: true, maxlength: 60, default: '' },
  city: { type: String, trim: true, maxlength: 60, default: '' },
  timezone: { type: String, required: true, default: 'UTC', maxlength: 64 },
  accountStatus: {
    type: String,
    enum: ['active', 'paused', 'suspended', 'pending_deletion'],
    default: 'active',
    index: true,
  },
  pausedAt: { type: Date, default: null },
  suspendedAt: { type: Date, default: null },
  deletedAt: { type: Date, default: null },
  notificationPrefs: { type: NotificationPrefsSchema, default: () => ({}) },
  fcmTokens: { type: [FcmTokenSchema], default: [] },
  lastLoginAt: { type: Date, default: null },
}, { timestamps: true });

UserSchema.index({ createdAt: -1 });
UserSchema.index({ accountStatus: 1, createdAt: -1 });

UserSchema.methods.toSafeJSON = function () {
  let age = null;
  if (this.dateOfBirth) {
    const now = new Date();
    age = now.getFullYear() - this.dateOfBirth.getFullYear();
    const m = now.getMonth() - this.dateOfBirth.getMonth();
    if (m < 0 || (m === 0 && now.getDate() < this.dateOfBirth.getDate())) age--;
  }
  return {
    id: this._id.toString(),
    email: this.email,
    displayName: this.displayName,
    gender: this.gender,
    age,
    dateOfBirth: this.dateOfBirth,
    country: this.country,
    state: this.state,
    city: this.city,
    timezone: this.timezone,
    accountStatus: this.accountStatus,
    notificationPrefs: this.notificationPrefs,
    lastLoginAt: this.lastLoginAt,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt,
  };
};

export const User = mongoose.model('User', UserSchema);