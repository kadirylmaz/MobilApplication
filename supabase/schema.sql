-- =============================================================================
-- Ders Defteri — Veritabanı Şeması (Faz 0-3)
-- =============================================================================
-- Bu dosya tüm tabloları, kısıtlamaları, indeksleri ve RLS politikalarını içerir.
-- Supabase Dashboard > SQL Editor bölümünde çalıştırın.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- UZANTI: uuid-ossp (UUID üretimi için)
-- -----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- ENUM TİPLERİ
-- -----------------------------------------------------------------------------

-- Ders durumu
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lesson_status') THEN
    CREATE TYPE lesson_status AS ENUM (
      'scheduled',    -- Planlandı
      'completed',    -- Tamamlandı
      'cancelled',    -- İptal edildi
      'compensated'   -- Telafi yapıldı
    );
  END IF;
END $$;

-- Ödeme durumu
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM (
      'pending',  -- Beklemede
      'paid',     -- Ödendi
      'overdue'   -- Gecikmiş
    );
  END IF;
END $$;

-- Kullanıcı rolü
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_role') THEN
    CREATE TYPE profile_role AS ENUM ('teacher', 'student', 'parent');
  END IF;
END $$;

-- İleti görünürlüğü (bu enum kullanılmıyor; group_id NULL/dolu ile kontrol ediliyor,
-- ileride ihtiyaç halinde eklenebilir — burada sadece dokümantasyon amaçlı bırakılmadı)

-- -----------------------------------------------------------------------------
-- TABLO: profiles
-- Uygulamadaki tüm kullanıcılar (öğretmen/öğrenci/veli) — asıl kimlik/rol kaynağı.
-- Her kullanıcı, Supabase Auth kullanıcısıyla 1:1 ilişkilidir (user_id nullable:
-- öğrenci/veli auth hesabı açmadan önce de bir profil kaydı olabilir).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  role         profile_role NOT NULL DEFAULT 'teacher',
  full_name    TEXT NOT NULL CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 100),
  phone        TEXT CHECK (phone ~ '^[0-9\+\-\s\(\)]{7,20}$'),
  email        TEXT CHECK (email ~* '^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$'),
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.profiles           IS 'Uygulamadaki tüm kullanıcılar (öğretmen/öğrenci/veli)';
COMMENT ON COLUMN public.profiles.user_id   IS 'Supabase Auth kullanıcı ID''si — NULL ise henüz hesap açmamış';
COMMENT ON COLUMN public.profiles.role      IS 'teacher | student | parent';

-- -----------------------------------------------------------------------------
-- TABLO: students
-- Bir öğretmene bağlı öğrenciler. teacher_id, profiles(id) (role='teacher') referans alır.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.students (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  profile_id    UUID REFERENCES public.profiles(id) ON DELETE SET NULL, -- öğrenci kendi hesabını açtığında dolar
  full_name     TEXT NOT NULL CHECK (char_length(full_name) >= 2 AND char_length(full_name) <= 100),
  phone         TEXT CHECK (phone ~ '^[0-9\+\-\s\(\)]{7,20}$'),
  parent_name   TEXT CHECK (char_length(parent_name) <= 100),
  parent_phone  TEXT CHECK (parent_phone ~ '^[0-9\+\-\s\(\)]{7,20}$'),
  grade         TEXT CHECK (char_length(grade) <= 20),      -- Örn: "9. Sınıf", "LGS Hazırlık"
  subject       TEXT CHECK (char_length(subject) <= 100),   -- Örn: "Matematik", "Fizik"
  notes         TEXT CHECK (char_length(notes) <= 2000),
  is_active     BOOLEAN NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.students              IS 'Öğretmene bağlı öğrenciler';
COMMENT ON COLUMN public.students.teacher_id   IS 'Bu öğrencinin sahibi olan öğretmen (profiles.id)';
COMMENT ON COLUMN public.students.profile_id   IS 'Öğrenci kendi hesabını açtığında dolar. Bu fazda NULL.';
COMMENT ON COLUMN public.students.grade        IS 'Öğrencinin sınıf seviyesi (Örn: 9. Sınıf)';
COMMENT ON COLUMN public.students.subject      IS 'Ders konusu (Örn: Matematik)';
COMMENT ON COLUMN public.students.is_active    IS 'FALSE ise öğrenci arşivlenmiş sayılır (soft delete)';

-- -----------------------------------------------------------------------------
-- TABLO: lessons
-- Planlanmış ve geçmiş dersler.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.lessons (
  id                     UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id             UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id             UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  scheduled_at           TIMESTAMPTZ NOT NULL,
  duration_minutes       INTEGER NOT NULL DEFAULT 60
                           CHECK (duration_minutes > 0 AND duration_minutes <= 480),
  topic                  TEXT CHECK (char_length(topic) <= 200),
  notes                  TEXT CHECK (char_length(notes) <= 2000),
  status                 lesson_status NOT NULL DEFAULT 'scheduled',
  compensates_lesson_id  UUID REFERENCES public.lessons(id) ON DELETE SET NULL,
  created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.lessons                        IS 'Planlanmış ve tamamlanmış dersler';
COMMENT ON COLUMN public.lessons.teacher_id             IS 'Dersi veren öğretmen';
COMMENT ON COLUMN public.lessons.student_id             IS 'Dersi alan öğrenci';
COMMENT ON COLUMN public.lessons.scheduled_at           IS 'Dersin başlangıç zamanı (timezone-aware)';
COMMENT ON COLUMN public.lessons.duration_minutes       IS 'Ders süresi dakika cinsinden (1-480)';
COMMENT ON COLUMN public.lessons.topic                  IS 'Ders konusu (Örn: Türev, Limit)';
COMMENT ON COLUMN public.lessons.status                 IS 'scheduled | completed | cancelled | compensated';
COMMENT ON COLUMN public.lessons.compensates_lesson_id  IS 'compensated dersler için: telafi ettiği iptal edilmiş dersin id''si';

-- -----------------------------------------------------------------------------
-- TABLO: payments
-- Öğrencilere ait ödeme kayıtları.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.payments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id    UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  amount        DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  payment_date  DATE,                         -- NULL ise henüz ödenmedi
  period_start  DATE NOT NULL,
  period_end    DATE NOT NULL,
  status        payment_status NOT NULL DEFAULT 'pending',
  notes         TEXT CHECK (char_length(notes) <= 1000),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT valid_period CHECK (period_end >= period_start)
);

COMMENT ON TABLE  public.payments               IS 'Öğrenci ödeme kayıtları';
COMMENT ON COLUMN public.payments.amount        IS 'Ödeme tutarı (TL)';
COMMENT ON COLUMN public.payments.payment_date  IS 'Gerçekleşen ödeme tarihi (NULL = henüz ödenmedi)';
COMMENT ON COLUMN public.payments.period_start  IS 'Ödemenin kapsadığı dönem başlangıcı';
COMMENT ON COLUMN public.payments.period_end    IS 'Ödemenin kapsadığı dönem sonu';
COMMENT ON COLUMN public.payments.status        IS 'pending | paid | overdue';

-- -----------------------------------------------------------------------------
-- TABLO: materials
-- Öğretmenin yüklediği ders materyalleri. student_id NULL olabilir (genel materyal).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.materials (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id    UUID REFERENCES public.students(id) ON DELETE SET NULL,  -- NULL = genel materyal
  title         TEXT NOT NULL CHECK (char_length(title) >= 1 AND char_length(title) <= 200),
  description   TEXT CHECK (char_length(description) <= 1000),
  file_url      TEXT NOT NULL CHECK (char_length(file_url) >= 1),
  file_type     TEXT CHECK (file_type IN ('pdf', 'image', 'video', 'document', 'other')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.materials              IS 'Ders materyalleri (PDF, görsel, belge vb.)';
COMMENT ON COLUMN public.materials.student_id   IS 'NULL ise tüm öğrencilere ait genel materyal';
COMMENT ON COLUMN public.materials.file_url     IS 'Supabase Storage''daki dosya yolu veya harici URL';
COMMENT ON COLUMN public.materials.file_type    IS 'pdf | image | video | document | other';

-- -----------------------------------------------------------------------------
-- TABLO: groups / group_members
-- Öğretmenin oluşturduğu sınıf/gruplar (Sınıfım ve Gruplarım).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.groups (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name         TEXT NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
  description  TEXT CHECK (char_length(description) <= 1000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, name)
);

COMMENT ON TABLE public.groups IS 'Öğretmenin oluşturduğu sınıf/gruplar (Örn: "10-A")';

CREATE TABLE IF NOT EXISTS public.group_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, student_id)
);

COMMENT ON TABLE public.group_members IS 'Bir grubun üyesi olan öğrenciler';

-- -----------------------------------------------------------------------------
-- TABLO: posts / post_likes / post_comments
-- Öğretmenin Ana Sayfa'da paylaştığı iletiler (feed).
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.posts (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  group_id     UUID REFERENCES public.groups(id) ON DELETE SET NULL,
  content      TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 4000),
  video_url    TEXT CHECK (char_length(video_url) <= 2000),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE  public.posts           IS 'Öğretmenin Ana Sayfa''da paylaştığı iletiler';
COMMENT ON COLUMN public.posts.group_id  IS 'NULL ise tüm öğrenci/velilere açık; doluysa yalnızca o gruba özel';
COMMENT ON COLUMN public.posts.video_url IS 'Opsiyonel konu anlatım video linki';

CREATE TABLE IF NOT EXISTS public.post_likes (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (post_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.post_comments (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id     UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  profile_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) >= 1 AND char_length(content) <= 1000),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- TABLO: teacher_student / parent_student
-- Çoklu-öğretmen ve veli-öğrenci senaryoları için şema hazırlığı.
-- Bu fazda hiçbir ekran/store bu tabloları kullanmıyor.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.teacher_student (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  teacher_id  UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (teacher_id, student_id)
);

CREATE TABLE IF NOT EXISTS public.parent_student (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (parent_id, student_id)
);

COMMENT ON TABLE public.teacher_student IS 'Çoklu-öğretmen senaryoları için hazırlık — bu fazda UI kullanmıyor';
COMMENT ON TABLE public.parent_student  IS 'Veli-öğrenci ilişkisi — öğrenci/veli girişi eklendiğinde kullanılacak';

-- =============================================================================
-- UPDATED_AT TETİKLEYİCİLERİ
-- =============================================================================

-- Yardımcı fonksiyon: updated_at alanını otomatik günceller
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- profiles tablosu için tetikleyici
DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- students tablosu için tetikleyici
DROP TRIGGER IF EXISTS set_students_updated_at ON public.students;
CREATE TRIGGER set_students_updated_at
  BEFORE UPDATE ON public.students
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- groups tablosu için tetikleyici
DROP TRIGGER IF EXISTS set_groups_updated_at ON public.groups;
CREATE TRIGGER set_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- posts tablosu için tetikleyici
DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- lessons tablosu için tetikleyici
DROP TRIGGER IF EXISTS set_lessons_updated_at ON public.lessons;
CREATE TRIGGER set_lessons_updated_at
  BEFORE UPDATE ON public.lessons
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- =============================================================================
-- YENİ KULLANICI TETİKLEYİCİSİ
-- Supabase Auth'a yeni kullanıcı kaydolduğunda profiles tablosuna otomatik ekler.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, role, full_name, email)
  VALUES (
    NEW.id,
    'teacher',
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'İsimsiz Öğretmen'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- İNDEKSLER
-- =============================================================================

-- profiles
CREATE INDEX IF NOT EXISTS idx_profiles_user_id
  ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role
  ON public.profiles(role);

-- students
CREATE INDEX IF NOT EXISTS idx_students_teacher_id
  ON public.students(teacher_id);
CREATE INDEX IF NOT EXISTS idx_students_profile_id
  ON public.students(profile_id);
CREATE INDEX IF NOT EXISTS idx_students_is_active
  ON public.students(teacher_id, is_active);
CREATE INDEX IF NOT EXISTS idx_students_full_name
  ON public.students(teacher_id, full_name);

-- lessons
CREATE INDEX IF NOT EXISTS idx_lessons_teacher_id
  ON public.lessons(teacher_id);
CREATE INDEX IF NOT EXISTS idx_lessons_student_id
  ON public.lessons(student_id);
CREATE INDEX IF NOT EXISTS idx_lessons_scheduled_at
  ON public.lessons(teacher_id, scheduled_at DESC);
CREATE INDEX IF NOT EXISTS idx_lessons_status
  ON public.lessons(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_lessons_compensates
  ON public.lessons(compensates_lesson_id);

-- payments
CREATE INDEX IF NOT EXISTS idx_payments_teacher_id
  ON public.payments(teacher_id);
CREATE INDEX IF NOT EXISTS idx_payments_student_id
  ON public.payments(student_id);
CREATE INDEX IF NOT EXISTS idx_payments_status
  ON public.payments(teacher_id, status);
CREATE INDEX IF NOT EXISTS idx_payments_period
  ON public.payments(teacher_id, period_start DESC, period_end DESC);

-- materials
CREATE INDEX IF NOT EXISTS idx_materials_teacher_id
  ON public.materials(teacher_id);
CREATE INDEX IF NOT EXISTS idx_materials_student_id
  ON public.materials(student_id);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Her öğretmen yalnızca kendi verilerine erişebilir.
-- =============================================================================

-- RLS'yi etkinleştir
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

-- -----------------------------------------------------------------------------
-- profiles tablosu RLS politikaları
-- -----------------------------------------------------------------------------

-- Kendi kaydını görebilir
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Kendi kaydını güncelleyebilir
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Kayıt oluşturabilir (trigger ile de oluşturulabildiğinden INSERT'e izin verilir)
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- Yardımcı fonksiyon: giriş yapmış kullanıcının öğretmen profile id'sini döndürür
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.get_teacher_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'teacher' LIMIT 1;
$$;

-- -----------------------------------------------------------------------------
-- students tablosu RLS politikaları
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "students_select_own" ON public.students;
CREATE POLICY "students_select_own"
  ON public.students FOR SELECT
  USING (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "students_insert_own" ON public.students;
CREATE POLICY "students_insert_own"
  ON public.students FOR INSERT
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "students_update_own" ON public.students;
CREATE POLICY "students_update_own"
  ON public.students FOR UPDATE
  USING (teacher_id = public.get_teacher_id())
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "students_delete_own" ON public.students;
CREATE POLICY "students_delete_own"
  ON public.students FOR DELETE
  USING (teacher_id = public.get_teacher_id());

-- -----------------------------------------------------------------------------
-- lessons tablosu RLS politikaları
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "lessons_select_own" ON public.lessons;
CREATE POLICY "lessons_select_own"
  ON public.lessons FOR SELECT
  USING (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "lessons_insert_own" ON public.lessons;
CREATE POLICY "lessons_insert_own"
  ON public.lessons FOR INSERT
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "lessons_update_own" ON public.lessons;
CREATE POLICY "lessons_update_own"
  ON public.lessons FOR UPDATE
  USING (teacher_id = public.get_teacher_id())
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "lessons_delete_own" ON public.lessons;
CREATE POLICY "lessons_delete_own"
  ON public.lessons FOR DELETE
  USING (teacher_id = public.get_teacher_id());

-- -----------------------------------------------------------------------------
-- payments tablosu RLS politikaları
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "payments_select_own" ON public.payments;
CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  USING (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "payments_insert_own" ON public.payments;
CREATE POLICY "payments_insert_own"
  ON public.payments FOR INSERT
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "payments_update_own" ON public.payments;
CREATE POLICY "payments_update_own"
  ON public.payments FOR UPDATE
  USING (teacher_id = public.get_teacher_id())
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "payments_delete_own" ON public.payments;
CREATE POLICY "payments_delete_own"
  ON public.payments FOR DELETE
  USING (teacher_id = public.get_teacher_id());

-- -----------------------------------------------------------------------------
-- materials tablosu RLS politikaları
-- -----------------------------------------------------------------------------

DROP POLICY IF EXISTS "materials_select_own" ON public.materials;
CREATE POLICY "materials_select_own"
  ON public.materials FOR SELECT
  USING (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "materials_insert_own" ON public.materials;
CREATE POLICY "materials_insert_own"
  ON public.materials FOR INSERT
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "materials_update_own" ON public.materials;
CREATE POLICY "materials_update_own"
  ON public.materials FOR UPDATE
  USING (teacher_id = public.get_teacher_id())
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "materials_delete_own" ON public.materials;
CREATE POLICY "materials_delete_own"
  ON public.materials FOR DELETE
  USING (teacher_id = public.get_teacher_id());

-- -----------------------------------------------------------------------------
-- groups / group_members tablosu RLS politikaları
-- -----------------------------------------------------------------------------

ALTER TABLE public.groups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "groups_select_own" ON public.groups;
CREATE POLICY "groups_select_own"
  ON public.groups FOR SELECT
  USING (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "groups_insert_own" ON public.groups;
CREATE POLICY "groups_insert_own"
  ON public.groups FOR INSERT
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "groups_update_own" ON public.groups;
CREATE POLICY "groups_update_own"
  ON public.groups FOR UPDATE
  USING (teacher_id = public.get_teacher_id())
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "groups_delete_own" ON public.groups;
CREATE POLICY "groups_delete_own"
  ON public.groups FOR DELETE
  USING (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "group_members_select_own" ON public.group_members;
CREATE POLICY "group_members_select_own"
  ON public.group_members FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.teacher_id = public.get_teacher_id()));

DROP POLICY IF EXISTS "group_members_insert_own" ON public.group_members;
CREATE POLICY "group_members_insert_own"
  ON public.group_members FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.teacher_id = public.get_teacher_id()));

DROP POLICY IF EXISTS "group_members_delete_own" ON public.group_members;
CREATE POLICY "group_members_delete_own"
  ON public.group_members FOR DELETE
  USING (EXISTS (SELECT 1 FROM public.groups g WHERE g.id = group_id AND g.teacher_id = public.get_teacher_id()));

-- -----------------------------------------------------------------------------
-- posts / post_likes / post_comments tablosu RLS politikaları
-- -----------------------------------------------------------------------------

ALTER TABLE public.posts         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "posts_select_own" ON public.posts;
CREATE POLICY "posts_select_own"
  ON public.posts FOR SELECT
  USING (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "posts_insert_own" ON public.posts;
CREATE POLICY "posts_insert_own"
  ON public.posts FOR INSERT
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "posts_update_own" ON public.posts;
CREATE POLICY "posts_update_own"
  ON public.posts FOR UPDATE
  USING (teacher_id = public.get_teacher_id())
  WITH CHECK (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "posts_delete_own" ON public.posts;
CREATE POLICY "posts_delete_own"
  ON public.posts FOR DELETE
  USING (teacher_id = public.get_teacher_id());

-- post_likes / post_comments: bu fazda öğrenci/veli girişi yok, yalnızca
-- öğretmen kendi post'larının etkileşimlerini görebilir ve kendi profile_id'siyle
-- beğeni/yorum bırakabilir.

DROP POLICY IF EXISTS "post_likes_select_teacher_posts" ON public.post_likes;
CREATE POLICY "post_likes_select_teacher_posts"
  ON public.post_likes FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.teacher_id = public.get_teacher_id()));

DROP POLICY IF EXISTS "post_likes_insert_own" ON public.post_likes;
CREATE POLICY "post_likes_insert_own"
  ON public.post_likes FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "post_likes_delete_own" ON public.post_likes;
CREATE POLICY "post_likes_delete_own"
  ON public.post_likes FOR DELETE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "post_comments_select_teacher_posts" ON public.post_comments;
CREATE POLICY "post_comments_select_teacher_posts"
  ON public.post_comments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.posts p WHERE p.id = post_id AND p.teacher_id = public.get_teacher_id()));

DROP POLICY IF EXISTS "post_comments_insert_own" ON public.post_comments;
CREATE POLICY "post_comments_insert_own"
  ON public.post_comments FOR INSERT
  WITH CHECK (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "post_comments_delete_own" ON public.post_comments;
CREATE POLICY "post_comments_delete_own"
  ON public.post_comments FOR DELETE
  USING (profile_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- -----------------------------------------------------------------------------
-- teacher_student / parent_student tablosu RLS politikaları
-- -----------------------------------------------------------------------------

ALTER TABLE public.teacher_student ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parent_student  ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher_student_select_own" ON public.teacher_student;
CREATE POLICY "teacher_student_select_own"
  ON public.teacher_student FOR SELECT
  USING (teacher_id = public.get_teacher_id());

DROP POLICY IF EXISTS "parent_student_select_own" ON public.parent_student;
CREATE POLICY "parent_student_select_own"
  ON public.parent_student FOR SELECT
  USING (parent_id IN (SELECT id FROM public.profiles WHERE user_id = auth.uid()));

-- =============================================================================
-- GÖRÜNÜMLER (Views) — Sık kullanılan sorgular için
-- =============================================================================

-- Aktif öğrenciler (is_active = true)
CREATE OR REPLACE VIEW public.active_students AS
SELECT * FROM public.students WHERE is_active = TRUE;

-- Yaklaşan dersler (sonraki 7 gün)
CREATE OR REPLACE VIEW public.upcoming_lessons AS
SELECT
  l.*,
  s.full_name   AS student_name,
  s.grade       AS student_grade,
  s.subject     AS student_subject
FROM public.lessons l
JOIN public.students s ON s.id = l.student_id
WHERE
  l.status = 'scheduled'
  AND l.scheduled_at >= NOW()
  AND l.scheduled_at <= NOW() + INTERVAL '7 days'
ORDER BY l.scheduled_at ASC;

-- Gecikmiş ödemeler
CREATE OR REPLACE VIEW public.overdue_payments AS
SELECT
  p.*,
  s.full_name AS student_name
FROM public.payments p
JOIN public.students s ON s.id = p.student_id
WHERE p.status IN ('pending', 'overdue')
  AND p.period_end < CURRENT_DATE
ORDER BY p.period_end ASC;

-- =============================================================================
-- SON KONTROL: tablo listesi
-- =============================================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
