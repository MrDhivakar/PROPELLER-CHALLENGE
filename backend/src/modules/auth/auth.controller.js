import { asyncHandler } from '../../utils/asyncHandler.js';
import { rotateRefreshToken } from '../../services/tokenService.js';
import * as authService from './auth.service.js';

const meta = (req) => ({
  userAgent: req.headers['user-agent'] ?? null,
  ip: req.ip ?? null,
});

export const register = asyncHandler(async (req, res) => {
  const result = await authService.registerUser(req.body, meta(req));
  res.status(201).json({ success: true, data: result });
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.loginUser(req.body, meta(req));
  res.json({ success: true, data: result });
});

export const refresh = asyncHandler(async (req, res) => {
  const result = await rotateRefreshToken({
    refreshToken: req.body.refreshToken,
    userAgent: req.headers['user-agent'] ?? null,
    ip: req.ip ?? null,
  });
  res.json({ success: true, data: result });
});

export const logout = asyncHandler(async (req, res) => {
  const result = await authService.logout(req.body);
  res.json({ success: true, data: result });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const result = await authService.forgotPassword(req.body);
  res.json({ success: true, data: result });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const result = await authService.resetPassword(req.body);
  res.json({ success: true, data: result });
});