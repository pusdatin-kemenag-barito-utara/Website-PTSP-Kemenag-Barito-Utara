"use server";

import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { dataCutiPegawai, rekapCutiTahunan, profiles, profilesPegawai } from "@/lib/db/schema";
import { eq, desc, asc, like, or, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

type ActionResponse = { success: true; message?: string; data?: unknown } | { success: false; error: string };

export async function getDataCutiListAction(search?: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const conditions = [];
    if (search) {
      conditions.push(
        or(
          like(dataCutiPegawai.nama, `%${search}%`),
          like(dataCutiPegawai.nip, `%${search}%`),
        ),
      );
    }

    const data = await db.query.dataCutiPegawai.findMany({
      where: conditions.length ? sql`${sql.join(conditions, sql` AND `)}` : undefined,
      orderBy: [asc(dataCutiPegawai.no)],
      with: {
        rekapCutiTahunan: true,
      },
    });

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengambil data cuti." };
  }
}

export async function getDataCutiByIdAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const data = await db.query.dataCutiPegawai.findFirst({
      where: eq(dataCutiPegawai.id, id),
      with: {
        rekapCutiTahunan: {
          orderBy: [desc(rekapCutiTahunan.tahunTarget)],
        },
      },
    });

    if (!data) return { success: false, error: "Data tidak ditemukan." };

    return { success: true, data };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengambil data cuti." };
  }
}

export async function createDataCutiAction(formData: FormData): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const nama = formData.get("nama") as string;
    if (!nama?.trim()) return { success: false, error: "Nama wajib diisi." };

    const no = formData.get("no") ? Number(formData.get("no")) : null;
    const nip = formData.get("nip") as string;
    const jabatan = formData.get("jabatan") as string;
    const unitKerja = formData.get("unitKerja") as string;

    const [pegawai] = await db.insert(dataCutiPegawai).values({
      no,
      nama: nama.trim(),
      nip: nip?.trim() || null,
      jabatan: jabatan?.trim() || null,
      unitKerja: unitKerja?.trim() || null,
    }).returning();

    // Simpan Rekap untuk tahun berjalan
    const tahunTarget = new Date().getFullYear();
    const cutiTahunanRaw = formData.get("cutiTahunan") as string;
    const cutiTahunan = cutiTahunanRaw ? JSON.parse(cutiTahunanRaw) : null;

    await db.insert(rekapCutiTahunan).values({
      pegawaiId: pegawai.id,
      tahunTarget,
      cutiTahun1: toInt(formData.get("cutiTahun1")),
      cutiTahun2: toInt(formData.get("cutiTahun2")),
      jumlahCuti: toInt(formData.get("jumlahCuti")),
      cutiTahunan,
      cutiAlasanPenting: toInt(formData.get("cutiAlasanPenting")),
      cutiBersalin: toInt(formData.get("cutiBersalin")),
      cutiSakit: toInt(formData.get("cutiSakit")),
      sisaCuti: toInt(formData.get("sisaCuti")),
    });

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true, message: "Pegawai berhasil ditambahkan.", data: pegawai };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menambah data." };
  }
}

export async function updateDataCutiAction(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const nama = formData.get("nama") as string;
    if (!nama?.trim()) return { success: false, error: "Nama wajib diisi." };

    const no = formData.get("no") ? Number(formData.get("no")) : null;
    const nip = formData.get("nip") as string;
    const jabatan = formData.get("jabatan") as string;
    const unitKerja = formData.get("unitKerja") as string;

    await db.update(dataCutiPegawai).set({
      no,
      nama: nama.trim(),
      nip: nip?.trim() || null,
      jabatan: jabatan?.trim() || null,
      unitKerja: unitKerja?.trim() || null,
      updatedAt: new Date(),
    }).where(eq(dataCutiPegawai.id, id));

    // Update atau Insert Rekap untuk tahun berjalan
    const tahunTarget = new Date().getFullYear();
    const cutiTahunanRaw = formData.get("cutiTahunan") as string;
    const cutiTahunan = cutiTahunanRaw ? JSON.parse(cutiTahunanRaw) : null;

    const existingRekap = await db.query.rekapCutiTahunan.findFirst({
      where: sql`${rekapCutiTahunan.pegawaiId} = ${id} AND ${rekapCutiTahunan.tahunTarget} = ${tahunTarget}`
    });

    const rekapData = {
      cutiTahun1: toInt(formData.get("cutiTahun1")),
      cutiTahun2: toInt(formData.get("cutiTahun2")),
      jumlahCuti: toInt(formData.get("jumlahCuti")),
      cutiTahunan,
      cutiAlasanPenting: toInt(formData.get("cutiAlasanPenting")),
      cutiBesar: toInt(formData.get("cutiBesar")),
      cutiBersalin: toInt(formData.get("cutiBersalin")),
      cutiSakit: toInt(formData.get("cutiSakit")),
      sisaCuti: toInt(formData.get("sisaCuti")),
      updatedAt: new Date(),
    };

    if (existingRekap) {
      await db.update(rekapCutiTahunan).set(rekapData).where(eq(rekapCutiTahunan.id, existingRekap.id));
    } else {
      await db.insert(rekapCutiTahunan).values({
        pegawaiId: id,
        tahunTarget,
        ...rekapData,
      });
    }

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true, message: "Data pegawai dan rekap berhasil diubah." };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah data." };
  }
}

