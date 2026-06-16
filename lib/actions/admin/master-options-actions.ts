"use server";

import { db } from "@/lib/db";
import { masterOptions } from "@/lib/db/schema";
import { eq, asc } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { UNIT_KERJA_OPTIONS } from "@/lib/constants";

export async function getMasterOptionsAction(category?: string) {
  try {
    const where = category ? eq(masterOptions.category, category) : undefined;
    const data = await db.query.masterOptions.findMany({
      where,
      orderBy: [asc(masterOptions.sortOrder), asc(masterOptions.label)],
    });
    return { success: true, data };
  } catch (error) {
    console.error("Error getMasterOptionsAction:", error);
    return { success: false, error: "Gagal mengambil data master options." };
  }
}

export async function upsertMasterOptionAction(data: {
  id?: string;
  category: string;
  value: string;
  label: string;
  sortOrder?: number;
  isActive?: boolean;
}) {
  try {
    if (data.id) {
      await db
        .update(masterOptions)
        .set({
          category: data.category,
          value: data.value,
          label: data.label,
          sortOrder: data.sortOrder ?? 0,
          isActive: data.isActive ?? true,
          updatedAt: new Date(),
        })
        .where(eq(masterOptions.id, data.id));
    } else {
      await db.insert(masterOptions).values({
        category: data.category,
        value: data.value,
        label: data.label,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      });
    }

    revalidatePath("/admin/master-cuti");
    return { success: true };
  } catch (error) {
    console.error("Error upsertMasterOptionAction:", error);
    return { success: false, error: "Gagal menyimpan data master option." };
  }
}

export async function deleteMasterOptionAction(id: string) {
  try {
    await db.delete(masterOptions).where(eq(masterOptions.id, id));
    revalidatePath("/admin/master-cuti");
    return { success: true };
  } catch (error) {
    console.error("Error deleteMasterOptionAction:", error);
    return { success: false, error: "Gagal menghapus data master option." };
  }
}

export async function seedMasterOptionsAction() {
  try {
    const JENIS_CUTI = [
      "Cuti Tahunan",
      "Cuti Besar",
      "Cuti Sakit",
      "Cuti Bersalin",
      "Cuti Alasan Penting",
      "Cuti Di Luar Tanggungan Negara",
    ];
    const JENIS_PEGAWAI = ["PNS", "PPPK"];

    // Cek apakah sudah ada data
    const existing = await db.query.masterOptions.findFirst();
    if (existing) {
      return { success: false, error: "Data master sudah terisi, operasi seed dibatalkan untuk mencegah duplikasi." };
    }

    let order = 1;
    for (const cuti of JENIS_CUTI) {
      await db.insert(masterOptions).values({ category: "jenis_cuti", value: cuti, label: cuti, sortOrder: order++ });
    }

    order = 1;
    for (const peg of JENIS_PEGAWAI) {
      await db.insert(masterOptions).values({ category: "jenis_pegawai", value: peg, label: peg, sortOrder: order++ });
    }

    order = 1;
    for (const unit of UNIT_KERJA_OPTIONS) {
      await db.insert(masterOptions).values({ category: "unit_kerja", value: unit, label: unit, sortOrder: order++ });
    }

    revalidatePath("/admin/master-cuti");
    return { success: true };
  } catch (error) {
    console.error("Error seedMasterOptionsAction:", error);
    return { success: false, error: "Gagal melakukan seeding master options." };
  }
}
