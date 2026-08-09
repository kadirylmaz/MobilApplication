// =============================================================================
// Ders Defteri — Uygulama Tipleri
// =============================================================================
// Veritabanı tiplerini re-export eder ve uygulama katmanına özgü ek tipler
// tanımlar (form tipleri, UI state tipleri, navigasyon tipleri vb.).
// =============================================================================

// -----------------------------------------------------------------------------
// Veritabanı tiplerini re-export et
// -----------------------------------------------------------------------------

export type {
  // Enum'lar
  LessonStatus,
  PaymentStatus,
  FileType,
  ProfileRole,

  // Satır tipleri
  ProfileRow,
  StudentRow,
  LessonRow,
  PaymentRow,
  MaterialRow,
  GroupRow,
  GroupMemberRow,
  PostRow,
  PostLikeRow,
  PostCommentRow,
  TeacherStudentRow,
  ParentStudentRow,

  // Insert tipleri
  ProfileInsert,
  StudentInsert,
  LessonInsert,
  PaymentInsert,
  MaterialInsert,
  GroupInsert,
  GroupMemberInsert,
  PostInsert,
  PostLikeInsert,
  PostCommentInsert,

  // Update tipleri
  ProfileUpdate,
  StudentUpdate,
  LessonUpdate,
  PaymentUpdate,
  MaterialUpdate,
  GroupUpdate,
  PostUpdate,

  // Kısayollar
  Profile,
  Student,
  Lesson,
  Payment,
  Material,
  Group,
  Post,

  // JOIN tipleri
  LessonWithStudent,
  PaymentWithStudent,
  MaterialWithStudent,
  StudentWithStats,
  GroupWithMemberCount,
  PostWithMeta,

  // Ana Database tipi
  Database,
} from './database';

// -----------------------------------------------------------------------------
// FORM TİPLERİ
// React Hook Form ile kullanım için — veritabanı Insert tiplerine göre ama
// kullanıcı girdisini modelleyen (string tarih yerine Date nesnesi vb.)
// -----------------------------------------------------------------------------

export interface StudentFormValues {
  full_name: string;
  phone: string;
  parent_name: string;
  parent_phone: string;
  grade: string;
  subject: string;
  notes: string;
  is_active: boolean;
}

export interface LessonFormValues {
  student_id: string;
  scheduled_date: string;   // YYYY-MM-DD
  scheduled_time: string;   // HH:mm
  duration_minutes: number;
  topic: string;
  notes: string;
  status: import('./database').LessonStatus;
}

export interface PaymentFormValues {
  student_id: string;
  amount: string;           // Form'da string, kaydederken number'a çevrilir
  payment_date: string;     // YYYY-MM-DD veya boş string
  period_start: string;     // YYYY-MM-DD
  period_end: string;       // YYYY-MM-DD
  status: import('./database').PaymentStatus;
  notes: string;
}

export interface MaterialFormValues {
  student_id: string | null;
  title: string;
  description: string;
  file_type: import('./database').FileType | null;
}

export interface TeacherProfileFormValues {
  full_name: string;
  phone: string;
  email: string;
}

export interface GroupFormValues {
  name: string;
  description: string;
}

export interface PostFormValues {
  content: string;
  video_url: string;
  group_id: string | null; // null = herkese açık
}

export interface CommentFormValues {
  content: string;
}

// -----------------------------------------------------------------------------
// AUTH TİPLERİ
// -----------------------------------------------------------------------------

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends AuthCredentials {
  full_name: string;
}

// -----------------------------------------------------------------------------
// UI STATE TİPLERİ
// -----------------------------------------------------------------------------

/** Genel asenkron işlem durumu */
export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error';

/** Genel API yanıt sarmalayıcı */
export interface ApiResult<T> {
  data: T | null;
  error: string | null;
  status: AsyncStatus;
}

/** Öğrenci listesi filtreleme seçenekleri */
export interface StudentFilters {
  search: string;
  grade: string | null;
  subject: string | null;
  is_active: boolean | null; // null = tümü
}

/** Ders listesi filtreleme seçenekleri */
export interface LessonFilters {
  student_id: string | null;
  status: import('./database').LessonStatus | null;
  date_from: string | null;  // YYYY-MM-DD
  date_to: string | null;    // YYYY-MM-DD
}

/** Ödeme listesi filtreleme seçenekleri */
export interface PaymentFilters {
  student_id: string | null;
  status: import('./database').PaymentStatus | null;
  period_start: string | null;
  period_end: string | null;
}

// -----------------------------------------------------------------------------
// NAVIGASYON TİPLERİ (Expo Router — file-based routing)
// -----------------------------------------------------------------------------

/** Ana sekme navigator'ı route isimleri */
export type TabRoute = 'index' | 'students' | 'lessons' | 'payments' | 'profile';

/** Öğrenci detay sayfası parametreleri */
export interface StudentDetailParams {
  id: string;
}

/** Ders detay sayfası parametreleri */
export interface LessonDetailParams {
  id: string;
}

/** Ödeme detay sayfası parametreleri */
export interface PaymentDetailParams {
  id: string;
}

// -----------------------------------------------------------------------------
// RAPOR TİPLERİ (Faz 4 için hazırlık)
// -----------------------------------------------------------------------------

export interface StudentReport {
  student: import('./database').StudentRow;
  period_start: string;
  period_end: string;
  total_lessons: number;
  completed_lessons: number;
  cancelled_lessons: number;
  topics_covered: string[];
  teacher_notes: string;
  generated_at: string;
}

// -----------------------------------------------------------------------------
// DASHBOARD / ÖZET TİPLERİ
// -----------------------------------------------------------------------------

export interface DashboardStats {
  active_students_count: number;
  upcoming_lessons_count: number;
  this_month_completed_lessons: number;
  this_month_revenue: number;
  pending_payments_count: number;
  overdue_payments_count: number;
}

export interface UpcomingLesson {
  id: string;
  student_name: string;
  student_grade: string | null;
  subject: string | null;
  scheduled_at: string;
  duration_minutes: number;
  topic: string | null;
}
