# Dokumen Analisis Sistem Informasi Wisuda Digital (Skripsi)

Dokumen ini disusun sebagai bahan komprehensif pendukung penyusunan Bab 3 (Metodologi/Perancangan) dan Bab 4 (Implementasi/Pembahasan) Tugas Akhir/Skripsi.

---

## 1. Spesifikasi Teknologi & Stack (Tech Stack & Architecture)

Sistem ini dirancang menggunakan pendekatan modern berbasis *monorep-like structure* di dalam Next.js App Router.

| Komponen Stack | Teknologi / Pustaka | Peran & Deskripsi |
| :--- | :--- | :--- |
| **Framework Utama** | Next.js 16.2.6 (React 19) | Menyediakan routing cepat (*App Router*), *Server-Side Rendering* (SSR), serta API Route Handlers. |
| **Bahasa Pemrograman**| TypeScript | Menjamin keamanan tipe (*type safety*) dan efisiensi penulisan kode terstruktur. |
| **Database Engine** | PostgreSQL | Penyimpanan data relasional transaksional (mahasiswa, scan, kehadiran). |
| **ORM / Data Access** | Prisma ORM 7.8.0 | Mengabstraksikan query SQL ke bentuk Javascript/TypeScript API dengan automasi migrasi schema. |
| **Styling & UI Kit** | TailwindCSS v4 + Radix UI | Desain visual adaptif, modern, ultra-cepat, dan memiliki performa rendering tinggi. |
| **State Management** | Zustand 5.0.13 | Mengelola *global state* di sisi client secara ringan tanpa *boilerplate* berlebihan. |
| **Realtime Sync** | Socket.io 4.8.3 | Sinkronisasi status kehadiran instan saat pemindaian QR Code antara petugas scan dan dashboard. |
| **QR Code Scanner** | html5-qrcode 2.3.8 | Akses kamera client untuk memindai QR Code tiket wisudawan secara realtime. |
| **Generator QR Code** | qrcode 1.5.4 | Membuat data URL gambar QR Code berdasarkan token acak unik untuk tiket wisuda. |
| **Document Generator**| jspdf 4.2.1 + html2canvas | Pembuatan tiket cetak e-Undangan PDF langsung di sisi peramban (*client-side*). |
| **Data Importer** | xlsx 0.18.5 | Parser spreadsheet untuk fitur impor data massal (*bulk import*) mahasiswa berformat Excel. |
| **Autentikasi** | JSON Web Tokens (JWT) + bcryptjs | Mekanisme pengamanan sesi API dan enkripsi *password* pengguna menggunakan algoritma Blowfish. |

---

## 2. Struktur Folder & Perancangan File (AppDev Structure)

| Direktori Utama | Sub-Direktori/File | Penjelasan Arsitektur |
| :--- | :--- | :--- |
| `src/app/` | `api/` | Berisi route handlers untuk melayani request RESTful API. |
| | `(admin)/` | Layout, dashboard, kelola mahasiswa, kehadiran, laporan, pengaturan, & monitoring kursi untuk admin. |
| | `(mahasiswa)/` | Halaman dashboard mahasiswa untuk memantau status kelulusan & tiket undangan. |
| | `(petugas)/` | Antarmuka khusus petugas untuk mengakses modul pemindai QR Code. |
| | `login/` | Halaman gerbang masuk (autentikasi) tunggal multi-peran. |
| `src/features/` | `auth/`, `mahasiswa/`, etc. | Komponen internal, hooks, dan fungsi logic terisolasi per domain bisnis. |
| `src/components/` | `ui/` | Komponen visual dasar reusable (Buttons, Modals, Cards, Dialogs). |
| | `layout/` | Navigasi utama, Sidebar dinamis, dan Header pembatas otorisasi peran. |
| `src/store/` | Zustand Stores | Penjaga konsistensi data client (misal: data session, state scanner). |
| `src/lib/` | `prisma.ts`, `socket.ts` | Konfigurasi instance koneksi eksternal yang diinisialisasi sekali (*singleton*). |

