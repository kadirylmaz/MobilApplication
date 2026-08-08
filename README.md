# Ders Defteri

Bağımsız özel ders öğretmenleri için kapsamlı bir öğrenci ve ders yönetim uygulaması. Öğrencileri, dersleri, ödemeleri, veli raporlarını ve ders materyallerini tek bir yerden yönetin.

---

## Teknoloji Yığını

| Katman | Teknoloji |
|---|---|
| Mobil Framework | React Native (Expo SDK 51) |
| Backend / Veritabanı | Supabase (PostgreSQL) |
| Kimlik Doğrulama | Supabase Auth |
| Depolama | Supabase Storage |
| Dil | TypeScript |
| Durum Yönetimi | React Context + Hooks |
| Navigasyon | Expo Router (file-based) |
| UI Bileşenleri | React Native Paper |
| Form Yönetimi | React Hook Form |
| Tarih İşlemleri | date-fns |

---

## Modüller (Fazlar)

### Faz 0 — Proje Altyapısı
- Expo projesi kurulumu
- Supabase bağlantısı ve kimlik doğrulama
- Veritabanı şeması ve RLS politikaları
- TypeScript tip tanımları
- Temel navigasyon yapısı

### Faz 1 — Öğrenci Yönetimi
- Öğrenci ekleme / düzenleme / silme (soft delete)
- Öğrenci detay sayfası
- Öğrenci listesi ve arama / filtreleme
- Veli bilgileri yönetimi

### Faz 2 — Ders Takvimi
- Haftalık ve aylık takvim görünümü
- Ders ekleme / düzenleme / iptal
- Telafi dersi takibi
- Ders durumu yönetimi (planlandı / tamamlandı / iptal / telafi)

### Faz 3 — Ödeme Takibi
- Aylık ödeme planı oluşturma
- Ödeme durumu güncelleme (beklemede / ödendi / gecikmiş)
- Öğrenci bazında ödeme geçmişi
- Gelir özeti ve raporları

### Faz 4 — Veli Raporları
- Otomatik rapor şablonları
- Dönemsel ilerleme raporları
- PDF veya metin formatında rapor dışa aktarma
- WhatsApp / e-posta ile hızlı paylaşım

### Faz 5 — Materyal Yönetimi
- Dosya yükleme (PDF, görsel, belge)
- Öğrenci bazında materyal organizasyonu
- Materyal önizleme ve paylaşım
- Supabase Storage entegrasyonu

### Faz 6 — Gelişmiş Özellikler
- Bildirimler (ders hatırlatıcıları, ödeme uyarıları)
- Çevrimdışı destek (offline-first)
- Yedekleme ve dışa aktarma
- Çoklu öğretmen desteği (opsiyonel)

---

## Kurulum

### Gereksinimler

- Node.js >= 18
- npm >= 9 veya yarn >= 1.22
- Expo CLI (`npm install -g expo-cli`)
- Supabase hesabı ([supabase.com](https://supabase.com))
- iOS: Xcode 15+ / Android: Android Studio (Flamingo+)

### 1. Projeyi Klonlayın

```bash
git clone <repo-url>
cd ders-defteri
npm install
```

### 2. Ortam Değişkenlerini Ayarlayın

```bash
cp .env.example .env
```

`.env` dosyasını açıp Supabase bilgilerinizi girin:

```
EXPO_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

> Supabase Dashboard > Project Settings > API bölümünden URL ve anon key bilgilerine ulaşabilirsiniz.

### 3. Veritabanını Kurun

Supabase Dashboard > SQL Editor bölümünde sırasıyla çalıştırın:

```bash
# 1. Şemayı oluşturun
supabase/schema.sql

# 2. (Opsiyonel) Test verilerini ekleyin
supabase/seed.sql
```

Ya da Supabase CLI kullanıyorsanız:

```bash
supabase db push
```

### 4. Uygulamayı Başlatın

```bash
# Expo Go ile (geliştirme)
npx expo start

# iOS Simulator
npx expo run:ios

# Android Emulator
npx expo run:android
```

---

## Proje Yapısı

```
ders-defteri/
├── supabase/
│   ├── schema.sql          # Veritabanı şeması + RLS politikaları
│   └── seed.sql            # Test verileri
├── src/
│   ├── app/                # Expo Router sayfaları (Faz 2+)
│   │   ├── (auth)/         # Kimlik doğrulama ekranları
│   │   ├── (tabs)/         # Ana sekme navigasyonu
│   │   └── _layout.tsx
│   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   ├── common/
│   │   ├── students/
│   │   ├── lessons/
│   │   └── payments/
│   ├── hooks/              # Özel React hooks
│   ├── lib/
│   │   └── supabase.ts     # Supabase istemci kurulumu
│   ├── services/           # API ve veri servisleri
│   ├── stores/             # Global durum yönetimi
│   └── types/
│       ├── database.ts     # Supabase şema tipleri
│       └── index.ts        # Uygulama tipleri + re-export
├── assets/                 # Görseller, fontlar, ikonlar
├── .env                    # Ortam değişkenleri (git'e eklenmez)
├── .env.example            # Ortam değişkeni şablonu
├── .gitignore
├── app.json                # Expo yapılandırması
├── package.json
├── tsconfig.json
└── README.md
```

---

## Veritabanı Şeması (Faz 0-1)

```
auth.users (Supabase)
    └── teachers (1:1)
            └── students (1:N)
                    ├── lessons (1:N)
                    ├── payments (1:N)
                    └── materials (1:N)
```

---

## Katkıda Bulunma

Bu proje şu an aktif geliştirme aşamasındadır. Hata bildirimi veya özellik önerileri için GitHub Issues kullanabilirsiniz.

---

## Lisans

MIT
