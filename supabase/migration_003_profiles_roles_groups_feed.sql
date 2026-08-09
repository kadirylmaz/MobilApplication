-- =============================================================================
-- Ders Defteri — Migration 003: Rol Tabanlı Kullanıcı Modeli (profiles) +
--                                Sınıfım/Gruplarım + Ana Sayfa (Feed)
-- =============================================================================
-- Bu migration:
--   1) 'teachers' tablosunu kaldırıp yerine rol destekli 'profiles' tablosunu
--      koyar (role: 'teacher' | 'student' | 'parent'). Mevcut teacher kayıtları
--      AYNI ID'LERLE profiles'a taşınır ki students/lessons/payments/materials
--      tablolarındaki teacher_id FK'leri veri UPDATE'i gerekmeden yeniden
--      bağlanabilsin.
--   2) 'groups' / 'group_members' tablolarını ekler (Sınıfım ve Gruplarım).
--   3) 'posts' / 'post_likes' / 'post_comments' tablolarını ekler (Ana Sayfa feed).
--   4) 'teacher_student' / 'parent_student' ilişki tablolarını ekler — bu fazda
--      hiçbir ekran/store tarafından kullanılmıyor, yalnızca ileride öğrenci/veli
--      girişi eklendiğinde şemanın hazır olması için.
--
-- Supabase Dashboard > SQL Editor bölümünde, TEK SEFERDE ve BAŞTAN SONA sırayla
-- çalıştırın. Bloklar arasında FK bağımlılığı olduğu için sıra önemlidir.
-- Gerçek (prod) projede çalıştırmadan önce yedek almanız önerilir.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- ADIM 1: profile_role enum + profiles tablosu
-- -----------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'profile_role') THEN
    CREATE TYPE profile_role AS ENUM ('teacher', 'student', 'parent');
  END IF;
END $$;

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

COMMENT ON TABLE  public.profiles           IS 'Uygulamadaki tüm kullanıcılar (öğretmen/öğrenci/veli) — asıl kimlik/rol kaynağı';
COMMENT ON COLUMN public.profiles.user_id   IS 'Supabase Auth kullanıcı ID''si — NULL ise henüz hesap açmamış (davet bekleyen öğrenci/veli)';
COMMENT ON COLUMN public.profiles.role      IS 'teacher | student | parent';

CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role    ON public.profiles(role);

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- ADIM 2: Mevcut teachers verisini profiles'a taşı — ID'LER KORUNUR
-- -----------------------------------------------------------------------------
-- teacher_id FK'lerinin (students/lessons/payments/materials) veri UPDATE'i
-- gerekmeden yeni tabloya bağlanabilmesi için id aynen taşınır.

INSERT INTO public.profiles (id, user_id, role, full_name, phone, email, created_at, updated_at)
SELECT id, user_id, 'teacher', full_name, phone, email, created_at, created_at
FROM public.teachers
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- ADIM 3: teacher_id FK hedeflerini profiles(id)'ye çevir
-- -----------------------------------------------------------------------------
-- Kolon adı (teacher_id) DEĞİŞMİYOR — sadece REFERENCES hedefi değişiyor.
-- Bu sayede studentStore/lessonStore/paymentStore/RLS policy'leri hiç değişmez.

ALTER TABLE public.students DROP CONSTRAINT IF EXISTS students_teacher_id_fkey;
ALTER TABLE public.students
  ADD CONSTRAINT students_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.lessons DROP CONSTRAINT IF EXISTS lessons_teacher_id_fkey;
ALTER TABLE public.lessons
  ADD CONSTRAINT lessons_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.payments DROP CONSTRAINT IF EXISTS payments_teacher_id_fkey;
ALTER TABLE public.payments
  ADD CONSTRAINT payments_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS materials_teacher_id_fkey;
