import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken, ADMIN_AUDIENCE } from '../utils/jwt.js';
import { Admin } from '../models/Admin.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const authenticateAdmin = asyncHandler(async (req, _res, next) => {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw ApiError.unauthorized('Missing bearer token');
  }

  let payload;
  try {
    payload = verifyAccessToken(token, ADMIN_AUDIENCE);
  } catch {
    throw ApiError.unauthorized('Invalid or expired admin token');
  }

  const admin = await Admin.findById(payload.sub);
  if (!admin || !admin.isActive) {
    throw ApiError.forbidden('Admin account inactive');
  }
  if (admin.role !== 'super_admin') {
    throw ApiError.forbidden('Insufficient privileges');
  }

  req.admin = admin;
  next();
});