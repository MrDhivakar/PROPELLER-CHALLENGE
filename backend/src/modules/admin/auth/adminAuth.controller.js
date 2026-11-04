import { asyncHandler } from '../../../utils/asyncHandler.js';
import { Admin } from '../../../models/Admin.js';
import { verifyPassword } from '../../../utils/password.js';
import { signAccessToken, ADMIN_AUDIENCE } from '../../../utils/jwt.js';
import { ApiError } from '../../../utils/ApiError.js';
import { logAdminActivity } from '../../../services/activityLog.js';

// Admin access token TTL: single-super-admin web panel re-authenticates daily.
const ADMIN_TTL = '8h';

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+passwordHash');
  if (!admin || !admin.isActive) throw ApiError.unauthorized('Invalid credentials');

  const ok = await verifyPassword(password, admin.passwordHash);
  if (!ok) throw ApiError.unauthorized('Invalid credentials');

  admin.lastLoginAt = new Date();
  await admin.save();

  const accessToken = signAccessToken({
    sub: admin._id.toString(),
    role: admin.role,
    audience: ADMIN_AUDIENCE,
    ttl: ADMIN_TTL,
  });

  await logAdminActivity({
    adminId: admin._id,
    action: 'admin.login',
    ip: req.ip ?? null,
  });

  res.json({
    success: true,
    data: { accessToken, admin: admin.toSafeJSON(), expiresIn: ADMIN_TTL },
  });
});