"use server";

import { unstable_cache } from "next/cache";

// Fungsi untuk mengambil dan mem-parsing CSV. Fungsi ini akan di-cache oleh Next.js
const fetchAndParseCSV = unstable_cache(
  async () => {
    console.log("[CekCuti] Cache miss! Fetching fresh data from Google Sheets...");
    const url = "https://docs.google.com/spreadsheets/d/1NKXcD-NrOT7nPIrW_8mkQEZLzY3ZP3n2oRJCgvj4xCc/export?format=csv&gid=45141612";
    
    // Fetch fresh data
    const res = await fetch(url, { cache: "no-store" });
    
    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("Dokumen Google Sheet masih terkunci (Private). Harap ubah ke 'Anyone with the link can view'.");
      }
      throw new Error(`Gagal mengambil data dari server Google (status ${res.status}).`);
    }
    
    const csvText = await res.text();
    
    // Simple state machine CSV parser
    const rows: string[][] = [];
    let row: string[] = [];
    let inQuotes = false;
    let field = "";
    
    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      if (inQuotes) {
        if (char === '"' && csvText[i+1] === '"') {
          field += '"';
          i++; 
        } else if (char === '"') {
          inQuotes = false;
        } else {
          field += char;
        }
      } else {
        if (char === '"') {
          inQuotes = true;
        } else if (char === ',') {
          row.push(field.trim());
          field = "";
        } else if (char === '\n' || char === '\r') {
          if (char === '\r' && csvText[i+1] === '\n') {
            i++; 
          }
          row.push(field.trim());
          rows.push(row);
          row = [];
          field = "";
        } else {
          field += char;
        }
      }
    }
    if (field || row.length > 0) {
      row.push(field.trim());
      rows.push(row);
    }
    
    // Cari baris header
    const COL_NIP = 3; // D
    let headerRowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      const cellValue = (rows[i][COL_NIP] || "").trim().toUpperCase();
      if (cellValue === "NIP") {
        headerRowIndex = i;
        break;
      }
    }
    
    if (headerRowIndex === -1) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i].some(cell => cell.trim().toLowerCase() === "nip")) {
          headerRowIndex = i;
          break;
        }
      }
    }
    
    if (headerRowIndex === -1) {
      throw new Error("Format Google Sheet tidak valid: Kolom 'NIP' tidak ditemukan.");
    }
    
    // Kembalikan hanya baris data (tanpa header ke atas) agar cache bersih dan rapi
    return rows.slice(headerRowIndex + 1);
  },
  ['google-sheet-cuti-data'], // Cache key
  { revalidate: 31536000, tags: ['cuti-data'] } // Cache selama 1 Tahun! Hanya direset oleh Webhook dari Google Sheet
);

export async function checkLeaveAction(nip: string) {
  try {
    // 1. Ambil seluruh data pegawai (Ini akan instan jika sudah ada di cache Vercel)
    const dataRows = await fetchAndParseCSV();
    
    // 2. Kolom tetap berdasarkan audit CSV Google Sheet (ada kolom kosong di awal, geser +1):
    const COL_NAMA = 2;        // C
    const COL_NIP = 3;         // D
    const COL_JABATAN = 4;     // E
    const COL_JUMLAH_CUTI = 28; // AC
    const COL_PENTING = 41;    // AP
    const COL_BERSALIN = 42;   // AQ
    const COL_SAKIT = 43;      // AR
    const COL_SISA = 44;       // AS
    
    // 3. Lakukan pencarian spesifik untuk user yang meminta saat ini
    const targetRow = dataRows.find(r => {
      const cellNip = (r[COL_NIP] || "").replace(/[^0-9]/g, "");
      return cellNip === nip;
    });
    
    if (!targetRow) {
      return { error: "Data Tidak Ditemukan" };
    }
    
    // 4. Format hasil
    const data = {
      name: (targetRow[COL_NAMA] || "-").trim(),
      nip: (targetRow[COL_NIP] || "-").trim(),
      jabatan: (targetRow[COL_JABATAN] || "-").trim(),
      totalCuti: parseInt(targetRow[COL_JUMLAH_CUTI]) || 0,
      cutiPenting: parseInt(targetRow[COL_PENTING]) || 0,
      cutiBersalin: parseInt(targetRow[COL_BERSALIN]) || 0,
      cutiSakit: parseInt(targetRow[COL_SAKIT]) || 0,
      sisaCuti: parseInt(targetRow[COL_SISA]) || 0,
      tahun: new Date().getFullYear(),
      status: "Aktif"
    };
    
    return { data };
  } catch (error: any) {
    console.error("Error in checkLeaveAction:", error);
    return { error: error.message || "Terjadi kesalahan internal saat memproses data." };
  }
}
