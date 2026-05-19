# Sistem Informasi Wisuda Digital

Sistem validasi undangan wisuda kampus berbasis QR Code dengan fitur realtime.

## Stack

- **Next.js 15** (App Router) + TypeScript
- **TailwindCSS v4** + Shadcn UI
- **Prisma ORM** + PostgreSQL
- **Zustand** (state management)
- **Socket.io** (realtime)
- **html5-qrcode** (QR scanner)

## Roles

| Role | Akses |
|------|-------|
| Super Admin | Full access semua fitur |
| Admin Fakultas | Kelola mahasiswa & undangan per fakultas |
| Petugas Scan | Halaman scanner QR |
| Mahasiswa | Lihat undangan & QR pribadi |

## Struktur Folder

```
src/
├── app/
│   ├── (auth)/login/          # Halaman login
│   ├── (admin)/               # Layout admin (sidebar)
│   │   ├── dashboard/
│   │   ├── mahasiswa/
│   │   ├── undangan/
│   │   └── kehadiran/
│   ├── (scanner)/scan/        # Layout scanner (dark mode)
│   ├── (mahasiswa)/           # Layout mahasiswa
│   │   └── mahasiswa/
│   │       ├── dashboard/
│   │       └── undangan/
│   └── api/                   # REST API routes
├── features/                  # Domain-driven components
│   ├── auth/
│   ├── dashboard/
│   ├── mahasiswa/
│   ├── undangan/
│   ├── scanner/
│   └── kehadiran/
├── components/
│   ├── ui/                    # Shadcn UI components
│   ├── layout/                # Header, sidebar per role
│   └── shared/                # Reusable components
├── services/                  # Business logic (server-side)
├── store/                     # Zustand stores (client-side)
├── hooks/                     # Custom React hooks
├── types/                     # TypeScript types
├── lib/                       # prisma, auth, socket, utils
└── utils/                     # constants, format, qr, token
```

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Konfigurasi environment

Edit `.env`:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/wisuda_digital"
JWT_SECRET="your-super-secret-key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Setup database

```bash
# Generate Prisma client
npm run db:generate

# Push schema ke database
npm run db:push

# Seed data awal
npm run db:seed
```

### 4. Jalankan development server

```bash
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Akun Default (setelah seed)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | superadmin@wisuda.ac.id | password123 |
| Admin Fakultas | admin.teknik@wisuda.ac.id | password123 |
| Petugas Scan | petugas@wisuda.ac.id | password123 |
| Mahasiswa | mahasiswa@wisuda.ac.id | password123 |

## API Endpoints

### Auth
- `POST /api/auth/login` — Login
- `POST /api/auth/logout` — Logout
- `GET  /api/auth/me` — Get current user

### Mahasiswa
- `GET    /api/mahasiswa` — List (dengan filter & pagination)
- `POST   /api/mahasiswa` — Create
- `GET    /api/mahasiswa/:id` — Detail
- `PATCH  /api/mahasiswa/:id` — Update
- `DELETE /api/mahasiswa/:id` — Delete
- `POST   /api/mahasiswa/import` — Bulk import

### Undangan
- `GET  /api/undangan` — List
- `POST /api/undangan` — Generate undangan
- `POST /api/undangan/generate` — Bulk generate

### Kehadiran
- `GET  /api/kehadiran` — List
- `POST /api/kehadiran/scan` — Proses scan QR
- `GET  /api/kehadiran/stats` — Statistik
- `GET  /api/kehadiran/export` — Export CSV

## Scripts

```bash
npm run dev          # Development server
npm run build        # Production build
npm run db:push      # Push schema ke DB
npm run db:migrate   # Jalankan migration
npm run db:seed      # Seed data awal
npm run db:studio    # Buka Prisma Studio
```
# sistem-informasi-wisuda-digital
