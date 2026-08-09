// =============================================================================
// Ders Defteri — Öğretmen Profili Doğrulama Şeması (Zod)
// =============================================================================

import { z } from 'zod';

const phoneRegex = /^[0-9+\-\s()]{7,20}$/;

export const teacherProfileSchema = z.object({
  full_name: z
    .string()
    .min(2, 'Ad Soyad en az 2 karakter olmalıdır')
    .max(100, 'Ad Soyad en fazla 100 karakter olabilir'),
  phone: z
    .string()
    .regex(phoneRegex, 'Geçerli bir telefon numarası girin')
    .optional()
    .or(z.literal('')),
});

export type TeacherProfileSchemaValues = z.infer<typeof teacherProfileSchema>;