ALTER TABLE public.materials
  ADD CONSTRAINT materials_teacher_id_fkey
  FOREIGN KEY (teacher_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- ADIM 4: students.profile_id — öğrencinin ileride kendi hesabına bağlanması için
-- -----------------------------------------------------------------------------
-- Bu fazda hiçbir ekran bu kolonu doldurmuyor; şema hazırlığıdır.

ALTER TABLE public.students
  ADD COLUMN IF NOT EXISTS profile_id UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.students.profile_id IS 'Öğrenci kendi hesabını açtığında dolar (role=student). Bu fazda NULL.';

CREATE INDEX IF NOT EXISTS idx_students_profile_id ON public.students(profile_id);

-- -----------------------------------------------------------------------------
-- ADIM 5: get_teacher_id() rewrite — profiles üzerinden çalışacak
-- -----------------------------------------------------------------------------
-- Dış sözleşme (bir UUID döner) korunuyor — studentStore/lessonStore/paymentStore
-- içindeki supabase.rpc('get_teacher_id') çağrıları hiç değişmeden çalışmaya devam eder.

CREATE OR REPLACE FUNCTION public.get_teacher_id()
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT id FROM public.profiles WHERE user_id = auth.uid() AND role = 'teacher' LIMIT 1;
$$;

-- -----------------------------------------------------------------------------
-- ADIM 6: handle_new_user() rewrite — artık sadece profiles'a yazar
-- -----------------------------------------------------------------------------

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
-- Trigger tanımı (on_auth_user_created) zaten schema.sql'de mevcut ve
-- CREATE OR REPLACE FUNCTION ile aynı isim korunduğu için yeniden tanımlanmasına gerek yok.

-- -----------------------------------------------------------------------------
-- ADIM 7: profiles RLS politikaları
-- -----------------------------------------------------------------------------

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Not: students/lessons/payments/materials RLS politikaları DEĞİŞMİYOR.
-- Hepsi "teacher_id = public.get_teacher_id()" kullanıyor ve bu fonksiyon
-- Adım 5'te içeriden güncellendi; dış davranışı aynı kaldığı için politikaları
-- burada tekrar tanımlamaya gerek yok.

-- -----------------------------------------------------------------------------
-- ADIM 8: teachers tablosunu kaldır
-- -----------------------------------------------------------------------------
-- Bu noktada teachers'a bağlı hiçbir FK kalmadı (Adım 3'te hepsi profiles'a
-- taşındı), bu yüzden CASCADE güvenli — sadece teachers'ın kendi RLS
-- politikalarını ve indekslerini temizler.

DROP TABLE IF EXISTS public.teachers CASCADE;

-- -----------------------------------------------------------------------------
-- ADIM 9: groups / group_members (Sınıfım ve Gruplarım)
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

CREATE INDEX IF NOT EXISTS idx_groups_teacher_id ON public.groups(teacher_id);

DROP TRIGGER IF EXISTS set_groups_updated_at ON public.groups;
CREATE TRIGGER set_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TABLE IF NOT EXISTS public.group_members (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id    UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  student_id  UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (group_id, student_id)
);

COMMENT ON TABLE public.group_members IS 'Bir grubun üyesi olan öğrenciler';

CREATE INDEX IF NOT EXISTS idx_group_members_group_id   ON public.group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_student_id ON public.group_members(student_id);

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

-- group_members: sahiplik group üzerinden dolaylı kontrol edilir
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
-- ADIM 10: posts / post_likes / post_comments (Ana Sayfa — Feed)
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

CREATE INDEX IF NOT EXISTS idx_posts_teacher_id  ON public.posts(teacher_id);
CREATE INDEX IF NOT EXISTS idx_posts_group_id    ON public.posts(group_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at  ON public.posts(created_at DESC);

DROP TRIGGER IF EXISTS set_posts_updated_at ON public.posts;
CREATE TRIGGER set_posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

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

CREATE INDEX IF NOT EXISTS idx_post_likes_post_id    ON public.post_likes(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON public.post_comments(post_id);

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
-- (öğretmen olarak) beğeni/yorum bırakabilir. Öğrenci/veli INSERT izinleri
-- o roller eklendiğinde ayrı bir migration'da genişletilecek.

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
-- ADIM 11: teacher_student / parent_student — şema hazırlığı (bu faz UI kullanmıyor)
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

CREATE INDEX IF NOT EXISTS idx_teacher_student_teacher ON public.teacher_student(teacher_id);
CREATE INDEX IF NOT EXISTS idx_teacher_student_student ON public.teacher_student(student_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_parent   ON public.parent_student(parent_id);
CREATE INDEX IF NOT EXISTS idx_parent_student_student  ON public.parent_student(student_id);

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
-- SON KONTROL (migration sonrası Dashboard'da manuel çalıştırılabilir)
-- =============================================================================
-- SELECT count(*) FROM public.profiles WHERE role = 'teacher';
-- SELECT count(*) FROM information_schema.tables WHERE table_name = 'teachers'; -- 0 dönmeli
-- SELECT conname FROM pg_constraint WHERE conrelid = 'public.students'::regclass AND contype = 'f';
-- =============================================================================
