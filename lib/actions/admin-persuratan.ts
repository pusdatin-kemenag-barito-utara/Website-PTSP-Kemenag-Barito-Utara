"use server";

import { revalidatePath } from "next/cache";
import {
  appendToSheet,
  getSheetData,
  prependToSheet,
  updateSheetRow,
  deleteSheetRow,
} from "@/lib/google-sheets";

const SHEETS = {
  MASUK: "Surat Masuk",
  KELUAR: "Surat Keluar",
};

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
    return data.map((row) => ({
      id: row[0],
      nomor_surat: row[1],
      tanggal_surat: row[2],
      tanggal_terima: row[3],
      asal_surat: row[4],
      perihal: row[5],
    }));
  } catch (error) {
    console.error("Error fetching Surat Masuk:", error);
    return [];
  }
}

export async function saveSuratMasukAction(formData: FormData) {
  const id = (formData.get("id") as string) || "";
  const nomor_surat = (formData.get("nomor_surat") as string) || "";
  const tanggal_surat = (formData.get("tanggal_surat") as string) || "";
  const tanggal_terima = (formData.get("tanggal_terima") as string) || "";
  const asal_surat = (formData.get("asal_surat") as string) || "";
  const perihal = (formData.get("perihal") as string) || "";

  try {
    if (id) {
      const allData = await getSheetData(`${SHEETS.MASUK}!A:A`);
      const rowIndex = allData.findIndex((row) => row[0] === id);
      if (rowIndex === -1) throw new Error("Data not found");

      await updateSheetRow(
        `${SHEETS.MASUK}!A${rowIndex + 1}:F${rowIndex + 1}`,
        [[id, nomor_surat, tanggal_surat, tanggal_terima, asal_surat, perihal]],
      );
    } else {
      // Create Mode: Prepend (Insert at top)
      const newId = Math.random().toString(36).substr(2, 9).toUpperCase();
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
  } catch (error) {
    console.error("Error saving Surat Masuk:", error);
    throw error;
  }
}

export async function deleteSuratMasukAction(id: string) {
  try {
    const allData = await getSheetData(`${SHEETS.MASUK}!A:A`);
    const rowIndex = allData.findIndex((row) => row[0] === id);
    if (rowIndex === -1) throw new Error("Data not found");

    await deleteSheetRow(SHEETS.MASUK, rowIndex);
    revalidatePath("/admin/persuratan/surat-masuk");
  } catch (error) {
    console.error("Error deleting Surat Masuk:", error);
    throw error;
  }
}

// --- SURAT KELUAR ---

export async function getSuratKeluarAction() {
  try {
    const data = await getSheetData(`${SHEETS.KELUAR}!A2:G`);
    return data.map((row) => ({
      id: row[0],
      nomor_surat: row[1],
      tanggal_surat: row[2],
      agenda: row[3],
      tujuan_surat: row[4],
      perihal: row[5],
      unit_kerja: row[6],
    }));
  } catch (error) {
    console.error("Error fetching Surat Keluar:", error);
    return [];
  }
}

export async function saveSuratKeluarAction(formData: FormData) {
  const id = (formData.get("id") as string) || "";
  const nomor_surat = (formData.get("nomor_surat") as string) || "";
  const tanggal_surat = (formData.get("tanggal_surat") as string) || "";
  const tujuan_surat = (formData.get("tujuan_surat") as string) || "";
  const perihal = (formData.get("perihal") as string) || "";
  const unit_kerja = (formData.get("unit_kerja") as string) || "";
  const agenda = (formData.get("agenda") as string) || "";

  try {
    if (id) {
      const allData = await getSheetData(`${SHEETS.KELUAR}!A:A`);
      const rowIndex = allData.findIndex((row) => row[0] === id);
      if (rowIndex === -1) throw new Error("Data not found");

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
      const newId = Math.random().toString(36).substr(2, 9).toUpperCase();
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
  } catch (error) {
    console.error("Error saving Surat Keluar:", error);
    throw error;
  }
}

export async function deleteSuratKeluarAction(id: string) {
  try {
    const allData = await getSheetData(`${SHEETS.KELUAR}!A:A`);
    const rowIndex = allData.findIndex((row) => row[0] === id);
    if (rowIndex === -1) throw new Error("Data not found");

    await deleteSheetRow(SHEETS.KELUAR, rowIndex);
    revalidatePath("/admin/persuratan/surat-keluar");
  } catch (error) {
    console.error("Error deleting Surat Keluar:", error);
    throw error;
  }
}
