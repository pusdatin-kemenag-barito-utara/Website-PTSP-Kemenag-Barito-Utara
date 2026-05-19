import {
  appendToSheet,
  getSheetData,
  prependToSheet,
  updateSheetRow,
  deleteSheetRow,
} from "@/lib/google-sheets";

export const SHEETS = {
  MASUK: "Surat Masuk",
  KELUAR: "Surat Keluar",
};

export class PersuratanService {
  /**
   * Check if a nomor surat already exists in the specified sheet
   */
  static async checkDuplicateNomorSurat(
    sheetName: string,
    nomor: string,
    excludeId?: string
  ) {
    const data = await getSheetData(`${sheetName}!A:B`);
    return data.some((row: any) => row[1] === nomor && row[0] !== excludeId);
  }

  /**
   * Generate the next ID for a given sheet and prefix
   */
  static async generateNextId(sheetName: string, prefix: string) {
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

  /**
   * Fetch all data for Surat Masuk
   */
  static async getSuratMasuk() {
    const data = await getSheetData(`${SHEETS.MASUK}!A2:F`);
    return data
      .filter((row: any) => row[0]) // Ensure ID exists
      .map((row: any) => ({
        id: row[0],
        nomor_surat: row[1] || "",
        tanggal_surat: row[2] || "",
        tanggal_terima: row[3] || "",
        asal_surat: row[4] || "",
        perihal: row[5] || "",
      }));
  }

  /**
   * Save (Create or Update) Surat Masuk
   */
  static async saveSuratMasuk(data: any) {
    const { id, nomor_surat, tanggal_surat, tanggal_terima, asal_surat, perihal } = data;
    
    const isDuplicate = await this.checkDuplicateNomorSurat(SHEETS.MASUK, nomor_surat, id);
    if (isDuplicate) throw new Error(`Nomor surat "${nomor_surat}" sudah terdaftar.`);

    if (id) {
      const allData = await getSheetData(`${SHEETS.MASUK}!A:A`);
      const rowIndex = allData.findIndex((row: any) => row[0] === id);
      if (rowIndex === -1) throw new Error("Data surat tidak ditemukan.");

      await updateSheetRow(
        `${SHEETS.MASUK}!A${rowIndex + 1}:F${rowIndex + 1}`,
        [[id, nomor_surat, tanggal_surat, tanggal_terima, asal_surat, perihal]]
      );
    } else {
      const newId = await this.generateNextId(SHEETS.MASUK, "SM");
      await prependToSheet(SHEETS.MASUK, [
        [newId, nomor_surat, tanggal_surat, tanggal_terima, asal_surat, perihal],
      ]);
    }
  }

  /**
   * Delete Surat Masuk by ID
   */
  static async deleteSuratMasuk(id: string) {
    const allData = await getSheetData(`${SHEETS.MASUK}!A:A`);
    const rowIndex = allData.findIndex((row: any) => row[0] === id);
    if (rowIndex === -1) throw new Error("Data surat tidak ditemukan.");
    await deleteSheetRow(SHEETS.MASUK, rowIndex);
  }

  /**
   * Fetch all data for Surat Keluar
   */
  static async getSuratKeluar() {
    const data = await getSheetData(`${SHEETS.KELUAR}!A2:G`);
    return data
      .filter((row: any) => row[0]) // Ensure ID exists
      .map((row: any) => ({
        id: row[0],
        nomor_surat: row[1] || "",
        tanggal_surat: row[2] || "",
        agenda: row[3] || "",
        tujuan_surat: row[4] || "",
        perihal: row[5] || "",
        unit_kerja: row[6] || "",
      }));
  }

  /**
   * Save (Create or Update) Surat Keluar
   */
  static async saveSuratKeluar(data: any) {
    const { id, nomor_surat, tanggal_surat, agenda, tujuan_surat, perihal, unit_kerja } = data;

    const isDuplicate = await this.checkDuplicateNomorSurat(SHEETS.KELUAR, nomor_surat, id);
    if (isDuplicate) throw new Error(`Nomor surat "${nomor_surat}" sudah terdaftar.`);

    if (id) {
      const allData = await getSheetData(`${SHEETS.KELUAR}!A:A`);
      const rowIndex = allData.findIndex((row: any) => row[0] === id);
      if (rowIndex === -1) throw new Error("Data surat tidak ditemukan.");

      await updateSheetRow(
        `${SHEETS.KELUAR}!A${rowIndex + 1}:G${rowIndex + 1}`,
        [[id, nomor_surat, tanggal_surat, agenda || "", tujuan_surat, perihal, unit_kerja]]
      );
    } else {
      const newId = await this.generateNextId(SHEETS.KELUAR, "SK");
      await prependToSheet(SHEETS.KELUAR, [
        [newId, nomor_surat, tanggal_surat, agenda || "", tujuan_surat, perihal, unit_kerja],
      ]);
    }
  }

  /**
   * Delete Surat Keluar by ID
   */
  static async deleteSuratKeluar(id: string) {
    const allData = await getSheetData(`${SHEETS.KELUAR}!A:A`);
    const rowIndex = allData.findIndex((row: any) => row[0] === id);
    if (rowIndex === -1) throw new Error("Data surat tidak ditemukan.");
    await deleteSheetRow(SHEETS.KELUAR, rowIndex);
  }
}
