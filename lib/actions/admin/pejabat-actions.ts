"use server";

import { db } from "@/lib/db";
import { profilesPegawai, profiles } from "@/lib/db/schema/auth";
import { eq, asc, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPejabatList() {
  try {
    const rawData = await db
      .select({
        id: profilesPegawai.id,
        tipePejabat: profilesPegawai.tipePejabat,
        unitKerja: profilesPegawai.unitKerja,
        nama: profiles.fullName,
        nip: profilesPegawai.nip,
        jabatan: profilesPegawai.jabatan,
        orderIndex: profilesPegawai.orderIndex,
        profileId: profilesPegawai.profileId,
      })
      .from(profilesPegawai)
      .leftJoin(profiles, eq(profilesPegawai.profileId, profiles.id))
      .where(inArray(profilesPegawai.tipePejabat, ["Atasan Langsung", "Kepala Kantor"]))
      .orderBy(asc(profilesPegawai.orderIndex));
      
    return { success: true, data: rawData };
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
        .update(profilesPegawai)
        .set({
          tipePejabat: data.tipePejabat,
          unitKerja: data.unitKerja,
          nip: data.nip,
          jabatan: data.jabatan,
          updatedAt: new Date(),
        })
        .where(eq(profilesPegawai.id, data.id));
    } else {
      // NOTE: For creating new Pejabat via this form, we would need a profileId.
      // Since it's a legacy form, we might need to handle this differently if profile doesn't exist.
      // Let's assume the profile already exists and we look it up by NIP.
      let existingProfile = await db.query.profilesPegawai.findFirst({
        where: eq(profilesPegawai.nip, data.nip)
      });
      
      if (existingProfile) {
        await db.update(profilesPegawai).set({
          tipePejabat: data.tipePejabat,
          unitKerja: data.unitKerja,
          jabatan: data.jabatan,
          updatedAt: new Date(),
        }).where(eq(profilesPegawai.id, existingProfile.id));
      } else {
        return { success: false, error: "Data pegawai tidak ditemukan berdasarkan NIP. Harap pastikan pegawai sudah terdaftar." };
      }
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
    // We shouldn't delete the profile, just remove their tipePejabat role
    await db.update(profilesPegawai).set({ tipePejabat: null }).where(eq(profilesPegawai.id, id));
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
        .update(profilesPegawai)
        .set({ orderIndex: item.orderIndex })
        .where(eq(profilesPegawai.id, item.id));
    }
    revalidatePath("/admin/manajemen-pegawai/pejabat");
    revalidatePath("/pegawai/cuti/tambah");
    return { success: true };
  } catch (error) {
    console.error("Error reorderPejabat:", error);
    return { success: false, error: "Gagal menyimpan urutan baru." };
  }
}
