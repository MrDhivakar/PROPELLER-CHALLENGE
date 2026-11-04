import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env.js';

export const USER_AUDIENCE = 'propeller-user';
export const ADMIN_AUDIENCE = 'propeller-admin';
const ISSUER = 'propeller-challenge';

export function signAccessToken({ sub, role, audience, ttl = env.ACCESS_TOKEN_TTL }) {
  return jwt.sign(
    { role },
    env.JWT_ACCESS_SECRET,
    { subject: sub, audience, expiresIn: ttl, issuer: ISSUER }
  );
}

export function signRefreshToken({ sub, jti, familyId, audience }) {
  return jwt.sign(
    { jti, fid: familyId },
    env.JWT_REFRESH_SECRET,
    { subject: sub, audience, expiresIn: `${env.REFRESH_TOKEN_TTL_DAYS}d`, issuer: ISSUER }
  );
}

export function verifyAccessToken(token, audience) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { audience, issuer: ISSUER });
}

export function verifyRefreshToken(token, audience) {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { audience, issuer: ISSUER });
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export const newFamilyId = () => crypto.randomUUID();
export const newJti = () => crypto.randomUUID();