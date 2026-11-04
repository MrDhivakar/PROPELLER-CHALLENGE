import { RefreshToken } from '../models/RefreshToken.js';
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  newFamilyId,
  newJti,
  USER_AUDIENCE,
} from '../utils/jwt.js';
import { ApiError } from '../utils/ApiError.js';
import { env } from '../config/env.js';

export async function issueTokenPair({ userId, userAgent = null, ip = null, familyId = null }) {
  const fid = familyId ?? newFamilyId();
  const jti = newJti();

  const refreshToken = signRefreshToken({
    sub: userId.toString(),
    jti,
    familyId: fid,
    audience: USER_AUDIENCE,
  });

  const expiresAt = new Date(Date.now() + env.REFRESH_TOKEN_TTL_DAYS * 24 * 60 * 60 * 1000);

  const doc = await RefreshToken.create({
    userId,
    tokenHash: hashToken(refreshToken),
    familyId: fid,
    expiresAt,
    userAgent: userAgent ? userAgent.slice(0, 300) : null,
    ip: ip ? ip.slice(0, 64) : null,
  });

  const accessToken = signAccessToken({
    sub: userId.toString(),
    role: 'user',
    audience: USER_AUDIENCE,
  });

  return { accessToken, refreshToken, refreshTokenId: doc._id, familyId: fid };
}

export async function rotateRefreshToken({ refreshToken, userAgent = null, ip = null }) {
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken, USER_AUDIENCE);
  } catch {
    throw ApiError.unauthorized('Invalid refresh token');
  }

  const hash = hashToken(refreshToken);
  const existing = await RefreshToken.findOne({ tokenHash: hash });

  if (!existing) {
    throw ApiError.unauthorized('Refresh token not recognized');
  }

  // Reuse detection: token already rotated or revoked → revoke family.
  if (existing.revokedAt || existing.replacedBy) {
    await RefreshToken.updateMany(
      { familyId: existing.familyId, revokedAt: null },
      { $set: { revokedAt: new Date() } }
    );
    throw ApiError.unauthorized('Refresh token has already been used');
  }

  if (existing.expiresAt.getTime() < Date.now()) {
    throw ApiError.unauthorized('Refresh token expired');
  }

  const { accessToken, refreshToken: newRefreshToken, refreshTokenId } = await issueTokenPair({
    userId: existing.userId,
    userAgent,
    ip,
    familyId: existing.familyId,
  });

  existing.revokedAt = new Date();
  existing.replacedBy = refreshTokenId;
  await existing.save();

  return { accessToken, refreshToken: newRefreshToken, userId: existing.userId };
}

export async function revokeFamily(familyId) {
  await RefreshToken.updateMany(
    { familyId, revokedAt: null },
    { $set: { revokedAt: new Date() } }
  );
}

export async function revokeByRefreshToken(refreshToken) {
  const hash = hashToken(refreshToken);
  const existing = await RefreshToken.findOne({ tokenHash: hash });
  if (existing) await revokeFamily(existing.familyId);
}