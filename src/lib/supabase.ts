// =============================================================================
// Ders Defteri — Supabase İstemci Kurulumu
// =============================================================================
// Supabase istemcisini oluşturur, yapılandırır ve dışa aktarır.
// Ayrıca sık kullanılan yardımcı fonksiyonları sağlar.
// =============================================================================

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types/database';

// -----------------------------------------------------------------------------
// ORTAM DEĞİŞKENLERİ
// -----------------------------------------------------------------------------
// Expo, "EXPO_PUBLIC_" ön ekine sahip değişkenleri otomatik olarak
// process.env üzerinden erişilebilir kılar. .env dosyasına bakın.

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://your-project.supabase.co') {
  throw new Error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_URL tanımlı değil veya varsayılan değer kullanılıyor.\n' +
    '.env dosyasını kontrol edin.',
  );
}

if (!supabaseAnonKey || supabaseAnonKey === 'your-anon-key-here') {
  throw new Error(
    '[Supabase] EXPO_PUBLIC_SUPABASE_ANON_KEY tanımlı değil veya varsayılan değer kullanılıyor.\n' +
    '.env dosyasını kontrol edin.',
  );
}

// -----------------------------------------------------------------------------
// SUPABASe İSTEMCİSİ
// -----------------------------------------------------------------------------

export const supabase: SupabaseClient<Database> = createClient<Database>(
  supabaseUrl,
  supabaseAnonKey,
  {
    auth: {
      // React Native'de token'ları AsyncStorage'da sakla (güvenli persist)
      storage: AsyncStorage,
      // Token yenilemeyi otomatik yönet
      autoRefreshToken: true,
      // Uygulama açıkken oturumu koru
      persistSession: true,
      // URL tabanlı oturum tespitini devre dışı bırak (native app)
      detectSessionInUrl: false,
    },
    global: {
      headers: {
        'x-app-name': 'ders-defteri',
        'x-app-version': '1.0.0',
      },
    },
    // Bağlantı havuzu (realtime için)
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  },
);

// -----------------------------------------------------------------------------
// AUTH YARDIMCI FONKSİYONLARI
// -----------------------------------------------------------------------------

/**
 * Mevcut giriş yapmış kullanıcıyı döndürür.
 * Oturum yoksa null döner.
 */
export async function getCurrentUser() {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    return null;
  }

  return user;
}

/**
 * Mevcut oturumu döndürür.
 */
export async function getSession() {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error('[Supabase] getSession hatası:', error.message);
    return null;
  }

  return session;
}

/**
 * E-posta ve şifre ile giriş yapar.
 */
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Yeni kullanıcı kaydı oluşturur.
 * `full_name`, Auth trigger tarafından teachers tablosuna yazılır.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  fullName: string,
) {
  const { data, error } = await supabase.auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: {
      data: {
        full_name: fullName.trim(),
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Mevcut kullanıcının oturumunu kapatır.
 */
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/**
 * Şifre sıfırlama e-postası gönderir.
 */
export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(
    email.trim().toLowerCase(),
  );
  if (error) throw error;
}

// -----------------------------------------------------------------------------
// VERİTABANI YARDIMCI FONKSİYONLARI
// -----------------------------------------------------------------------------

/**
 * Giriş yapmış kullanıcıya ait öğretmen profilini döndürür.
 * Uygulama boyunca context üzerinden paylaşmak için kullanın.
 */
export async function getTeacherProfile() {
  const user = await getCurrentUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .eq('role', 'teacher')
    .single();

  if (error) {
    console.error('[Supabase] getTeacherProfile hatası:', error.message);
    return null;
  }

  return data;
}

/**
 * Öğretmenin aktif öğrenci listesini döndürür.
 */
export async function getActiveStudents() {
  const { data, error } = await supabase
    .from('students')
    .select('*')
    .eq('is_active', true)
    .order('full_name', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Belirtilen tarih aralığındaki dersleri öğrenci bilgileriyle birlikte döndürür.
 */
export async function getLessonsInRange(dateFrom: string, dateTo: string) {
  const { data, error } = await supabase
    .from('lessons')
    .select(`
      *,
      students (
        id,
        full_name,
        grade,
        subject
      )
    `)
    .gte('scheduled_at', dateFrom)
    .lte('scheduled_at', dateTo)
    .order('scheduled_at', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

/**
 * Bekleyen ve gecikmiş ödemeleri öğrenci bilgileriyle birlikte döndürür.
 */
export async function getPendingPayments() {
  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      students (
        id,
        full_name,
        grade
      )
    `)
    .in('status', ['pending', 'overdue'])
    .order('period_end', { ascending: true });

  if (error) throw error;
  return data ?? [];
}

// -----------------------------------------------------------------------------
// STORAGE YARDIMCI FONKSİYONLARI (Faz 5 için hazırlık)
// -----------------------------------------------------------------------------

/** Supabase Storage bucket adı */
export const MATERIALS_BUCKET = 'materials';

/**
 * Dosyanın genel erişim URL'ini döndürür.
 */
export function getPublicUrl(filePath: string): string {
  const { data } = supabase.storage
    .from(MATERIALS_BUCKET)
    .getPublicUrl(filePath);
  return data.publicUrl;
}

/**
 * Dosyayı Storage'a yükler ve yüklenen dosyanın yolunu döndürür.
 * @param teacherId  - Dosya sahibi öğretmenin ID'si
 * @param fileName   - Orijinal dosya adı
 * @param fileData   - Yüklenecek ArrayBuffer veya Blob
 * @param mimeType   - Dosyanın MIME tipi
 */
export async function uploadMaterial(
  teacherId: string,
  fileName: string,
  fileData: ArrayBuffer | Blob,
  mimeType: string,
): Promise<string> {
  const timestamp = Date.now();
  const sanitizedName = fileName.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `${teacherId}/${timestamp}_${sanitizedName}`;

  const { error } = await supabase.storage
    .from(MATERIALS_BUCKET)
    .upload(filePath, fileData, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw error;
  return filePath;
}

// -----------------------------------------------------------------------------
// REALTIME YARDIMCI FONKSİYONLARI (Faz 6 için hazırlık)
// -----------------------------------------------------------------------------

/**
 * Belirli bir öğrencinin derslerini dinleyen realtime aboneliği oluşturur.
 * Dönen aboneliği bileşen unmount olduğunda `.unsubscribe()` ile kaldırın.
 */
export function subscribeToStudentLessons(
  studentId: string,
  onUpdate: (payload: unknown) => void,
) {
  return supabase
    .channel(`lessons:student:${studentId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'lessons',
        filter: `student_id=eq.${studentId}`,
      },
      onUpdate,
    )
    .subscribe();
}

export default supabase;
