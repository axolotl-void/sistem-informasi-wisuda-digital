import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  try {
    console.log("🌱 Seeding database via API...");

    // Hash password
    const hashedPassword = await bcrypt.hash("password123", 12);

    // ── Super Admin ──────────────────────────────
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

    // ── Admin Fakultas ───────────────────────────
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

    // ── Petugas Scan ─────────────────────────────
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

    // ── Mahasiswa Sample ─────────────────────────
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

    return NextResponse.json({
      success: true,
      message: "Database seeded successfully!",
      users: {
        superAdmin: superAdmin.email,
        adminFakultas: adminFakultas.email,
        petugas: petugas.email,
        mahasiswa: mahasiswaUser.email,
      },
    });
  } catch (error) {
    console.error("❌ Seed API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
