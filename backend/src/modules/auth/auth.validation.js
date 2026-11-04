import { z } from 'zod';

export const GENDERS = ['male', 'female', 'other', 'prefer_not_to_say'];

export const registerSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(10).max(128),
  displayName: z.string().trim().min(2).max(50),
  gender: z.enum(GENDERS),
  age: z.coerce.number().int().min(13, 'Must be at least 13').max(120, 'Invalid age'),
  country: z.string().trim().min(1).max(60),
  state: z.string().trim().min(1).max(60),
  city: z.string().trim().min(1).max(60),
  timezone: z.string().min(1).max(64).default('UTC'),
});

export const loginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});

export const refreshSchema = z.object({ refreshToken: z.string().min(20) });
export const logoutSchema = refreshSchema;
export const forgotPasswordSchema = z.object({ email: z.string().email().max(254) });
export const resetPasswordSchema = z.object({
  token: z.string().min(20),
  newPassword: z.string().min(10).max(128),
});
export const adminLoginSchema = z.object({
  email: z.string().email().max(254),
  password: z.string().min(1).max(128),
});