---

## 3. Entity Relationship Diagram (ERD)

Berikut adalah visualisasi database relasional yang dirancang menggunakan Prisma ORM dan PostgreSQL:

```mermaid
erDiagram
    users ||--o| mahasiswa : "memiliki profil"
    users {
        String id PK
        String name
        String email UK
        String password
        UserRole role
        String fakultas
        DateTime createdAt
        DateTime updatedAt
    }
    
    mahasiswa ||--o{ undangan : "memiliki tiket wisuda"
    mahasiswa ||--o{ undangan_tamu : "mengajukan tiket tamu"
    mahasiswa ||--o{ kehadiran : "memiliki riwayat hadir"
    mahasiswa {
        String id PK
        String nim UK
        String nama
        String email UK
        String fakultas
        String prodi
        Int angkatan
        StatusMahasiswa status
        String sesiWisuda
        String gate
        String foto
        String ukuranToga
        Int nomorUrut
        Boolean isCumlaude
        Float ipk
        Int requestedTamu
        StatusPengajuanTamu statusPengajuan
        String userId FK
        DateTime createdAt
        DateTime updatedAt
    }

    undangan ||--o| kehadiran : "tercatat scan masuk"
    undangan {
        String id PK
        String kode UK
        String qrToken UK
        String qrImageUrl
        StatusUndangan statusUndangan
        DateTime tanggalWisuda
        String tempatWisuda
        Int kuotaTamu
        String pdfUrl
        String mahasiswaId FK
        DateTime createdAt
        DateTime updatedAt
    }

    undangan_tamu {
        String id PK
        String kode UK
        String namaTamu
        String hubungan
        String qrToken UK
        String qrImageUrl
        StatusUndangan statusUndangan
        Boolean statusHadir
        DateTime waktuScan
        String gate
        String petugasId
        String mahasiswaId FK
        DateTime createdAt
        DateTime updatedAt
    }

    kehadiran {
        String id PK
        StatusKehadiran statusKehadiran
        DateTime waktuScan
        String catatan
        String gate
        String undanganId FK "One-to-One"
        String mahasiswaId FK
        String petugasId
        DateTime createdAt
    }

    konfigurasi_sistem {
        String id PK
        String key UK
        String value
        DateTime updatedAt
    }

    undangan_dosen {
        String id PK
        String kode UK
        String nidn
        String nama
        String jabatan
        String email
        String noWa
        String qrToken UK
        Boolean statusHadir
        DateTime waktuScan
        String petugasId
        DateTime createdAt
        DateTime updatedAt
    }
```

---

## 4. Alur Kerja Sistem (System Flowcharts)

### A. Alur Pembuatan Undangan & Tiket QR (Undangan Generation Flow)
Menjelaskan bagaimana sistem memproses registrasi mahasiswa hingga menerbitkan tiket e-undangan dalam bentuk PDF ber-QR Code.

```mermaid
flowchart TD
    A([Mulai]) --> B[Admin Impor Data Mahasiswa via Excel / Form]
    B --> C[Sistem Simpan Data Mahasiswa ke Database]
    C --> D[Sistem Generate Akun User & password]
    D --> E[Sistem Membuat Data Undangan secara Massal]
    E --> F[Generate Unique qrToken & generate QRCode Data URL]
    F --> G[Simpan URL Gambar QR ke Tabel Undangan]
    G --> H[Sistem Siap Digunakan]
    H --> I[Mahasiswa Login ke Portal]
    I --> J[Mahasiswa Klik Unduh Undangan PDF]
    J --> K[Sistem compile template HTML + QRCode via jsPDF]
    K --> L[File PDF Undangan terunduh secara lokal]
    L --> M([Selesai])
```

---

### B. Alur Validasi Tiket Kehadiran Realtime (QR Code Scanner & Realtime Flow)
Alur ketika Wisudawan/Tamu datang ke lokasi dan melakukan scan tiket QR di gerbang masuk (*Gate*).

