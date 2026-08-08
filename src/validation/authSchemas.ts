// =============================================================================
// Ders Defteri — Auth Doğrulama Şemaları (Zod)
// =============================================================================

import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta adresi girin'),
  password: z.string().min(6, 'Şifre en az 6 karakter olmalıdır'),
});

export const registerSchema = loginSchema
  .extend({
    full_name: z
      .string()
      .min(2, 'Ad Soyad en az 2 karakter olmalıdır')
      .max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
    confirmPassword: z.string().min(6, 'Şifre onayı en az 6 karakter olmalıdır'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Şifreler eşleşmiyor',
    path: ['confirmPassword'],
  });

export type LoginFormValues = z.infer<typeof loginSchema>;
export type RegisterFormValues = z.infer<typeof registerSchema>;
