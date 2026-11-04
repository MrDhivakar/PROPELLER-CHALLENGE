import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { BlockedUser } from '../models/BlockedUser.js';

export const requireActiveUser = (req, _res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (req.user.accountStatus === 'pending_deletion') {
    return next(ApiError.forbidden('Account pending deletion. Log in to restore.'));
  }
  if (req.user.accountStatus === 'suspended') {
    return next(ApiError.forbidden('Account suspended'));
  }
  next();
};

export const requireNotBlocked = asyncHandler(async (req, _res, next) => {
  const blocked = await BlockedUser.findOne({ userId: req.user._id, unblockedAt: null });
  if (blocked) throw ApiError.forbidden('Account is blocked');
  next();
});