export async function deleteDataCutiAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    await db.delete(dataCutiPegawai).where(eq(dataCutiPegawai.id, id));

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true, message: "Data berhasil dihapus." };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus data." };
  }
}

// ─── Rekap Cuti Tahunan ────────────────────────────────────────

export async function createRekapCutiAction(formData: FormData): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const pegawaiId = formData.get("pegawaiId") as string;
    const tahunTarget = Number(formData.get("tahunTarget"));
    if (!pegawaiId || !tahunTarget) return { success: false, error: "Data tidak lengkap." };

    const cutiTahunanRaw = formData.get("cutiTahunan") as string;
    const cutiTahunan = cutiTahunanRaw ? JSON.parse(cutiTahunanRaw) : null;

    const [rekap] = await db.insert(rekapCutiTahunan).values({
      pegawaiId,
      tahunTarget,
      cutiTahun1: toInt(formData.get("cutiTahun1")),
      cutiTahun2: toInt(formData.get("cutiTahun2")),
      jumlahCuti: toInt(formData.get("jumlahCuti")),
      cutiTahunan,
      cutiAlasanPenting: toInt(formData.get("cutiAlasanPenting")),
      cutiBesar: toInt(formData.get("cutiBesar")),
      cutiBersalin: toInt(formData.get("cutiBersalin")),
      cutiSakit: toInt(formData.get("cutiSakit")),
      sisaCuti: toInt(formData.get("sisaCuti")),
    }).returning();

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true, message: "Rekap cuti berhasil ditambahkan.", data: rekap };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menambah rekap cuti." };
  }
}

export async function updateRekapCutiAction(id: string, formData: FormData): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const cutiTahunanRaw = formData.get("cutiTahunan") as string;
    const cutiTahunan = cutiTahunanRaw ? JSON.parse(cutiTahunanRaw) : null;

    await db.update(rekapCutiTahunan).set({
      tahunTarget: Number(formData.get("tahunTarget")),
      cutiTahun1: toInt(formData.get("cutiTahun1")),
      cutiTahun2: toInt(formData.get("cutiTahun2")),
      jumlahCuti: toInt(formData.get("jumlahCuti")),
      cutiTahunan,
      cutiAlasanPenting: toInt(formData.get("cutiAlasanPenting")),
      cutiBesar: toInt(formData.get("cutiBesar")),
      cutiBersalin: toInt(formData.get("cutiBersalin")),
      cutiSakit: toInt(formData.get("cutiSakit")),
      sisaCuti: toInt(formData.get("sisaCuti")),
      updatedAt: new Date(),
    }).where(eq(rekapCutiTahunan.id, id));

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true, message: "Rekap cuti berhasil diubah." };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal mengubah rekap cuti." };
  }
}

export async function deleteRekapCutiAction(id: string): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    await db.delete(rekapCutiTahunan).where(eq(rekapCutiTahunan.id, id));

    revalidatePath("/admin/kepegawaian/pegawai");
    return { success: true, message: "Rekap cuti berhasil dihapus." };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal menghapus rekap cuti." };
  }
}

// ─── Helpers ───────────────────────────────────────────────────

function toInt(val: unknown): number | null {
  if (val === null || val === undefined || val === "") return null;
  const n = Number(val);
  return isNaN(n) ? null : n;
}

export async function importCutiCsvAction(formData: FormData): Promise<ActionResponse> {
  return { success: false, error: "Belum diimplementasikan." };
}

