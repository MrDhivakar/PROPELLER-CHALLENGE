import { Router } from 'express';
import { dbState } from '../../config/db.js';
import { env } from '../../config/env.js';

const router = Router();

router.get('/', (_req, res) => {
  const db = dbState();
  const healthy = db === 'connected';
  res.status(healthy ? 200 : 503).json({
    success: healthy,
    data: {
      status: healthy ? 'ok' : 'degraded',
      service: 'propeller-challenge-backend',
      environment: env.NODE_ENV,
      db,
      uptimeSeconds: Math.round(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

export default router;