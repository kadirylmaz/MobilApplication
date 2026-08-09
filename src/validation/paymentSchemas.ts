// =============================================================================
// Ders Defteri — Ödeme Doğrulama Şemaları (Zod)
// =============================================================================

import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const paymentSchema = z
  .object({
    student_id: z.string().uuid('Geçerli bir öğrenci seçin'),
    amount: z
      .string()
      .min(1, 'Tutar girin')
      .regex(/^\d+(\.\d{1,2})?$/, 'Geçerli bir tutar girin')
      .refine((val) => parseFloat(val) > 0, 'Tutar 0\'dan büyük olmalıdır'),
    payment_date: z
      .string()
      .regex(dateRegex, 'Tarih YYYY-AA-GG formatında olmalıdır')
      .optional()
      .or(z.literal('')),
    period_start: z
      .string()
      .regex(dateRegex, 'Tarih YYYY-AA-GG formatında olmalıdır'),
    period_end: z
      .string()
      .regex(dateRegex, 'Tarih YYYY-AA-GG formatında olmalıdır'),
    status: z.enum(['pending', 'paid', 'overdue']).default('pending'),
    notes: z
      .string()
      .max(1000, 'Notlar en fazla 1000 karakter olabilir')
      .optional()
      .or(z.literal('')),
  })
  .refine((data) => data.period_end >= data.period_start, {
    message: 'Bitiş tarihi başlangıç tarihinden önce olamaz',
    path: ['period_end'],
  });

export type PaymentSchemaValues = z.infer<typeof paymentSchema>;
