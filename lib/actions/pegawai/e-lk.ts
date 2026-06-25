"use server";

import { db } from "@/lib/db";
import { laporanKinerja, laporanKinerjaBulanan } from "@/lib/db/schema/kepegawaian";
import { eq, and, desc, asc, gte, lte, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";

export async function getLaporanKinerjaAction(
  userId: string,
  limit?: number,
  month?: number,
  year?: number
) {
  try {
    let query = db
      .select()
      .from(laporanKinerja)
      .where(eq(laporanKinerja.userId, userId))
      .orderBy(desc(laporanKinerja.tanggal), desc(laporanKinerja.createdAt));

    if (month && year) {
      const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];
      
      query = db
        .select()
        .from(laporanKinerja)
        .where(
          and(
            eq(laporanKinerja.userId, userId),
            gte(laporanKinerja.tanggal, startDate),
            lte(laporanKinerja.tanggal, endDate)
          )
        )
        .orderBy(desc(laporanKinerja.tanggal), desc(laporanKinerja.createdAt)) as any;
    }

    if (limit) {
      query = query.limit(limit) as any;
    }

    const data = await query;
    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching LKH:", error);
    return { data: null, error: error.message || "Terjadi kesalahan saat mengambil data LKH." };
  }
}

export async function createLaporanKinerjaAction(data: {
  tanggal: string;
  kegiatanTugasJabatan: string;
  hasil: string;
  buktiDukungUrl?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    await db.insert(laporanKinerja).values({
      userId: user.id,
      tanggal: data.tanggal,
      kegiatanTugasJabatan: data.kegiatanTugasJabatan,
      hasil: data.hasil,
      buktiDukungUrl: data.buktiDukungUrl,
      status: "pending",
    });

    revalidatePath("/pegawai/e-lk");
    return { success: true };
  } catch (error: any) {
    console.error("Error creating LKH:", error);
    return { error: error.message || "Gagal menyimpan laporan kinerja." };
  }
}

export async function updateLaporanKinerjaAction(id: string, data: {
  tanggal?: string;
  kegiatanTugasJabatan?: string;
  hasil?: string;
  buktiDukungUrl?: string;
}) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    const existing = await db.select().from(laporanKinerja).where(and(eq(laporanKinerja.id, id), eq(laporanKinerja.userId, user.id))).limit(1);
    
    if (existing.length === 0) return { error: "Data tidak ditemukan." };

    await db.update(laporanKinerja)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(laporanKinerja.id, id));

    revalidatePath("/pegawai/e-lk");
    return { success: true };
  } catch (error: any) {
    console.error("Error updating LKH:", error);
    return { error: error.message || "Gagal mengubah laporan kinerja." };
  }
}

export async function deleteLaporanKinerjaAction(id: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    const existing = await db.select().from(laporanKinerja).where(and(eq(laporanKinerja.id, id), eq(laporanKinerja.userId, user.id))).limit(1);
    
    if (existing.length === 0) return { error: "Data tidak ditemukan." };

    await db.delete(laporanKinerja).where(eq(laporanKinerja.id, id));

    revalidatePath("/pegawai/e-lk");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting LKH:", error);
    return { error: error.message || "Gagal menghapus laporan kinerja." };
  }
}

export async function getRekapBulananAction(userId: string, month: number, year: number) {
  try {
    const startDate = new Date(year, month - 1, 1).toISOString().split("T")[0];
    const endDate = new Date(year, month, 0).toISOString().split("T")[0];

    const data = await db
      .select({
        tanggal: laporanKinerja.tanggal,
        totalKegiatan: count(laporanKinerja.id),
      })
      .from(laporanKinerja)
      .where(
        and(
          eq(laporanKinerja.userId, userId),
          gte(laporanKinerja.tanggal, startDate),
          lte(laporanKinerja.tanggal, endDate)
        )
      )
      .groupBy(laporanKinerja.tanggal)
      .orderBy(asc(laporanKinerja.tanggal));

    return { data, error: null };
  } catch (error: any) {
    console.error("Error fetching rekap bulanan:", error);
    return { data: null, error: error.message || "Terjadi kesalahan saat mengambil rekap bulanan." };
  }
}

export async function getLaporanKinerjaBulananAction(userId: string, month: number, year: number) {
  try {
    const data = await db.select().from(laporanKinerjaBulanan).where(and(
      eq(laporanKinerjaBulanan.userId, userId),
      eq(laporanKinerjaBulanan.bulan, month),
      eq(laporanKinerjaBulanan.tahun, year)
    )).limit(1);
    
    return { data: data[0] || null, error: null };
  } catch (error: any) {
    return { data: null, error: error.message };
  }
}

export async function uploadFinalLkhAction(month: number, year: number, dokumenUrl: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { error: "Anda belum login." };

    const existing = await db.select().from(laporanKinerjaBulanan).where(and(
      eq(laporanKinerjaBulanan.userId, user.id),
      eq(laporanKinerjaBulanan.bulan, month),
      eq(laporanKinerjaBulanan.tahun, year)
    )).limit(1);

    if (existing.length > 0) {
      if (existing[0].status === "approved") {
        return { error: "Laporan bulanan sudah disetujui dan tidak dapat diubah." };
      }
      
      await db.update(laporanKinerjaBulanan).set({
        dokumenUrl,
        updatedAt: new Date(),
        status: "pending"
      }).where(eq(laporanKinerjaBulanan.id, existing[0].id));
    } else {
      await db.insert(laporanKinerjaBulanan).values({
        userId: user.id,
        bulan: month,
        tahun: year,
        dokumenUrl,
        status: "pending"
      });
    }

    revalidatePath("/pegawai/e-lk");
    return { success: true };
  } catch (error: any) {
    console.error("Error uploading final LKH:", error);
    return { error: error.message || "Gagal mengunggah dokumen final." };
  }
}
