import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // Hash password
  const hashedPassword = await bcrypt.hash("password123", 12);

  // -- Super Admin ------------------------------
  const superAdmin = await prisma.user.upsert({
    where: { email: "superadmin@wisuda.ac.id" },
    update: {},
    create: {
      name: "Super Admin",
      email: "superadmin@wisuda.ac.id",
      password: hashedPassword,
      role: "SUPER_ADMIN",
    },
  });
  console.log("✅ Super Admin:", superAdmin.email);

  // -- Admin Fakultas ---------------------------
  const adminFakultas = await prisma.user.upsert({
    where: { email: "admin.fkip@wisuda.ac.id" },
    update: {},
    create: {
      name: "Admin FKIP",
      email: "admin.fkip@wisuda.ac.id",
      password: hashedPassword,
      role: "ADMIN_FAKULTAS",
      fakultas: "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
    },
  });
  console.log("✅ Admin Fakultas:", adminFakultas.email);

  // -- Petugas Scan -----------------------------
  const petugas = await prisma.user.upsert({
    where: { email: "petugas@wisuda.ac.id" },
    update: {},
    create: {
      name: "Petugas Scanner",
      email: "petugas@wisuda.ac.id",
      password: hashedPassword,
      role: "PETUGAS_SCAN",
    },
  });
  console.log("✅ Petugas Scan:", petugas.email);

  // -- Mahasiswa Sample -------------------------
  const mahasiswaUser = await prisma.user.upsert({
    where: { email: "mahasiswa@wisuda.ac.id" },
    update: {},
    create: {
      name: "Budi Santoso",
      email: "mahasiswa@wisuda.ac.id",
      password: hashedPassword,
      role: "MAHASISWA",
    },
  });

  await prisma.mahasiswa.upsert({
    where: { nim: "12345678" },
    update: {},
    create: {
      nim: "12345678",
      nama: "Budi Santoso",
      email: "mahasiswa@wisuda.ac.id",
      fakultas: "Fakultas Keguruan dan Ilmu Pendidikan (FKIP)",
      prodi: "S1 Pendidikan Matematika",
      angkatan: 2020,
      status: "LULUS",
      userId: mahasiswaUser.id,
    },
  });
  console.log("✅ Mahasiswa sample: 12345678");

  console.log("\n🎉 Seeding selesai!");
  console.log("\n📋 Akun untuk testing:");
  console.log("   Super Admin  : superadmin@wisuda.ac.id / password123");
  console.log("   Admin Fakultas: admin.fkip@wisuda.ac.id / password123");
  console.log("   Petugas Scan : petugas@wisuda.ac.id / password123");
  console.log("   Mahasiswa    : mahasiswa@wisuda.ac.id / password123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
