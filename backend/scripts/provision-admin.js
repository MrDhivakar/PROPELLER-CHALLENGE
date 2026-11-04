import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { z } from 'zod';
import { Admin } from '../src/models/Admin.js';

const Schema = z.object({
  MONGODB_URI: z.string().min(1),
  ADMIN_EMAIL: z.string().email(),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD must be at least 12 characters'),
  BCRYPT_ROUNDS: z.coerce.number().int().min(10).max(14).default(12),
});

async function main() {
  const env = Schema.parse(process.env);
  await mongoose.connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 });

  const email = env.ADMIN_EMAIL.toLowerCase();
  const existing = await Admin.findOne({ email });
  if (existing) {
    console.log(`[provision] Super admin ${email} already exists. No changes made.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(env.ADMIN_PASSWORD, env.BCRYPT_ROUNDS);
  await Admin.create({ email, passwordHash, role: 'super_admin', isActive: true });
  console.log(`[provision] Created super_admin: ${email}`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error('[provision] failed:', err.message);
  process.exit(1);
});