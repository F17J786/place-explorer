import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(1, { message: 'validation.name.required' })
    .min(2, { message: 'validation.name.minLength' }),
  email: z
    .string()
    .min(1, { message: 'validation.email.required' })
    .email({ message: 'validation.email.invalid' }),
  avatar: z.string().min(1, { message: 'validation.avatar.required' }),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, { message: 'validation.oldPassword.required' }),
    newPassword: z
      .string()
      .min(1, { message: 'validation.newPassword.required' })
      .min(6, { message: 'validation.newPassword.minLength' }),
    confirmNewPassword: z
      .string()
      .min(1, { message: 'validation.confirmNewPassword.required' }),
  })
  .refine(data => data.newPassword === data.confirmNewPassword, {
    message: 'validation.confirmNewPassword.mismatch',
    path: ['confirmNewPassword'],
  })
  .refine(data => data.newPassword !== data.oldPassword, {
    message: 'validation.newPassword.sameAsOld',
    path: ['newPassword'],
  });
