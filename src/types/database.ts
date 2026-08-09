// =============================================================================
// Ders Defteri — Supabase Veritabanı TypeScript Tipleri
// =============================================================================
// Bu dosya supabase/schema.sql ile tam uyumlu olacak şekilde elle yazılmıştır.
// Supabase CLI kullanıyorsanız bu dosyayı otomatik üretmek için:
//   npx supabase gen types typescript --project-id <project-id> > src/types/database.ts
// =============================================================================

// -----------------------------------------------------------------------------
// ENUM TİPLERİ
// -----------------------------------------------------------------------------

/** Ders durumu */
export type LessonStatus = 'scheduled' | 'completed' | 'cancelled' | 'compensated';

/** Ödeme durumu */
export type PaymentStatus = 'pending' | 'paid' | 'overdue';

/** Materyal dosya tipi */
export type FileType = 'pdf' | 'image' | 'video' | 'document' | 'other';

/** Kullanıcı rolü */
export type ProfileRole = 'teacher' | 'student' | 'parent';

// -----------------------------------------------------------------------------
// SATIR TİPLERİ (Row — SELECT sonuçları)
// -----------------------------------------------------------------------------

export interface ProfileRow {
  id: string;
  user_id: string | null; // NULL = henüz hesap açmamış (davet bekleyen öğrenci/veli)
  role: ProfileRole;
  full_name: string;
  phone: string | null;
  email: string | null;
  avatar_url: string | null;
  created_at: string; // ISO 8601 string (TIMESTAMPTZ)
  updated_at: string;
}

