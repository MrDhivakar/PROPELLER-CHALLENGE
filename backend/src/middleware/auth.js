import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken, USER_AUDIENCE } from '../utils/jwt.js';
import { User } from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticateUser = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing bearer token');
  }

  let payload;
  try {
    payload = verifyAccessToken(token, USER_AUDIENCE);
  } catch {
    throw ApiError.unauthorized('Invalid or expired access token');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw ApiError.unauthorized('User not found');
  if (user.accountStatus === 'suspended') {
    throw ApiError.forbidden('Account suspended');
  }

  req.user = user;
  next();
});