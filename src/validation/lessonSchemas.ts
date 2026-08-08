// =============================================================================
// Ders Defteri — Ders Doğrulama Şemaları (Zod)
// =============================================================================

import { z } from 'zod';

export const lessonSchema = z.object({
  student_id: z.string().uuid('Geçerli bir öğrenci seçin'),
  scheduled_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Tarih YYYY-AA-GG formatında olmalıdır'),
  scheduled_time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Saat SS:DD formatında olmalıdır'),
  duration_minutes: z
    .number()
    .int('Süre tam sayı olmalıdır')
    .min(15, 'Süre en az 15 dakika olmalıdır')
    .max(480, 'Süre en fazla 480 dakika olabilir')
    .default(60),
  topic: z
    .string()
    .max(200, 'Konu en fazla 200 karakter olabilir')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(2000, 'Notlar en fazla 2000 karakter olabilir')
    .optional()
    .or(z.literal('')),
  status: z
    .enum(['scheduled', 'completed', 'cancelled', 'compensated'])
    .default('scheduled'),
});

export type LessonSchemaValues = z.infer<typeof lessonSchema>;