export interface StudentRow {
  id: string;
  teacher_id: string;
  profile_id: string | null; // öğrenci kendi hesabını açtığında dolar
  full_name: string;
  phone: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  grade: string | null;
  subject: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LessonRow {
  id: string;
  teacher_id: string;
  student_id: string;
  scheduled_at: string; // ISO 8601 string (TIMESTAMPTZ)
  duration_minutes: number;
  topic: string | null;
  notes: string | null;
  status: LessonStatus;
  compensates_lesson_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PaymentRow {
  id: string;
  teacher_id: string;
  student_id: string;
  amount: number; // Supabase DECIMAL → JS number
  payment_date: string | null; // ISO date string (YYYY-MM-DD)
  period_start: string;        // ISO date string (YYYY-MM-DD)
  period_end: string;          // ISO date string (YYYY-MM-DD)
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
}

export interface MaterialRow {
  id: string;
  teacher_id: string;
  student_id: string | null;
  title: string;
  description: string | null;
  file_url: string;
  file_type: FileType | null;
  created_at: string;
}

export interface GroupRow {
  id: string;
  teacher_id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface GroupMemberRow {
  id: string;
  group_id: string;
  student_id: string;
  created_at: string;
}

export interface PostRow {
  id: string;
  teacher_id: string;
  group_id: string | null; // NULL = herkese açık (tüm öğrenci/veliler)
  content: string;
  video_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface PostLikeRow {
  id: string;
  post_id: string;
  profile_id: string;
  created_at: string;
}

export interface PostCommentRow {
  id: string;
  post_id: string;
  profile_id: string;
  content: string;
  created_at: string;
}

export interface TeacherStudentRow {
  id: string;
  teacher_id: string;
  student_id: string;
  created_at: string;
}

export interface ParentStudentRow {
  id: string;
  parent_id: string;
  student_id: string;
  created_at: string;
}

// -----------------------------------------------------------------------------
// INSERT TİPLERİ (veritabanına yeni kayıt eklerken kullanılır)
// -----------------------------------------------------------------------------

export interface ProfileInsert {
  id?: string;
  user_id?: string | null;
  role?: ProfileRole;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  avatar_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface StudentInsert {
  id?: string;
  teacher_id: string;
  profile_id?: string | null;
  full_name: string;
  phone?: string | null;
  parent_name?: string | null;
  parent_phone?: string | null;
  grade?: string | null;
  subject?: string | null;
  notes?: string | null;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface LessonInsert {
  id?: string;
  teacher_id: string;
  student_id: string;
  scheduled_at: string;
  duration_minutes?: number;
  topic?: string | null;
  notes?: string | null;
  status?: LessonStatus;
  compensates_lesson_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PaymentInsert {
  id?: string;
  teacher_id: string;
  student_id: string;
  amount: number;
  payment_date?: string | null;
  period_start: string;
  period_end: string;
  status?: PaymentStatus;
  notes?: string | null;
  created_at?: string;
}

export interface MaterialInsert {
  id?: string;
  teacher_id: string;
  student_id?: string | null;
  title: string;
  description?: string | null;
  file_url: string;
  file_type?: FileType | null;
  created_at?: string;
}

export interface GroupInsert {
  id?: string;
  teacher_id: string;
  name: string;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface GroupMemberInsert {
  id?: string;
  group_id: string;
  student_id: string;
  created_at?: string;
}

export interface PostInsert {
  id?: string;
  teacher_id: string;
  group_id?: string | null;
  content: string;
  video_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface PostLikeInsert {
  id?: string;
  post_id: string;
  profile_id: string;
  created_at?: string;
}

export interface PostCommentInsert {
  id?: string;
  post_id: string;
  profile_id: string;
  content: string;
  created_at?: string;
}

// -----------------------------------------------------------------------------
// UPDATE TİPLERİ (mevcut kaydı güncellerken kullanılır — tüm alanlar opsiyonel)
// -----------------------------------------------------------------------------

export type ProfileUpdate = Partial<Omit<ProfileInsert, 'id' | 'user_id' | 'created_at'>> & Record<string, unknown>;

export type StudentUpdate = Partial<Omit<StudentInsert, 'id' | 'teacher_id' | 'created_at'>> & Record<string, unknown>;

export type LessonUpdate = Partial<Omit<LessonInsert, 'id' | 'teacher_id' | 'created_at'>> & Record<string, unknown>;

export type PaymentUpdate = Partial<Omit<PaymentInsert, 'id' | 'teacher_id' | 'created_at'>> & Record<string, unknown>;

export type MaterialUpdate = Partial<Omit<MaterialInsert, 'id' | 'teacher_id' | 'created_at'>> & Record<string, unknown>;

export type GroupUpdate = Partial<Omit<GroupInsert, 'id' | 'teacher_id' | 'created_at'>> & Record<string, unknown>;

export type PostUpdate = Partial<Omit<PostInsert, 'id' | 'teacher_id' | 'created_at'>> & Record<string, unknown>;

// -----------------------------------------------------------------------------
// ANA DATABASE TİPİ (Supabase client için generic type)
// -----------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: ProfileRow;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      students: {
        Row: StudentRow;
        Insert: StudentInsert;
        Update: StudentUpdate;
        Relationships: [];
      };
      lessons: {
        Row: LessonRow;
        Insert: LessonInsert;
        Update: LessonUpdate;
        Relationships: [];
      };
      payments: {
        Row: PaymentRow;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
        Relationships: [];
      };
      materials: {
        Row: MaterialRow;
        Insert: MaterialInsert;
        Update: MaterialUpdate;
        Relationships: [];
      };
      groups: {
        Row: GroupRow;
        Insert: GroupInsert;
        Update: GroupUpdate;
        Relationships: [];
      };
      group_members: {
        Row: GroupMemberRow;
        Insert: GroupMemberInsert;
        Update: Record<string, never>;
        Relationships: [];
      };
      posts: {
        Row: PostRow;
        Insert: PostInsert;
        Update: PostUpdate;
        Relationships: [];
      };
      post_likes: {
        Row: PostLikeRow;
        Insert: PostLikeInsert;
        Update: Record<string, never>;
        Relationships: [];
      };
      post_comments: {
        Row: PostCommentRow;
        Insert: PostCommentInsert;
        Update: Record<string, never>;
        Relationships: [];
      };
      teacher_student: {
        Row: TeacherStudentRow;
        Insert: Omit<TeacherStudentRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
      parent_student: {
        Row: ParentStudentRow;
        Insert: Omit<ParentStudentRow, 'id' | 'created_at'> & { id?: string; created_at?: string };
        Update: Record<string, never>;
        Relationships: [];
      };
    };
    Views: {
      active_students: {
        Row: StudentRow;
        Relationships: [];
      };
      upcoming_lessons: {
        Row: LessonRow & {
          student_name: string;
          student_grade: string | null;
          student_subject: string | null;
        };
        Relationships: [];
      };
      overdue_payments: {
        Row: PaymentRow & {
          student_name: string;
        };
        Relationships: [];
      };
    };
    Functions: {
      get_teacher_id: {
        Args: Record<string, never>;
        Returns: string;
      };
    };
    Enums: {
      lesson_status: LessonStatus;
      payment_status: PaymentStatus;
      profile_role: ProfileRole;
    };
  };
}

// -----------------------------------------------------------------------------
// TİP KISAYOLLARI (kolaylık için)
// -----------------------------------------------------------------------------

/** Supabase'den gelen ham tablo satırları */
export type Profile = ProfileRow;
export type Student  = StudentRow;
export type Lesson   = LessonRow;
export type Payment  = PaymentRow;
export type Material = MaterialRow;
export type Group    = GroupRow;
export type Post     = PostRow;

/** JOIN'li sorgular için genişletilmiş tipler */
export interface LessonWithStudent extends LessonRow {
  students: Pick<StudentRow, 'id' | 'full_name' | 'grade' | 'subject'>;
}

export interface PaymentWithStudent extends PaymentRow {
  students: Pick<StudentRow, 'id' | 'full_name' | 'grade'>;
}

export interface MaterialWithStudent extends MaterialRow {
  students: Pick<StudentRow, 'id' | 'full_name'> | null;
}

export interface StudentWithStats extends StudentRow {
  /** Toplam ders sayısı */
  total_lessons: number;
  /** Tamamlanan ders sayısı */
  completed_lessons: number;
  /** Bekleyen ödeme tutarı */
  pending_payment_amount: number;
}

/** Grup, üye sayısıyla birlikte */
export interface GroupWithMemberCount extends GroupRow {
  member_count: number;
}

/** İleti, grup adı ve etkileşim sayılarıyla birlikte */
export interface PostWithMeta extends PostRow {
  groups: Pick<GroupRow, 'id' | 'name'> | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}
