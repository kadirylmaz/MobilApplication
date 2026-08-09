// =============================================================================
// Ders Defteri — İleti (Post) Doğrulama Şemaları (Zod)
// =============================================================================

import { z } from 'zod';

export const postSchema = z.object({
  content: z
    .string()
    .min(1, 'İleti içeriği gereklidir')
    .max(4000, 'İleti en fazla 4000 karakter olabilir'),
  video_url: z
    .string()
    .url('Geçerli bir bağlantı girin')
    .max(2000, 'Bağlantı çok uzun')
    .optional()
    .or(z.literal('')),
  group_id: z.string().nullable(),
});

export type PostSchemaValues = z.infer<typeof postSchema>;

export const commentSchema = z.object({
  content: z
    .string()
    .min(1, 'Yorum boş olamaz')
    .max(1000, 'Yorum en fazla 1000 karakter olabilir'),
});

export type CommentSchemaValues = z.infer<typeof commentSchema>;
