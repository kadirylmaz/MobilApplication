-- =============================================================================
-- Ders Defteri — Test Verileri (seed.sql)
-- =============================================================================
-- UYARI: Bu dosyayı yalnızca geliştirme / test ortamında çalıştırın.
-- Üretim veritabanında KULLANMAYIN.
--
-- Çalıştırmadan önce:
--   1. schema.sql dosyasını çalıştırmış olun.
--   2. Supabase Auth panelinden test kullanıcısı oluşturun:
--      Email: test@dersdefteri.com  |  Şifre: Test1234!
--   3. Aşağıdaki SEED_USER_ID değerini oluşturulan kullanıcının UUID'si ile değiştirin.
-- =============================================================================

-- =============================================================================
-- YAPILANDIRMA
-- =============================================================================

-- !! BURAYI DEĞİŞTİRİN !!
-- Supabase Auth > Users bölümünden test kullanıcısının UUID'sini kopyalayın.
DO $$
DECLARE
  v_user_id     UUID := '00000000-0000-0000-0000-000000000001'; -- <-- DEĞİŞTİR
  v_teacher_id  UUID;
  v_student1_id UUID;
  v_student2_id UUID;
  v_student3_id UUID;
BEGIN

-- =============================================================================
-- 1. ÖĞRETMEN
-- =============================================================================
-- Auth trigger zaten oluşturmuş olabilir; varsa güncelle, yoksa ekle.
INSERT INTO public.teachers (user_id, full_name, phone, email)
VALUES (
  v_user_id,
  'Ayşe Kaya',
  '0532 111 22 33',
  'test@dersdefteri.com'
)
ON CONFLICT (user_id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      phone     = EXCLUDED.phone,
      email     = EXCLUDED.email;

SELECT id INTO v_teacher_id
FROM public.teachers
WHERE user_id = v_user_id;

RAISE NOTICE 'Öğretmen ID: %', v_teacher_id;

-- =============================================================================
-- 2. ÖĞRENCİLER (3 adet)
-- =============================================================================

-- Öğrenci 1: Aktif, Matematik öğrencisi
INSERT INTO public.students (
  id, teacher_id, full_name, phone,
  parent_name, parent_phone, grade, subject, notes, is_active
) VALUES (
  uuid_generate_v4(), v_teacher_id,
  'Mehmet Yılmaz', '0541 333 44 55',
  'Hasan Yılmaz', '0533 444 55 66',
  '11. Sınıf', 'Matematik',
  'YKS hazırlık. Türev ve integral konularında desteğe ihtiyacı var.',
  TRUE
) RETURNING id INTO v_student1_id;

-- Öğrenci 2: Aktif, Fizik + Matematik
INSERT INTO public.students (
  id, teacher_id, full_name, phone,
  parent_name, parent_phone, grade, subject, notes, is_active
) VALUES (
  uuid_generate_v4(), v_teacher_id,
  'Zeynep Arslan', NULL,
  'Fatma Arslan', '0544 666 77 88',
  '9. Sınıf', 'Fizik',
  'Kuvvet ve hareket konularını pekiştiriyor. Çok çalışkan.',
  TRUE
) RETURNING id INTO v_student2_id;

-- Öğrenci 3: Aktif, LGS hazırlık
INSERT INTO public.students (
  id, teacher_id, full_name, phone,
  parent_name, parent_phone, grade, subject, notes, is_active
) VALUES (
  uuid_generate_v4(), v_teacher_id,
  'Ali Can Demir', NULL,
  'Mustafa Demir', '0555 888 99 00',
  '8. Sınıf', 'Matematik',
  'LGS hazırlık. Problem çözme hızını artırmak gerekiyor.',
  TRUE
) RETURNING id INTO v_student3_id;

RAISE NOTICE 'Öğrenci 1 ID: %', v_student1_id;
RAISE NOTICE 'Öğrenci 2 ID: %', v_student2_id;
RAISE NOTICE 'Öğrenci 3 ID: %', v_student3_id;

-- =============================================================================
-- 3. DERSLER (5 adet)
-- =============================================================================

-- Ders 1: Tamamlanmış ders (Mehmet - Matematik)
INSERT INTO public.lessons (
  teacher_id, student_id, scheduled_at,
  duration_minutes, topic, notes, status
) VALUES (
  v_teacher_id, v_student1_id,
  NOW() - INTERVAL '7 days',
  90,
  'Türev — Temel Kurallar',
  'Öğrenci limit konusunu iyi kavramış. Türeve giriş yapıldı, çarpım ve bölüm kuralları çalışıldı.',
  'completed'
);

-- Ders 2: Tamamlanmış ders (Zeynep - Fizik)
INSERT INTO public.lessons (
  teacher_id, student_id, scheduled_at,
  duration_minutes, topic, notes, status
) VALUES (
  v_teacher_id, v_student2_id,
  NOW() - INTERVAL '5 days',
  60,
  'Newton''un Hareket Yasaları',
  '1. ve 2. yasalar işlendi. Sürtünme kuvveti problemleri çözüldü.',
  'completed'
);

-- Ders 3: Planlanmış ders (Ali Can - Matematik)
INSERT INTO public.lessons (
  teacher_id, student_id, scheduled_at,
  duration_minutes, topic, notes, status
) VALUES (
  v_teacher_id, v_student3_id,
  NOW() + INTERVAL '2 days',
  60,
  'Oran-Orantı ve Yüzde Hesapları',
  NULL,
  'scheduled'
);

-- Ders 4: Planlanmış ders (Mehmet - Matematik)
INSERT INTO public.lessons (
  teacher_id, student_id, scheduled_at,
  duration_minutes, topic, notes, status
) VALUES (
  v_teacher_id, v_student1_id,
  NOW() + INTERVAL '3 days',
  90,
  'Türev — Zincir Kuralı ve Uygulamaları',
  'Önceki derste temel kurallar işlendi. Bu hafta zincir kuralına geçilecek.',
  'scheduled'
);

-- Ders 5: İptal edilmiş ders (Zeynep - Fizik)
INSERT INTO public.lessons (
  teacher_id, student_id, scheduled_at,
  duration_minutes, topic, notes, status
) VALUES (
  v_teacher_id, v_student2_id,
  NOW() - INTERVAL '3 days',
  60,
  'Enerji ve İş',
  'Öğrenci hasta olduğu için iptal edildi. Telafi planlanacak.',
  'cancelled'
);

-- =============================================================================
-- 4. ÖDEMELER (3 adet)
-- =============================================================================

-- Ödeme 1: Temmuz ödemesi — ödendi (Mehmet)
INSERT INTO public.payments (
  teacher_id, student_id, amount,
  payment_date, period_start, period_end,
  status, notes
) VALUES (
  v_teacher_id, v_student1_id,
  2400.00,
  CURRENT_DATE - INTERVAL '10 days',
  '2026-07-01', '2026-07-31',
  'paid',
  'Nakit ödeme alındı.'
);

-- Ödeme 2: Ağustos ödemesi — beklemede (Zeynep)
INSERT INTO public.payments (
  teacher_id, student_id, amount,
  payment_date, period_start, period_end,
  status, notes
) VALUES (
  v_teacher_id, v_student2_id,
  1800.00,
  NULL,
  '2026-08-01', '2026-08-31',
  'pending',
  'Ay sonu ödenecek.'
);

-- Ödeme 3: Temmuz ödemesi — gecikmiş (Ali Can)
INSERT INTO public.payments (
  teacher_id, student_id, amount,
  payment_date, period_start, period_end,
  status, notes
) VALUES (
  v_teacher_id, v_student3_id,
  1600.00,
  NULL,
  '2026-07-01', '2026-07-31',
  'overdue',
  'Veliye hatırlatma yapılacak.'
);

RAISE NOTICE 'Seed verileri başarıyla eklendi!';
RAISE NOTICE 'Öğretmen: Ayşe Kaya | Öğrenci sayısı: 3 | Ders sayısı: 5 | Ödeme sayısı: 3';

END $$;

-- =============================================================================
-- DOĞRULAMA SORGULARI
-- =============================================================================
-- Verilerin doğru eklendiğini kontrol etmek için aşağıdaki sorguları çalıştırın:

-- SELECT 'teachers' AS tablo, COUNT(*) AS adet FROM public.teachers
-- UNION ALL
-- SELECT 'students', COUNT(*) FROM public.students
-- UNION ALL
-- SELECT 'lessons',  COUNT(*) FROM public.lessons
-- UNION ALL
-- SELECT 'payments', COUNT(*) FROM public.payments;