```mermaid
flowchart TD
    A([Mulai]) --> B[Petugas Scan Buka Halaman Scanner Kamera]
    B --> C[Petugas Memindai QR Code Tiket]
    C --> D{Apakah QR Token Terdaftar?}
    D -- Tidak --> E[Tampilkan Status: Tiket Tidak Valid!]
    D -- Ya --> F{Cek Status Undangan di DB}
    F -- KADALUARSA / BATAL --> G[Tampilkan Status: Tiket Kadaluarsa / Dibatalkan]
    F -- DIGUNAKAN --> H[Tampilkan Status: Tiket Sudah Pernah Digunakan!]
    F -- AKTIF --> I[Update Status Undangan: DIGUNAKAN]
    I --> J[Catat ke Tabel Kehadiran beserta Gate & Waktu Scan]
    J --> K[Sistem Kirim Event via Socket.io ke Server]
    K --> L[Server Broadcast Status Baru ke Seluruh Client Dashboard Admin]
    L --> M[Grafik Kehadiran / Dashboard Realtime Terupdate Instan]
    M --> N[Tampilkan Status di Layar Scanner: Berhasil Masuk!]
    E --> O([Selesai])
    G --> O
    H --> O
    N --> O
```

---

### C. Alur Pengajuan Kursi/Tiket Tamu Tambahan (Guest Request Flow)
Alur pengajuan kuota tamu tambahan oleh mahasiswa dan proses persetujuan oleh Admin.

```mermaid
flowchart TD
    A([Mulai]) --> B[Mahasiswa Login ke Dashboard Portal]
    B --> C[Mengisi Form Pengajuan Nama Tamu Tambahan]
    C --> D[Status Pengajuan Tamu diset PENDING]
    D --> E[Admin Membuka Dashboard Admin & Menu Pengajuan]
    E --> F{Keputusan Admin?}
    F -- Tolak --> G[Ubah Status Pengajuan Tamu ke REJECTED]
    G --> H[Notifikasi Penolakan Tampil di Dashboard Mahasiswa]
    F -- Setujui --> I[Ubah Status Pengajuan Tamu ke APPROVED]
    I --> J[Sistem secara Otomatis Generate Tiket Baru di UndanganTamu]
    J --> K[Generate QR Code Khusus untuk Masing-masing Tamu]
    K --> L[Mahasiswa Dapat Melihat & Mengunduh Tiket Tamu Khusus]
    H --> M([Selesai])
    L --> M
```

---

## 5. Implementasi Hak Akses Fitur (Role-Based Access Matrix)

Tabel berikut memetakan otorisasi hak akses (*Access Control Matrix*) fitur-fitur di dalam aplikasi:

| Fitur / Modul | Super Admin | Admin Fakultas | Petugas Scan | Mahasiswa |
| :--- | :---: | :---: | :---: | :---: |
| **Konfigurasi Global Sistem** | ✔ (Bisa ubah) | ❌ | ❌ | ❌ |
| **Impor & Hapus Mahasiswa** | ✔ | ✔ (Fakultas sendiri) | ❌ | ❌ |
| **Generate Masal Undangan** | ✔ | ✔ | ❌ | ❌ |
| **Persetujuan Kuota Tamu** | ✔ | ✔ (Fakultas sendiri) | ❌ | ❌ |
| **Akses Modul Kamera QR Scanner**| ✔ | ❌ | ✔ | ❌ |
| **Melihat Dashboard Realtime**| ✔ | ✔ (Fakultas sendiri) | ❌ | ❌ |
| **Download PDF Undangan Sendiri**| ❌ | ❌ | ❌ | ✔ |
| **Ajukan Tiket Tamu Tambahan** | ❌ | ❌ | ❌ | ✔ |
| **Unduh Laporan Kehadiran (Excel)**| ✔ | ✔ (Fakultas sendiri) | ❌ | ❌ |
