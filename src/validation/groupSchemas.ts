// =============================================================================
// Ders Defteri — Grup Doğrulama Şemaları (Zod)
// =============================================================================

import { z } from 'zod';

export const groupSchema = z.object({
  name: z
    .string()
    .min(1, 'Grup adı gereklidir')
    .max(100, 'Grup adı en fazla 100 karakter olabilir'),
  description: z
    .string()
    .max(1000, 'Açıklama en fazla 1000 karakter olabilir')
    .optional()
    .or(z.literal('')),
});

export type GroupSchemaValues = z.infer<typeof groupSchema>;