export async function syncDataPegawaiFromPusdatinAction(): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    // Fetch from Pusdatin
    const pusdatinPegawai = await db
      .select({
        nip: profilesPegawai.nip,
        jabatan: profilesPegawai.jabatan,
        unitKerja: profilesPegawai.unitKerja,
        nama: profiles.fullName,
      })
      .from(profilesPegawai)
      .leftJoin(profiles, eq(profilesPegawai.profileId, profiles.id));

    if (!pusdatinPegawai.length) {
      return { success: false, error: "Tidak ada data pegawai di Pusdatin." };
    }

    // Fetch existing PTSP Pegawai
    const ptspPegawai = await db.select().from(dataCutiPegawai);

    let updatedCount = 0;
    let insertedCount = 0;
    let deletedCount = 0;

    const pusdatinNips = new Set(pusdatinPegawai.map(p => p.nip).filter(Boolean));

    for (const p of pusdatinPegawai) {
      if (!p.nip) continue; // Skip if no NIP

      const existing = ptspPegawai.find(x => x.nip === p.nip);
      if (existing) {
        // Update if there are changes
        if (
          existing.nama !== (p.nama || "Tanpa Nama") ||
          existing.jabatan !== p.jabatan ||
          existing.unitKerja !== p.unitKerja
        ) {
          await db
            .update(dataCutiPegawai)
            .set({
              nama: p.nama || "Tanpa Nama",
              jabatan: p.jabatan,
              unitKerja: p.unitKerja,
              updatedAt: new Date(),
            })
            .where(eq(dataCutiPegawai.id, existing.id));
          updatedCount++;
        }
      } else {
        // Insert new
        await db.insert(dataCutiPegawai).values({
          nama: p.nama || "Tanpa Nama",
          nip: p.nip,
          jabatan: p.jabatan,
          unitKerja: p.unitKerja,
        });
        insertedCount++;
      }
    }

    for (const ptsp of ptspPegawai) {
      if (ptsp.nip && !pusdatinNips.has(ptsp.nip)) {
        await db.delete(dataCutiPegawai).where(eq(dataCutiPegawai.id, ptsp.id));
        deletedCount++;
      }
    }

    revalidatePath("/admin/kepegawaian/pegawai");
    return { 
      success: true, 
      message: `Berhasil sinkronisasi. ${insertedCount} data baru, ${updatedCount} diperbarui, ${deletedCount} dihapus.` 
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal sinkronisasi data dari Pusdatin." };
  }
}

export async function rolloverCutiTahunanAction(tahunTujuan: number): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Belum login." };

    const ptspPegawai = await db.select().from(dataCutiPegawai);
    
    // Cek apakah rekap tahun tujuan sudah ada
    const existingRekap = await db.select().from(rekapCutiTahunan).where(eq(rekapCutiTahunan.tahunTarget, tahunTujuan));
    if (existingRekap.length > 0) {
      return { success: false, error: `Tutup buku untuk tahun ${tahunTujuan} sudah dilakukan.` };
    }

    const tahunLalu = tahunTujuan - 1;
    const tahunLalu2 = tahunTujuan - 2;

    const rekapTahunLalu = await db.select().from(rekapCutiTahunan).where(eq(rekapCutiTahunan.tahunTarget, tahunLalu));
    const rekapTahunLalu2 = await db.select().from(rekapCutiTahunan).where(eq(rekapCutiTahunan.tahunTarget, tahunLalu2));

    let insertedCount = 0;

    for (const pegawai of ptspPegawai) {
      const rekapN1 = rekapTahunLalu.find(r => r.pegawaiId === pegawai.id);
      const rekapN2 = rekapTahunLalu2.find(r => r.pegawaiId === pegawai.id);

      const cutiTahun1 = rekapN1 ? Math.min(rekapN1.sisaCuti || 0, 6) : 0;
      const cutiTahun2 = rekapN2 ? Math.min(rekapN2.sisaCuti || 0, 6) : 0;
      const jumlahCuti = 12 + cutiTahun1 + cutiTahun2;

      await db.insert(rekapCutiTahunan).values({
        pegawaiId: pegawai.id,
        tahunTarget: tahunTujuan,
        cutiTahun1,
        cutiTahun2,
        jumlahCuti,
        sisaCuti: jumlahCuti,
      });
      insertedCount++;
    }

    revalidatePath("/admin/kepegawaian/pegawai");
    return { 
      success: true, 
      message: `Tutup buku berhasil. ${insertedCount} rekap cuti untuk tahun ${tahunTujuan} telah dibuat.` 
    };
  } catch (err: any) {
    return { success: false, error: err.message || "Gagal melakukan tutup buku." };
  }
}
