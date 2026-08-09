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

// -----------------------------------------------------------------------------
// SATIR TİPLERİ (Row — SELECT sonuçları)
// -----------------------------------------------------------------------------

export interface TeacherRow {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  created_at: string; // ISO 8601 string (TIMESTAMPTZ)
}

export interface StudentRow {
  id: string;
  teacher_id: string;
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

// -----------------------------------------------------------------------------
// INSERT TİPLERİ (veritabanına yeni kayıt eklerken kullanılır)
// -----------------------------------------------------------------------------

export interface TeacherInsert {
  id?: string;
  user_id: string;
  full_name: string;
  phone?: string | null;
  email?: string | null;
  created_at?: string;
}

export interface StudentInsert {
  id?: string;
  teacher_id: string;
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

// -----------------------------------------------------------------------------
// UPDATE TİPLERİ (mevcut kaydı güncellerken kullanılır — tüm alanlar opsiyonel)
// -----------------------------------------------------------------------------

export type TeacherUpdate = Partial<Omit<TeacherInsert, 'id' | 'user_id' | 'created_at'>>;

export type StudentUpdate = Partial<Omit<StudentInsert, 'id' | 'teacher_id' | 'created_at'>>;

export type LessonUpdate = Partial<Omit<LessonInsert, 'id' | 'teacher_id' | 'created_at'>>;

export type PaymentUpdate = Partial<Omit<PaymentInsert, 'id' | 'teacher_id' | 'created_at'>>;

export type MaterialUpdate = Partial<Omit<MaterialInsert, 'id' | 'teacher_id' | 'created_at'>>;

// -----------------------------------------------------------------------------
// ANA DATABASE TİPİ (Supabase client için generic type)
// -----------------------------------------------------------------------------

export interface Database {
  public: {
    Tables: {
      teachers: {
        Row: TeacherRow;
        Insert: TeacherInsert;
        Update: TeacherUpdate;
      };
      students: {
        Row: StudentRow;
        Insert: StudentInsert;
        Update: StudentUpdate;
      };
      lessons: {
        Row: LessonRow;
        Insert: LessonInsert;
        Update: LessonUpdate;
      };
      payments: {
        Row: PaymentRow;
        Insert: PaymentInsert;
        Update: PaymentUpdate;
      };
      materials: {
        Row: MaterialRow;
        Insert: MaterialInsert;
        Update: MaterialUpdate;
      };
    };
    Views: {
      active_students: {
        Row: StudentRow;
      };
      upcoming_lessons: {
        Row: LessonRow & {
          student_name: string;
          student_grade: string | null;
          student_subject: string | null;
        };
      };
      overdue_payments: {
        Row: PaymentRow & {
          student_name: string;
        };
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
    };
  };
}

// -----------------------------------------------------------------------------
// TİP KISAYOLLARI (kolaylık için)
// -----------------------------------------------------------------------------

/** Supabase'den gelen ham tablo satırları */
export type Teacher  = TeacherRow;
export type Student  = StudentRow;
export type Lesson   = LessonRow;
export type Payment  = PaymentRow;
export type Material = MaterialRow;

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
