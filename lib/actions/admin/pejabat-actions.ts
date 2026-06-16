"use server";

import { db } from "@/lib/db";
import { dataPejabat } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPejabatList() {
  try {
    const data = await db.select().from(dataPejabat).orderBy(asc(dataPejabat.orderIndex));
    return { success: true, data };
  } catch (error) {
    console.error("Error getPejabatList:", error);
    return { success: false, error: "Gagal mengambil data pejabat." };
  }
}

export async function upsertPejabat(data: {
  id?: string;
  tipePejabat: string;
  unitKerja: string | null;
  nama: string;
  nip: string;
  jabatan: string | null;
}) {
  try {
    if (data.id) {
      await db
        .update(dataPejabat)
        .set({
          tipePejabat: data.tipePejabat,
          unitKerja: data.unitKerja,
          nama: data.nama,
          nip: data.nip,
          jabatan: data.jabatan,
          updatedAt: new Date(),
        })
        .where(eq(dataPejabat.id, data.id));
    } else {
      await db.insert(dataPejabat).values({
        tipePejabat: data.tipePejabat,
        unitKerja: data.unitKerja,
        nama: data.nama,
        nip: data.nip,
        jabatan: data.jabatan,
      });
    }

    revalidatePath("/admin/manajemen-pegawai/pejabat");
    revalidatePath("/pegawai/cuti/tambah");
    return { success: true };
  } catch (error) {
    console.error("Error upsertPejabat:", error);
    return { success: false, error: "Gagal menyimpan data pejabat." };
  }
}

export async function deletePejabat(id: string) {
  try {
    await db.delete(dataPejabat).where(eq(dataPejabat.id, id));
    revalidatePath("/admin/manajemen-pegawai/pejabat");
    return { success: true };
  } catch (error) {
    console.error("Error deletePejabat:", error);
    return { success: false, error: "Gagal menghapus data pejabat." };
  }
}

export async function reorderPejabat(items: { id: string; orderIndex: number }[]) {
  try {
    // Ideally use a transaction, but we can do a loop for simplicity
    for (const item of items) {
      await db
        .update(dataPejabat)
        .set({ orderIndex: item.orderIndex })
        .where(eq(dataPejabat.id, item.id));
    }
    revalidatePath("/admin/manajemen-pegawai/pejabat");
    revalidatePath("/pegawai/cuti/tambah");
    return { success: true };
  } catch (error) {
    console.error("Error reorderPejabat:", error);
    return { success: false, error: "Gagal menyimpan urutan baru." };
  }
}
