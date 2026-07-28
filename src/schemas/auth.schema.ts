import { z } from 'zod';

const PASSWORD_UPPERCASE_NUMBER_REGEX = /(?=.*[A-Z])(?=.*\d)/;

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'validation.email.required' })
    .email({ message: 'validation.email.invalid' }),
  password: z
    .string()
    .min(1, { message: 'validation.password.required' })
    .min(6, { message: 'validation.password.minLength6' }),
});

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, { message: 'validation.fullName.required' })
      .min(2, { message: 'validation.fullName.minLength' }),
    email: z
      .string()
      .min(1, { message: 'validation.email.required' })
      .email({ message: 'validation.email.invalid' }),
    password: z
      .string()
      .min(1, { message: 'validation.password.required' })
      .min(6, { message: 'validation.password.minLength6' })
      .regex(PASSWORD_UPPERCASE_NUMBER_REGEX, {
        message: 'validation.password.pattern',
      }),
    confirmPassword: z
      .string()
      .min(1, { message: 'validation.confirmPassword.required' }),
    avatar: z.string().min(1, { message: 'validation.avatar.required' }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'validation.confirmPassword.mismatch',
    path: ['confirmPassword'],
  });
