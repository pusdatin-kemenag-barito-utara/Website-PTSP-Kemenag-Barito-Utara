"use server";

import { db } from "@/lib/db";
import { laporanKinerja } from "@/lib/db/schema";
import { profiles } from "@/lib/db/schema";
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
  unitKerja: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();

    const pseudoEmail = `${data.nip}@pegawai.barut.kemenag.go.id`;
    const defaultPassword = `${data.nip}barut`;

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
    unitKerja: string;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    await db.update(profiles).set({
      fullName: data.fullName,
      unitKerja: data.unitKerja,
      updatedAt: new Date(),
    }).where(eq(profiles.id, id));

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

export async function uploadPegawaiCsvAction(formData: FormData) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Belum login." };

    const file = formData.get("file") as File;
    if (!file) return { error: "File tidak ditemukan." };

    const text = await file.text();
    const lines = text.split("\n");
    const { createAdminClient } = await import("@/lib/supabase/admin");
    const adminClient = createAdminClient();

    let successCount = 0;
    let errorCount = 0;
    const errors: string[] = [];

    const delimiter = text.indexOf(';') > -1 && text.split(';').length > text.split(',').length ? ';' : ',';

    const usersToProcess = [];
    for (let i = 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const cols = [];
      let current = "";
      let inQuotes = false;
      for (let char of line) {
        if (char === '"') inQuotes = !inQuotes;
        else if (char === delimiter && !inQuotes) {
          cols.push(current);
          current = "";
        } else {
          current += char;
        }
      }
      cols.push(current);

      if (cols.length < 4) continue;

      const nama = cols[1]?.trim();
      const nip = cols[2]?.trim();
      const jabatan = cols[3]?.trim();

      if (!nip || nip.length < 10) continue;
      usersToProcess.push({ nama, nip, jabatan });
    }
    console.log(`CSV parsed: ${lines.length} lines. Detected delimiter: ${delimiter}. Users to process: ${usersToProcess.length}`);

    // Process in chunks to avoid overwhelming the database pool
    const chunkSize = 15;
    for (let i = 0; i < usersToProcess.length; i += chunkSize) {
      const chunk = usersToProcess.slice(i, i + chunkSize);
      
      await Promise.all(chunk.map(async ({ nama, nip, jabatan }) => {
        const pseudoEmail = `${nip}@pegawai.barut.kemenag.go.id`;
        const defaultPassword = `${nip}barut`;

        try {
          const { users } = await import("@/lib/db/schema/auth");
          let targetUserId: string | undefined;
          let hasProfile = false;

          const existingProfile = await db.query.profiles.findFirst({
            where: eq(profiles.email, pseudoEmail)
          });

          if (existingProfile) {
            targetUserId = existingProfile.id;
            hasProfile = true;
          } else {
            const existingAuth = await db.select({ id: users.id }).from(users).where(eq(users.email, pseudoEmail)).limit(1);
            if (existingAuth.length > 0) {
              targetUserId = existingAuth[0].id;
            }
          }

          if (targetUserId) {
            if (hasProfile) {
              await db.update(profiles).set({
                fullName: nama,
                role: "pegawai",
                unitKerja: jabatan,
                permissions: ["e_laporan_kinerja"],
              }).where(eq(profiles.id, targetUserId));
            } else {
              await db.insert(profiles).values({
                id: targetUserId,
                email: pseudoEmail,
                fullName: nama,
                role: "pegawai",
                unitKerja: jabatan,
                permissions: ["e_laporan_kinerja"],
              });
            }
            successCount++;
            return;
          }

          const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
            email: pseudoEmail,
            password: defaultPassword,
            email_confirm: true,
            user_metadata: {
              full_name: nama,
              nip: nip,
            },
          });

          if (createError) {
            errorCount++;
            errors.push(`NIP ${nip}: ${createError.message}`);
            return;
          }

          if (authData.user) {
            await db.insert(profiles).values({
              id: authData.user.id,
              email: pseudoEmail,
              fullName: nama,
              role: "pegawai",
              unitKerja: jabatan,
              permissions: ["e_laporan_kinerja"],
            });
            successCount++;
          }
        } catch (dbErr: any) {
          console.error("DB Error:", dbErr.message || dbErr);
          errorCount++;
        }
      }));
    }

    revalidatePath("/admin/kepegawaian/pegawai");
    return { 
      success: true, 
      message: `Berhasil import ${successCount} pegawai, Gagal: ${errorCount}` 
    };
  } catch (err: any) {
    return { error: err.message };
  }
}
