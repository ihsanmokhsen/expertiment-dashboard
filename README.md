# Experiment Hub Dashboard

Dashboard untuk menampilkan, mengelola, dan mempublikasikan daftar project eksperimen/internal.

## Fitur
- Daftar project dalam bentuk card.
- Status project: `Experiment`, `Beta`, `Production`.
- Platform project: `v0`, `Base44`, `Lovable`, `Custom`.
- Login admin.
- CRUD project (tambah, edit, hapus) untuk admin.
- Pemilihan icon project via scroll box.
- Data tersimpan di PostgreSQL (Supabase) melalui Prisma.
- Session admin menggunakan cookie `httpOnly`.

## Tech Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS + shadcn/ui components
- Prisma ORM
- Supabase PostgreSQL
- Zod validation

## Struktur Penting
- `app/page.tsx`: halaman utama + UI admin.
- `app/api/projects/*`: API CRUD project.
- `app/api/admin/*`: API login/logout/session admin.
- `prisma/schema.prisma`: schema database.
- `supabase/init.sql`: SQL inisialisasi tabel dan seed awal.
- `.env.example`: template environment variables.

## Prasyarat
- Node.js 18+ (disarankan LTS terbaru)
- npm
- Akun Supabase (project database sudah dibuat)

## Setup Lokal
1. Install dependency:
```bash
npm install
```

2. Copy env:
```bash
cp .env.example .env
```

3. Isi nilai di `.env`:
- `DATABASE_URL` (Supabase transaction pooler, port `6543`)
- `DIRECT_URL` (Supabase direct connection, port `5432`)
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

Contoh format:
```env
DATABASE_URL="postgresql://postgres.<PROJECT-REF>:<PASSWORD>@aws-1-<REGION>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require&schema=public"
DIRECT_URL="postgresql://postgres:<PASSWORD>@db.<PROJECT-REF>.supabase.co:5432/postgres?sslmode=require&schema=public"
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="admin123"
ADMIN_SESSION_TOKEN="ganti-dengan-random-token-panjang"
```

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Jalankan SQL init di Supabase:
- Buka Supabase Dashboard -> SQL Editor
- Copy isi file `supabase/init.sql`
- Jalankan

6. Jalankan aplikasi:
```bash
npm run dev
```

## Script yang Tersedia
- `npm run dev`: jalankan local dev server.
- `npm run build`: build production.
- `npm run start`: jalankan hasil build.
- `npm run prisma:generate`: generate Prisma client.
- `npm run prisma:migrate`: migrasi schema (dev migrate).
- `npm run prisma:push`: push schema ke database.
- `npm run prisma:studio`: buka Prisma Studio.

## Deploy ke Vercel (Tanpa GitHub)
1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login:
```bash
vercel login
```

3. Deploy pertama dari folder project:
```bash
vercel
```

4. Tambahkan environment variables di Vercel Project Settings:
- `DATABASE_URL`
- `DIRECT_URL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SESSION_TOKEN`

5. Deploy production:
```bash
vercel --prod
```

6. Verifikasi:
- Login admin
- Tambah/edit/hapus project
- Cek data di Supabase table `public."Project"`

## Troubleshooting
### Prisma error `P1001` / koneksi DB gagal
- Pastikan host, port, user, password, dan `sslmode=require` benar.
- Cek apakah menggunakan URL Supabase yang sesuai (`pooler` vs `direct`).

### `Module not found: @prisma/client`
Jalankan:
```bash
npm install
npm run prisma:generate
```

### Next dev lock file
Jika ada error lock `.next/dev/lock`, hentikan proses Next.js lama lalu jalankan ulang `npm run dev`.

## Catatan Keamanan
- Jangan commit `.env`.
- Gunakan password database yang kuat.
- Jika kredensial pernah terpapar, segera rotate/reset di Supabase.
