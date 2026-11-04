import { createApp } from './app.js';
import { env } from './config/env.js';
import { connectDatabase, disconnectDatabase } from './config/db.js';

async function main() {
  await connectDatabase();
  const app = createApp();
  const server = app.listen(env.PORT, () => {
    console.log(`[server] PROPELLER CHALLENGE API listening on ${env.PORT} (${env.NODE_ENV})`);
  });
  const shutdown = (sig) => {
    console.log(`[server] ${sig} received`);
    server.close(async () => { await disconnectDatabase(); process.exit(0); });
    setTimeout(() => process.exit(1), 10000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('unhandledRejection', (r) => console.error('[server] unhandledRejection:', r));
}

main().catch((err) => {
  console.error('[server] fatal startup error:', err.message);
  process.exit(1);
});