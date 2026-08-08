// =============================================================================
// Ders Defteri — Navigasyon Parametre Tipleri (Expo Router useLocalSearchParams)
// =============================================================================

/** Öğrenci detay sayfası URL parametreleri */
export interface StudentDetailParams {
  id: string;
}

/** Öğrenci düzenleme sayfası URL parametreleri */
export interface StudentEditParams {
  id: string;
}

/** Ders detay sayfası URL parametreleri */
export interface LessonDetailParams {
  id: string;
}

/** Yeni ders sayfası URL parametreleri — öğrenci ön seçimi isteğe bağlı */
export interface NewLessonParams {
  student_id?: string;
}
