import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('errors.form.email'),
  password: z.string().min(1, 'errors.form.passwordRequired'),
});

export const registerSchema = z.object({
  email: z.string().email('errors.form.email'),
  password: z.string().min(6, 'errors.form.passwordMin'),
  username: z.string().min(2, 'errors.form.usernameMin'),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
