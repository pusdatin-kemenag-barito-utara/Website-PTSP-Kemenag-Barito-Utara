"use server";

import { db } from "@/lib/db";
import { laporanKinerja } from "@/lib/db/schema";
import { profiles, dataCutiPegawai } from "@/lib/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function submitLaporanKinerjaAction(data: {
  tanggal: string;
  kegiatanTugasJabatan: string;
  hasil: string;
  buktiDukungUrl?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    await db.insert(laporanKinerja).values({
      userId: user.id,
      tanggal: data.tanggal,
      kegiatanTugasJabatan: data.kegiatanTugasJabatan,
      hasil: data.hasil,
      buktiDukungUrl: data.buktiDukungUrl,
      status: "pending",
    });

    revalidatePath("/admin/kepegawaian/laporan");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal submit laporan:", err);
    return { error: err.message || "Terjadi kesalahan." };
  }
}

export async function getLaporanKinerjaAction(dateFilter?: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    // Jika pegawai biasa, hanya lihat miliknya.
    // Jika super_admin atau kepala_kantor, bisa lihat semua.
    let isPemimpin = false;
    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
      columns: { role: true, email: true },
    });

    if (
      profile?.role === "kepala_kantor" ||
      profile?.role === "super_admin" ||
      profile?.role === "kasubag_tu"
    ) {
      isPemimpin = true;
    }

    const query = db
      .select({
        id: laporanKinerja.id,
        userId: laporanKinerja.userId,
        tanggal: laporanKinerja.tanggal,
        kegiatanTugasJabatan: laporanKinerja.kegiatanTugasJabatan,
        hasil: laporanKinerja.hasil,
        buktiDukungUrl: laporanKinerja.buktiDukungUrl,
        status: laporanKinerja.status,
        komentarPimpinan: laporanKinerja.komentarPimpinan,
        createdAt: laporanKinerja.createdAt,
        pegawaiName: profiles.fullName,
        pegawaiEmail: profiles.email,
      })
      .from(laporanKinerja)
      .leftJoin(profiles, eq(laporanKinerja.userId, profiles.id))
      .orderBy(desc(laporanKinerja.createdAt));

    // Belum pakai filter date yang advanced, cukup ambil top 100 dulu untuk UI awal
    // Di produksi bisa dipaginasi.

    let results = await query;

    if (!isPemimpin) {
      results = results.filter((r) => r.userId === user.id);
    }

    return { data: results, isPemimpin };
  } catch (err: any) {
    console.error("Gagal fetch laporan:", err);
    return { error: err.message || "Terjadi kesalahan." };
  }
}

export async function updateLaporanStatusAction(
  id: string,
  status: string,
  komentar?: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    await db
      .update(laporanKinerja)
      .set({
        status: status,
        komentarPimpinan: komentar,
        updatedAt: new Date(),
      })
      .where(eq(laporanKinerja.id, id));

    revalidatePath("/admin/kepegawaian/laporan");
    return { success: true };
  } catch (err: any) {
    console.error("Gagal update status:", err);
    return { error: err.message || "Terjadi kesalahan." };
  }
}

export async function getPegawaiListAction() {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    const data = await db.query.profiles.findMany({
      where: eq(profiles.role, "pegawai"),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
    });

    return { data };
  } catch (err: any) {
    return { error: "Terjadi kesalahan saat mengambil data pegawai." };
  }
}

export async function createPegawaiAction(data: {
  fullName: string;
  nip: string;
  jabatan: string;
  unitKerja: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();

    const pseudoEmail = `${data.nip}@pegawai.barut.kemenag.go.id`;
    const defaultPassword = `12345barut`;

    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email: pseudoEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        full_name: data.fullName,
        nip: data.nip,
      },
    });

    if (createError) {
      return { error: createError.message };
    }

    if (authData.user) {
      await db.update(profiles).set({
        fullName: data.fullName,
        role: "pegawai",
        jabatan: data.jabatan,
        unitKerja: data.unitKerja,
        permissions: ["e_laporan_kinerja"],
      }).where(eq(profiles.id, authData.user.id));
    }

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function updatePegawaiAction(
  id: string,
  data: {
    fullName: string;
    jabatan: string;
    unitKerja: string;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, id),
    });

    await db.update(profiles).set({
      fullName: data.fullName,
      jabatan: data.jabatan,
      unitKerja: data.unitKerja,
      updatedAt: new Date(),
    }).where(eq(profiles.id, id));

    if (profile && profile.email) {
      const nip = profile.email.split('@')[0];
      if (nip) {
        await db.update(dataCutiPegawai).set({
          nama: data.fullName,
          jabatan: data.jabatan,
          unitKerja: data.unitKerja,
          updatedAt: new Date(),
        }).where(eq(dataCutiPegawai.nip, nip));
      }
    }

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}

export async function deletePegawaiAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();

    const { error } = await adminClient.auth.admin.deleteUser(id);
    if (error) {
      return { error: error.message };
    }

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true };
  } catch (err: any) {
    return { error: err.message };
  }
}


