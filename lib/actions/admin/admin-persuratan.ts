"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth";
import { z } from "zod";
import { PersuratanService, SHEETS } from "@/lib/services/persuratan-service";
import { updateSheetRow, getSheetData } from "@/lib/google-sheets";

export type ActionResult = {
  success: boolean;
  message?: string;
  error?: string;
  data?: any;
};

const SuratMasukSchema = z.object({
  id: z.string().optional().or(z.literal("")),
  nomor_surat: z.string().min(1, "Nomor surat wajib diisi"),
  tanggal_surat: z.string().min(1, "Tanggal surat wajib diisi"),
  tanggal_terima: z.string().min(1, "Tanggal terima wajib diisi"),
  asal_surat: z.string().min(1, "Asal surat wajib diisi"),
  perihal: z.string().min(1, "Perihal wajib diisi"),
});

const SuratKeluarSchema = z.object({
  id: z.string().optional().or(z.literal("")),
  nomor_surat: z.string().min(1, "Nomor surat wajib diisi"),
  tanggal_surat: z.string().min(1, "Tanggal surat wajib diisi"),
  agenda: z.string().optional(),
  tujuan_surat: z.string().min(1, "Tujuan surat wajib diisi"),
  perihal: z.string().min(1, "Perihal wajib diisi"),
  unit_kerja: z.string().min(1, "Unit kerja wajib diisi"),
});

// --- UTILS ---

export async function fixSpreadsheetHeadersAction(): Promise<ActionResult> {
  await requirePermission("super_admin");
  try {
    
    await updateSheetRow(`${SHEETS.MASUK}!A1:F1`, [
      ["ID", "Nomor Surat", "Tgl Surat", "Tgl Terima", "Asal Surat", "Perihal"],
    ]);

    await updateSheetRow(`${SHEETS.KELUAR}!A1:G1`, [
      ["ID", "Nomor Surat", "Tanggal Surat", "Agenda", "Tujuan", "Perihal", "Unit Kerja"],
    ]);

    return { success: true, message: "Header spreadsheet berhasil diperbaiki" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal memperbaiki header" };
  }
}

export async function getNextNomorSuratSuggestionAction(
  type: "MASUK" | "KELUAR",
): Promise<string> {
  try {
    const sheetName = type === "MASUK" ? SHEETS.MASUK : SHEETS.KELUAR;
    const data = await getSheetData(`${sheetName}!B2:B10`);
    if (data.length === 0) return "";

    for (const row of data) {
      const lastNomor = row[0];
      if (!lastNomor) continue;
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

// --- SURAT MASUK ---

export async function getSuratMasukAction(): Promise<ActionResult> {
  await requirePermission("surat_masuk");
  try {
    const data = await PersuratanService.getSuratMasuk();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengambil data surat masuk" };
  }
}

export async function saveSuratMasukAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("surat_masuk");
  try {
    const validated = SuratMasukSchema.safeParse({
      id: formData.get("id")?.toString() || "",
      nomor_surat: formData.get("nomor_surat")?.toString() || "",
      tanggal_surat: formData.get("tanggal_surat")?.toString() || "",
      tanggal_terima: formData.get("tanggal_terima")?.toString() || "",
      asal_surat: formData.get("asal_surat")?.toString() || "",
      perihal: formData.get("perihal")?.toString() || "",
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await PersuratanService.saveSuratMasuk(validated.data);

    revalidatePath("/admin/persuratan/surat-masuk");
    return { success: true, message: "Surat masuk berhasil disimpan" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan data surat masuk" };
  }
}

export async function deleteSuratMasukAction(id: string): Promise<ActionResult> {
  await requirePermission("surat_masuk");
  try {
    if (!id) return { success: false, error: "ID tidak valid" };

    await PersuratanService.deleteSuratMasuk(id);
    
    revalidatePath("/admin/persuratan/surat-masuk");
    return { success: true, message: "Surat masuk berhasil dihapus" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus data surat masuk" };
  }
}

// --- SURAT KELUAR ---

export async function getSuratKeluarAction(): Promise<ActionResult> {
  await requirePermission("surat_keluar");
  try {
    const data = await PersuratanService.getSuratKeluar();
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal mengambil data surat keluar" };
  }
}

export async function saveSuratKeluarAction(formData: FormData): Promise<ActionResult> {
  await requirePermission("surat_keluar");
  try {
    const validated = SuratKeluarSchema.safeParse({
      id: formData.get("id")?.toString() || "",
      nomor_surat: formData.get("nomor_surat")?.toString() || "",
      tanggal_surat: formData.get("tanggal_surat")?.toString() || "",
      agenda: formData.get("agenda")?.toString() || "",
      tujuan_surat: formData.get("tujuan_surat")?.toString() || "",
      perihal: formData.get("perihal")?.toString() || "",
      unit_kerja: formData.get("unit_kerja")?.toString() || "",
    });

    if (!validated.success) {
      return { success: false, error: validated.error.issues[0].message };
    }

    await PersuratanService.saveSuratKeluar(validated.data);

    revalidatePath("/admin/persuratan/surat-keluar");
    return { success: true, message: "Surat keluar berhasil disimpan" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menyimpan data surat keluar" };
  }
}

export async function deleteSuratKeluarAction(id: string): Promise<ActionResult> {
  await requirePermission("surat_keluar");
  try {
    if (!id) return { success: false, error: "ID tidak valid" };

    await PersuratanService.deleteSuratKeluar(id);
    
    revalidatePath("/admin/persuratan/surat-keluar");
    return { success: true, message: "Surat keluar berhasil dihapus" };
  } catch (error: any) {
    return { success: false, error: error.message || "Gagal menghapus data surat keluar" };
  }
}
