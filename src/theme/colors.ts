// =============================================================================
// Ders Defteri — Tasarım Sistemi: Renkler
// =============================================================================
// Kimlik: "defter / kayıt tutma" — sıcak kağıt zemin, koyu mürekkep tipografi,
// turuncu mühür vurgusu. Material'ın soğuk mor-beyazından bilinçli bir kopuş.
// =============================================================================

export const colors = {
  // Mürekkep — başlıklar, birincil metin, ikonlar
  ink: '#1C2333',
  inkSoft: '#4A5268',

  // Kağıt — zemin tonları
  paper: '#FDFBF6',
  paperRaised: '#FFFFFF',
  paperShade: '#E8E2D4',

  // Mühür — birincil vurgu (CTA, aktif durumlar, linkler)
  seal: '#FF6B4A',
  sealSoft: '#FFE4DA',
  sealDeep: '#E24E2E',

  // Defter mavisi — ikincil vurgu (bilgi, program/takvim modülü)
  slate: '#3D5A80',
  slateSoft: '#E1E8F0',

  // Defter yeşili — pozitif durumlar (ödeme alındı, aktif öğrenci)
  moss: '#5F7A5A',
  mossSoft: '#E3EBDF',

  // Uyarı — negatif durumlar (gecikmiş ödeme, pasif kayıt)
  rust: '#B3492E',
  rustSoft: '#F5E1DA',

  // Nötr aralık — kenarlıklar, ikincil metin, devre dışı
  border: '#E8E2D4',
  borderStrong: '#D8CFBA',
  textSecondary: '#6B6456',
  textMuted: '#9C9584',
} as const;
