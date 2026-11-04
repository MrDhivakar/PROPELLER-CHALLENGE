import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { authLimiter } from '../../middleware/rateLimiter.js';
import * as ctrl from './auth.controller.js';
import * as v from './auth.validation.js';

const router = Router();

router.post('/register', authLimiter, validate({ body: v.registerSchema }), ctrl.register);
router.post('/login', authLimiter, validate({ body: v.loginSchema }), ctrl.login);
router.post('/refresh', validate({ body: v.refreshSchema }), ctrl.refresh);
router.post('/logout', validate({ body: v.logoutSchema }), ctrl.logout);
router.post('/forgot-password', authLimiter, validate({ body: v.forgotPasswordSchema }), ctrl.forgotPassword);
router.post('/reset-password', authLimiter, validate({ body: v.resetPasswordSchema }), ctrl.resetPassword);

export default router;