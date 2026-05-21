import type { StudentStatus } from "./components/status-badge";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Student {
  id: string;
  photo: string;
  name: string;
  nim: string;
  faculty: string;
  major: string;
  email: string;
  phone: string;
  session: string;
  room: string;
  seat: string;
  invitationNo: string;
  status: StudentStatus;
  lastActivity: string;
  profileProgress: number;
  firstLogin: boolean;
  qrGenerated: boolean;
  guestCount: number;
  guests: { name: string; isVip: boolean }[];
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const faculties = [
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)",
];

const majors: Record<string, string[]> = {
  "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)": [
    "S1 Pendidikan Bahasa dan Sastra Aceh",
    "S1 Pendidikan Bahasa Indonesia",
    "S1 Pendidikan Bahasa Inggris",
    "S1 Pendidikan Matematika",
    "S1 Pendidikan Jasmani",
    "S1 Pendidikan Guru Sekolah Dasar (PGSD)",
    "S1 Pendidikan Guru Pendidikan Anak Usia Dini (PG PAUD)",
    "S1 Pendidikan Ilmu Pengetahuan Alam (Pendidikan IPA)",
    "S1 Pendidikan Seni Pertunjukan",
    "S2 Penjaminan Mutu Pendidikan",
    "S2 Pendidikan Dasar",
    "Pendidikan Profesi Guru (PPG)"
  ],
  "Fakultas Sains, Teknologi, dan Ilmu Kesehatan (FSTIK)": [
    "S1 Ilmu Komputer",
    "S1 Keperawatan",
    "S1 Kebidanan"
  ],
};

const firstNames = [
  "Ahmad", "Siti", "Budi", "Rina", "Dimas", "Putri", "Rizky", "Ayu",
  "Fajar", "Dewi", "Muhammad", "Nadia", "Andi", "Lestari", "Bayu",
  "Zahra", "Gilang", "Anisa", "Raihan", "Intan", "Yusuf", "Salsabila",
  "Arif", "Wulandari", "Ilham", "Maharani", "Faisal", "Tiara", "Hendra", "Nabila",
];

const lastNames = [
  "Pratama", "Sari", "Hidayat", "Lestari", "Ramadhan", "Utami",
  "Nugroho", "Wati", "Saputra", "Purnama", "Kusuma", "Permata",
  "Hakim", "Anggraini", "Wijaya", "Ramadhani", "Kurniawan", "Putri",
];

const statuses: StudentStatus[] = [
  "belum-login",
  "profile-belum-lengkap",
  "menunggu-verifikasi",
  "terverifikasi",
  "qr-aktif",
  "sudah-hadir",
];

const sessions = ["Sesi 1 - Pagi", "Sesi 2 - Siang", "Sesi 3 - Sore"];
const rooms = ["Auditorium Utama", "Gedung Serbaguna", "Aula Rektorat"];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function generateStudents(count = 30): Student[] {
  return Array.from({ length: count }, (_, i) => {
    const firstName = pick(firstNames);
    const lastName = pick(lastNames);
    const faculty = pick(faculties);
    const major = pick(majors[faculty]);
    const status = pick(statuses);
    const row = String.fromCharCode(65 + Math.floor(i / 25));
    const col = (i % 25) + 1;
    const h = String(7 + Math.floor(Math.random() * 10)).padStart(2, "0");
    const m = String(Math.floor(Math.random() * 60)).padStart(2, "0");

    const guestNames = [
      `${pick(firstNames)} ${pick(lastNames)}`,
      `${pick(firstNames)} ${pick(lastNames)}`,
    ];

    return {
      id: `std-${String(i + 1).padStart(4, "0")}`,
      photo: `https://api.dicebear.com/9.x/initials/svg?seed=${firstName}+${lastName}&backgroundColor=0F172A&textColor=ffffff`,
      name: `${firstName} ${lastName}`,
      nim: `2024${String(1000 + i)}`,
      faculty,
      major,
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@kampus.ac.id`,
      phone: `08${String(Math.floor(1000000000 + Math.random() * 9000000000)).slice(0, 10)}`,
      session: pick(sessions),
      room: pick(rooms),
      seat: `${row}-${col}`,
      invitationNo: `INV-2025-${String(i + 1).padStart(4, "0")}`,
      status,
      lastActivity: status === "belum-login" ? "—" : `${h}:${m} WIB`,
      profileProgress: status === "belum-login" ? 0 : status === "profile-belum-lengkap" ? Math.floor(30 + Math.random() * 40) : 100,
      firstLogin: status !== "belum-login",
      qrGenerated: status === "qr-aktif" || status === "sudah-hadir",
      guestCount: 2,
      guests: [
        { name: guestNames[0], isVip: Math.random() > 0.8 },
        { name: guestNames[1], isVip: false },
      ],
    };
  });
}
