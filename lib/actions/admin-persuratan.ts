"use server";

import { revalidatePath } from "next/cache";
import {
  appendToSheet,
  getSheetData,
  prependToSheet,
  updateSheetRow,
  deleteSheetRow,
} from "@/lib/google-sheets";
import { requireAdmin } from "@/lib/auth";

const SHEETS = {
  MASUK: "Surat Masuk",
  KELUAR: "Surat Keluar",
};

// --- PRIVATE HELPERS ---

async function checkDuplicateNomorSurat(
  sheetName: string,
  nomor: string,
  excludeId?: string,
) {
  const data = await getSheetData(`${sheetName}!A:B`); // ID and Nomor Surat
  return data.some((row: any) => row[1] === nomor && row[0] !== excludeId);
}

async function generateNextId(sheetName: string, prefix: string) {
  const data = await getSheetData(`${sheetName}!A:A`);
  const year = new Date().getFullYear();
  const pattern = new RegExp(`^${prefix}-${year}-(\\d+)$`);

  let maxNum = 0;
  data.forEach((row: any) => {
    const match = String(row[0]).match(pattern);
    if (match) {
      const num = parseInt(match[1]);
      if (num > maxNum) maxNum = num;
    }
  });

  return `${prefix}-${year}-${String(maxNum + 1).padStart(3, "0")}`;
}

export async function getNextNomorSuratSuggestionAction(
  type: "MASUK" | "KELUAR",
) {
  try {
    const sheetName = type === "MASUK" ? SHEETS.MASUK : SHEETS.KELUAR;
    const data = await getSheetData(`${sheetName}!B2:B10`); // Check top few entries
    if (data.length === 0) return "";

    // Find the first valid nomor surat to increment
    for (const row of data) {
      const lastNomor = row[0];
      if (!lastNomor) continue;

      // Matches something like "B-123/..." or "123/..."
      const match = lastNomor.match(/^([^\d]*)(\d+)(.*)$/);
      if (match) {
        const prefix = match[1];
        const num = parseInt(match[2]);
        const suffix = match[3];
        return `${prefix}${num + 1}${suffix}`;
      }
    }
    return "";
  } catch (error) {
    return "";
  }
}

// --- UTILS ---
export async function fixSpreadsheetHeadersAction() {
  try {
    // Fix Surat Masuk Headers (Row 1)
    await updateSheetRow(`${SHEETS.MASUK}!A1:F1`, [
      ["ID", "Nomor Surat", "Tgl Surat", "Tgl Terima", "Asal Surat", "Perihal"],
    ]);

    // Fix Surat Keluar Headers (Row 1)
    await updateSheetRow(`${SHEETS.KELUAR}!A1:G1`, [
      [
        "ID",
        "Nomor Surat",
        "Tanggal Surat",
        "Agenda",
        "Tujuan",
        "Perihal",
        "Unit Kerja",
      ],
    ]);

    return { success: true };
  } catch (error) {
    console.error("Error fixing headers:", error);
    throw error;
  }
}

// --- SURAT MASUK ---

export async function getSuratMasukAction() {
  try {
    const data = await getSheetData(`${SHEETS.MASUK}!A2:F`);
    return {
      success: true,
      data: data.map((row: any) => ({
        id: row[0],
        nomor_surat: row[1],
        tanggal_surat: row[2],
        tanggal_terima: row[3],
        asal_surat: row[4],
        perihal: row[5],
      })),
    };
  } catch (error: any) {
    console.error("Error fetching Surat Masuk:", error);
    return { success: false, error: error.message };
  }
}

export async function saveSuratMasukAction(formData: FormData) {
  try {
    const profile = await requireAdmin();
    const id = (formData.get("id") as string) || "";
    const nomor_surat = (formData.get("nomor_surat") as string) || "";
    const tanggal_surat = (formData.get("tanggal_surat") as string) || "";
    const tanggal_terima = (formData.get("tanggal_terima") as string) || "";
    const asal_surat = (formData.get("asal_surat") as string) || "";
    const perihal = (formData.get("perihal") as string) || "";

    // Check permissions if not super admin
    if (profile.role !== "super_admin") {
      const permissions = (profile.permissions as string[]) || [];
      if (!permissions.includes("surat_masuk")) {
        return {
          error: "Anda tidak memiliki hak akses untuk mengelola Surat Masuk.",
        };
      }
    }

    // Duplicate check
    const isDuplicate = await checkDuplicateNomorSurat(
      SHEETS.MASUK,
      nomor_surat,
      id,
    );
    if (isDuplicate) {
      return {
        error: `Nomor surat "${nomor_surat}" sudah terdaftar di sistem.`,
      };
    }

    if (id) {
      const allData = await getSheetData(`${SHEETS.MASUK}!A:A`);
      const rowIndex = allData.findIndex((row: any) => row[0] === id);
      if (rowIndex === -1) return { error: "Data surat tidak ditemukan." };

      await updateSheetRow(
        `${SHEETS.MASUK}!A${rowIndex + 1}:F${rowIndex + 1}`,
        [[id, nomor_surat, tanggal_surat, tanggal_terima, asal_surat, perihal]],
      );
    } else {
      // Create Mode: Prepend (Insert at top)
      const newId = await generateNextId(SHEETS.MASUK, "SM");
      await prependToSheet(SHEETS.MASUK, [
        [
          newId,
          nomor_surat,
          tanggal_surat,
          tanggal_terima,
          asal_surat,
          perihal,
        ],
      ]);
    }

    revalidatePath("/admin/persuratan/surat-masuk");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving Surat Masuk:", error);
    return {
      error:
        error.message ||
        "Terjadi kesalahan saat menyimpan data ke Google Sheets.",
    };
  }
}

