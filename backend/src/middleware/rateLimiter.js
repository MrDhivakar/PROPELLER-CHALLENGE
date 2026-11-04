import rateLimit from 'express-rate-limit';

const jsonHandler = (msg) => (_req, res) => {
  res.status(429).json({ success: false, error: { code: 'RATE_LIMITED', message: msg } });
};

export const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 300,
  standardHeaders: 'draft-7', legacyHeaders: false,
  handler: jsonHandler('Too many requests. Please slow down.'),
});

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 20,
  standardHeaders: 'draft-7', legacyHeaders: false,
  handler: jsonHandler('Too many authentication attempts. Try again later.'),
});

export const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, limit: 10,
  standardHeaders: 'draft-7', legacyHeaders: false,
  handler: jsonHandler('Too many admin login attempts. Try again later.'),
});