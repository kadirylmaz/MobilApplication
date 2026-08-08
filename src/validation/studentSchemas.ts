// =============================================================================
// Ders Defteri — Öğrenci Doğrulama Şemaları (Zod)
// =============================================================================

import { z } from 'zod';

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

export const studentSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Ad Soyad en az 2 karakter olmalıdır')
    .max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
  phone: z
    .string()
    .regex(phoneRegex, 'Geçerli bir telefon numarası girin')
    .optional()
    .or(z.literal('')),
  parent_name: z
    .string()
    .max(100, 'Veli adı en fazla 100 karakter olabilir')
    .optional()
    .or(z.literal('')),
  parent_phone: z
    .string()
    .regex(phoneRegex, 'Geçerli bir telefon numarası girin')
    .optional()
    .or(z.literal('')),
  grade: z
    .string()
    .max(20, 'Sınıf en fazla 20 karakter olabilir')
    .optional()
    .or(z.literal('')),
  subject: z
    .string()
    .max(100, 'Ders en fazla 100 karakter olabilir')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(2000, 'Notlar en fazla 2000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  is_active: z.boolean().default(true),
});

export type StudentSchemaValues = z.infer<typeof studentSchema>;
