import crypto from 'crypto';
import { User } from '../../models/User.js';
import { PasswordResetToken } from '../../models/PasswordResetToken.js';
import { RefreshToken } from '../../models/RefreshToken.js';
import { hashPassword, verifyPassword } from '../../utils/password.js';
import { ApiError } from '../../utils/ApiError.js';
import { hashToken } from '../../utils/jwt.js';
import { issueTokenPair, revokeByRefreshToken } from '../../services/tokenService.js';
import { env } from '../../config/env.js';

const RESET_TTL_MIN = 30;
const DELETION_GRACE_DAYS = 30;

export async function registerUser(
  { email, password, displayName, gender, age, country, state, city, timezone },
  meta = {}
) {
  const existing = await User.findOne({ email: email.toLowerCase() });
  if (existing) throw ApiError.conflict('Email already registered');

  const passwordHash = await hashPassword(password);
  const now = new Date();
  const dob = new Date(now.getFullYear() - Number(age), now.getMonth(), now.getDate());

  const user = await User.create({
    email: email.toLowerCase(),
    passwordHash,
    displayName,
    gender,
    dateOfBirth: dob,
    country,
    state,
    city,
    timezone,
  });

  const tokens = await issueTokenPair({
    userId: user._id,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  return { user: user.toSafeJSON(), ...tokens };
}

export async function loginUser({ email, password }, meta = {}) {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!user) throw ApiError.unauthorized('Invalid credentials');
  if (user.accountStatus === 'suspended') throw ApiError.forbidden('Account suspended');

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  if (user.accountStatus === 'pending_deletion') {
    const graceMs = DELETION_GRACE_DAYS * 24 * 60 * 60 * 1000;
    const withinGrace = user.deletedAt && Date.now() - user.deletedAt.getTime() <= graceMs;
    if (!withinGrace) throw ApiError.forbidden('Deletion grace period expired');
    user.accountStatus = 'active';
    user.deletedAt = null;
  }

  user.lastLoginAt = new Date();
  await user.save();

  const tokens = await issueTokenPair({ userId: user._id, userAgent: meta.userAgent, ip: meta.ip });
  return { user: user.toSafeJSON(), ...tokens };
}

export async function logout({ refreshToken }) {
  await revokeByRefreshToken(refreshToken);
  return { ok: true };
}

export async function forgotPassword({ email }) {
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return { ok: true };
  const raw = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(raw);
  const expiresAt = new Date(Date.now() + RESET_TTL_MIN * 60 * 1000);
  await PasswordResetToken.create({ userId: user._id, tokenHash, expiresAt });
  if (!env.isProd) {
    console.log(`[auth] password reset token for ${user.email}: ${raw}`);
    return { ok: true, devToken: raw };
  }
  return { ok: true };
}

export async function resetPassword({ token, newPassword }) {
  const tokenHash = hashToken(token);
  const entry = await PasswordResetToken.findOne({ tokenHash });
  if (!entry || entry.usedAt || entry.expiresAt.getTime() < Date.now()) {
    throw ApiError.badRequest('Invalid or expired reset token');
  }
  const user = await User.findById(entry.userId).select('+passwordHash');
  if (!user) throw ApiError.badRequest('Invalid reset token');
  user.passwordHash = await hashPassword(newPassword);
  await user.save();
  entry.usedAt = new Date();
  await entry.save();
  await RefreshToken.updateMany(
    { userId: user._id, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
  return { ok: true };
}