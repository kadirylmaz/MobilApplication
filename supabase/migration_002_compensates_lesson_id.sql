-- =============================================================================
-- Ders Defteri — Migration 002: Telafi Ders Takibi
-- =============================================================================
-- Mevcut bir Supabase projesine uygulamak için Dashboard > SQL Editor'da
-- çalıştırın. schema.sql zaten güncel olduğu için sıfırdan kurulumlarda bu
-- dosyaya gerek yoktur.
-- =============================================================================

ALTER TABLE public.lessons
  ADD COLUMN IF NOT EXISTS compensates_lesson_id UUID
    REFERENCES public.lessons(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.lessons.compensates_lesson_id
  IS 'compensated dersler için: telafi ettiği iptal edilmiş dersin id''si';

CREATE INDEX IF NOT EXISTS idx_lessons_compensates
  ON public.lessons(compensates_lesson_id);
