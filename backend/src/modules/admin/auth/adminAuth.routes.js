import { Router } from 'express';
import { validate } from '../../../middleware/validate.js';
import { adminLoginLimiter } from '../../../middleware/rateLimiter.js';
import { adminLoginSchema } from '../../auth/auth.validation.js';
import * as ctrl from './adminAuth.controller.js';

const router = Router();

router.post('/login', adminLoginLimiter, validate({ body: adminLoginSchema }), ctrl.login);

export default router;