export async function deleteSuratMasukAction(id: string) {
  try {
    const profile = await requireAdmin();
    // Check permissions if not super admin
    if (profile.role !== "super_admin") {
      const permissions = (profile.permissions as string[]) || [];
      if (!permissions.includes("surat_masuk")) {
        return {
          error: "Anda tidak memiliki hak akses untuk menghapus Surat Masuk.",
        };
      }
    }

    const allData = await getSheetData(`${SHEETS.MASUK}!A:A`);
    const rowIndex = allData.findIndex((row: any) => row[0] === id);
    if (rowIndex === -1) return { error: "Data surat tidak ditemukan." };

    await deleteSheetRow(SHEETS.MASUK, rowIndex);
    revalidatePath("/admin/persuratan/surat-masuk");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting Surat Masuk:", error);
    return { error: error.message || "Terjadi kesalahan saat menghapus data." };
  }
}

// --- SURAT KELUAR ---

export async function getSuratKeluarAction() {
  try {
    const data = await getSheetData(`${SHEETS.KELUAR}!A2:G`);
    return {
      success: true,
      data: data.map((row: any) => ({
        id: row[0],
        nomor_surat: row[1],
        tanggal_surat: row[2],
        agenda: row[3],
        tujuan_surat: row[4],
        perihal: row[5],
        unit_kerja: row[6],
      })),
    };
  } catch (error: any) {
    console.error("Error fetching Surat Keluar:", error);
    return { success: false, error: error.message };
  }
}

export async function saveSuratKeluarAction(formData: FormData) {
  try {
    const profile = await requireAdmin();
    const id = (formData.get("id") as string) || "";
    const nomor_surat = (formData.get("nomor_surat") as string) || "";
    const tanggal_surat = (formData.get("tanggal_surat") as string) || "";
    const tujuan_surat = (formData.get("tujuan_surat") as string) || "";
    const perihal = (formData.get("perihal") as string) || "";
    const unit_kerja = (formData.get("unit_kerja") as string) || "";
    const agenda = (formData.get("agenda") as string) || "";

    // Check permissions if not super admin
    if (profile.role !== "super_admin") {
      const permissions = (profile.permissions as string[]) || [];
      if (!permissions.includes("surat_keluar")) {
        return {
          error: "Anda tidak memiliki hak akses untuk mengelola Surat Keluar.",
        };
      }
    }

    // Duplicate check
    const isDuplicate = await checkDuplicateNomorSurat(
      SHEETS.KELUAR,
      nomor_surat,
      id,
    );
    if (isDuplicate) {
      return {
        error: `Nomor surat "${nomor_surat}" sudah terdaftar di sistem.`,
      };
    }

    if (id) {
      const allData = await getSheetData(`${SHEETS.KELUAR}!A:A`);
      const rowIndex = allData.findIndex((row: any) => row[0] === id);
      if (rowIndex === -1) return { error: "Data surat tidak ditemukan." };

      await updateSheetRow(
        `${SHEETS.KELUAR}!A${rowIndex + 1}:G${rowIndex + 1}`,
        [
          [
            id,
            nomor_surat,
            tanggal_surat,
            agenda,
            tujuan_surat,
            perihal,
            unit_kerja,
          ],
        ],
      );
    } else {
      // Create Mode: Prepend (Insert at top)
      const newId = await generateNextId(SHEETS.KELUAR, "SK");
      await prependToSheet(SHEETS.KELUAR, [
        [
          newId,
          nomor_surat,
          tanggal_surat,
          agenda,
          tujuan_surat,
          perihal,
          unit_kerja,
        ],
      ]);
    }

    revalidatePath("/admin/persuratan/surat-keluar");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving Surat Keluar:", error);
    return { error: error.message || "Terjadi kesalahan saat menyimpan data." };
  }
}

export async function deleteSuratKeluarAction(id: string) {
  try {
    const profile = await requireAdmin();
    // Check permissions if not super admin
    if (profile.role !== "super_admin") {
      const permissions = (profile.permissions as string[]) || [];
      if (!permissions.includes("surat_keluar")) {
        return {
          error: "Anda tidak memiliki hak akses untuk menghapus Surat Keluar.",
        };
      }
    }

    const allData = await getSheetData(`${SHEETS.KELUAR}!A:A`);
    const rowIndex = allData.findIndex((row: any) => row[0] === id);
    if (rowIndex === -1) return { error: "Data surat tidak ditemukan." };

    await deleteSheetRow(SHEETS.KELUAR, rowIndex);
    revalidatePath("/admin/persuratan/surat-keluar");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting Surat Keluar:", error);
    return { error: error.message || "Terjadi kesalahan saat menghapus data." };
  }
}
