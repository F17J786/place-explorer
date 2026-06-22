import { z } from 'zod';
const PASSWORD_UPPERCASE_NUMBER_REGEX = /(?=.*[A-Z])(?=.*\d)/;
export const loginSchema = z.object({
  email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
  password: z
    .string()
    .min(1, 'Mật khẩu là bắt buộc')
    .min(6, 'Mật khẩu tối thiểu 6 ký tự'),
});
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Họ tên là bắt buộc')
      .min(2, 'Họ tên tối thiểu 2 ký tự'),
    email: z.string().min(1, 'Email là bắt buộc').email('Email không hợp lệ'),
    password: z
      .string()
      .min(1, 'Mật khẩu là bắt buộc')
      .min(8, 'Mật khẩu tối thiểu 8 ký tự')
      .regex(
        PASSWORD_UPPERCASE_NUMBER_REGEX,
        'Mật khẩu phải có ít nhất 1 chữ hoa và 1 số',
      ),
    confirmPassword: z.string().min(1, 'Xác nhận mật khẩu là bắt buộc'),
    avatar: z.string().min(1, 'Vui lòng chọn ảnh đại diện'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });
