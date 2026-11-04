import mongoose from 'mongoose';
import { env } from './env.js';

const STATES = { 0:'disconnected',1:'connected',2:'connecting',3:'disconnecting',99:'uninitialized' };

export async function connectDatabase() {
  mongoose.set('strictQuery', true);
  mongoose.connection.on('connected', () => console.log('[db] connected'));
  mongoose.connection.on('error', (e) => console.error('[db] error:', e.message));
  mongoose.connection.on('disconnected', () => console.warn('[db] disconnected'));
  await mongoose.connect(env.MONGODB_URI, {
    serverSelectionTimeoutMS: 10000,
    autoIndex: !env.isProd,
  });
}

export function dbState() {
  return STATES[mongoose.connection.readyState] ?? 'unknown';
}

export async function disconnectDatabase() {
  await mongoose.disconnect();
}