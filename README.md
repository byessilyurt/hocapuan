# HocaPuan (MVP)

HocaPuan, Türkiye'de üniversite öğrencileri için hoca ve ders değerlendirme platformu.

## Özellikler
- E-posta/şifre ile kimlik doğrulama, e-posta doğrulama
- Anonim yorum, yararlı oyları, raporlama
- Üniversite → Bölüm → Hoca kataloğu
- Türkçe arama (aksan/diyakritik duyarlı) ve basit fuzzy
- Moderasyon kuyruğu (admin)
- KVKK, Gizlilik, Kullanım Koşulları, İçerik Kuralları

## Kurulum
1) Bağımlılıklar
```bash
npm install
```

2) Ortam değişkenleri
`.env` oluşturun (bkz. `.env.example`). En azından `DATABASE_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `EMAIL_FROM` ayarlayın.

3) Veritabanı
Neon veya Supabase üzerinde Postgres oluşturun ve `DATABASE_URL` ile bağlayın.
```bash
npm run prisma:generate
npx prisma migrate deploy
npx prisma db seed
```

4) Geliştirme
```bash
npm run dev
```

5) Varsayılan hesaplar
- Admin: `admin@example.com` / `Admin123!@#`
- Kullanıcı: `user@example.com` / `User123!@#`

## Dağıtım
- Frontend+API: Vercel
- DB: Neon/Supabase
- E-posta: Resend veya SMTP

Vercel'de proje oluşturun, env değişkenlerini ekleyin, `npx prisma migrate deploy` ve `npx prisma db seed` çalıştırın (Vercel Postbuild veya yerel).

## Kabul Kriterleri (DoD)
- Kayıt ol, e-posta doğrula, "Boğaziçi" ara, hoca profili aç, anonim yorum gönder (pending), admin onayla, canlı gör.
- Yararlı oy/raporlama çalışır.
- Statik sayfalar ve KVKK bildirimleri görünür.

## Geliştirici Notları
- Arama `GET /api/search`
- Hoca detay `GET /api/instructors/[slug]`
- Yorum oluştur `POST /api/reviews`
- Yararlı oy `POST /api/reviews/[id]/helpful`
- Raporla `POST /api/reviews/[id]/report`
- Moderasyon `GET /api/admin/moderation` ve `POST /api/admin/reviews/[id]/approve|hide|delete`
