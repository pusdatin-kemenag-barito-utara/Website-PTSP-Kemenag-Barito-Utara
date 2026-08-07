"use server";

import { fetchAPI } from "@/lib/api";
import { revalidatePath } from "next/cache";

export async function getMasterOptionsAction(category?: string) {
  try {
    const res = await fetchAPI<any>("/master-options");
    if (res && res.data && Array.isArray(res.data)) {
      let data = res.data;
      if (category) {
        data = data.filter((item: any) => item.category === category);
      }
      return { success: true, data };
    }
    return { success: true, data: [] };
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
    const res = await fetchAPI<any>("/admin/master-options", {
      method: "POST",
      body: JSON.stringify({
        id: data.id || undefined,
        category: data.category,
        value: data.value,
        label: data.label,
        sortOrder: data.sortOrder ?? 0,
        isActive: data.isActive ?? true,
      }),
    });

    revalidatePath("/admin/master-cuti");
    return {
      success: true,
      data: res.data,
      message: res.message || "Berhasil menyimpan master option.",
    };
  } catch (error: any) {
    console.error("Error upsertMasterOptionAction:", error);
    return {
      success: false,
      error: error.message || "Gagal menyimpan data master option.",
    };
  }
}

export async function deleteMasterOptionAction(id: string) {
  try {
    const res = await fetchAPI<any>(`/admin/master-options/${id}`, {
      method: "DELETE",
    });

    revalidatePath("/admin/master-cuti");
    return {
      success: true,
      message: res.message || "Berhasil menghapus master option.",
    };
  } catch (error: any) {
    console.error("Error deleteMasterOptionAction:", error);
    return {
      success: false,
      error: error.message || "Gagal menghapus data master option.",
    };
  }
}

export async function seedMasterOptionsAction() {
  try {
    const defaultOptions = [
      {
        category: "jenis_cuti",
        value: "cuti_tahunan",
        label: "Cuti Tahunan",
        sortOrder: 1,
        isActive: true,
      },
      {
        category: "jenis_cuti",
        value: "cuti_besar",
        label: "Cuti Besar",
        sortOrder: 2,
        isActive: true,
      },
      {
        category: "jenis_cuti",
        value: "cuti_sakit",
        label: "Cuti Sakit",
        sortOrder: 3,
        isActive: true,
      },
      {
        category: "jenis_cuti",
        value: "cuti_bersalin",
        label: "Cuti Bersalin",
        sortOrder: 4,
        isActive: true,
      },
      {
        category: "jenis_cuti",
        value: "cuti_alasan_penting",
        label: "Cuti Karena Alasan Penting",
        sortOrder: 5,
        isActive: true,
      },
    ];

    for (const option of defaultOptions) {
      await fetchAPI("/admin/master-options", {
        method: "POST",
        body: JSON.stringify(option),
      });
    }

    revalidatePath("/admin/master-cuti");
    return { success: true, message: "Master options berhasil di-seed." };
  } catch (error: any) {
    console.error("Error seedMasterOptionsAction:", error);
    return {
      success: false,
      error: error.message || "Gagal melakukan seeding master options.",
    };
  }
}
